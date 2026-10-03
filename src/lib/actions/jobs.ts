"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, esc, emailButton } from "@/lib/email";
import { isAllowedLogoType, saveLogoFile } from "@/lib/storage";
import { hasActiveSubscription } from "@/lib/actions/subscription";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

function toIntOrNull(value: FormDataEntryValue | null) {
  if (!value || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export async function saveJob(_prevState: string | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && session.user.role !== "EMPLOYER") throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const locationChoice = String(formData.get("locationChoice") ?? "").trim();
  const location =
    locationChoice === "Other" ? String(formData.get("locationOther") ?? "").trim() : locationChoice;
  const remoteType = String(formData.get("remoteType") ?? "REMOTE");
  const employmentType = String(formData.get("employmentType") ?? "FULL_TIME");
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .join(",");
  const applyUrl = String(formData.get("applyUrl") ?? "").trim() || null;
  const applyEmail = String(formData.get("applyEmail") ?? "").trim() || null;
  const companyAddress = String(formData.get("companyAddress") ?? "").trim() || null;
  const companyEmail = String(formData.get("companyEmail") ?? "").trim() || null;
  const companyPhone = String(formData.get("companyPhone") ?? "").trim() || null;
  const salaryMin = toIntOrNull(formData.get("salaryMin"));
  const salaryMax = toIntOrNull(formData.get("salaryMax"));
  const questions = String(formData.get("questions") ?? "")
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean);

  if (!title || !company || !category || !description || !location) {
    return "Title, company, category, description, and location are required.";
  }

  const logoFile = formData.get("logo");
  let logoUrl = String(formData.get("existingLogoUrl") ?? "") || null;
  if (logoFile instanceof File && logoFile.size > 0) {
    if (!isAllowedLogoType(logoFile.type)) {
      return "Company logo must be a PNG, JPEG, WebP, or SVG image.";
    }
    logoUrl = await saveLogoFile(logoFile);
  }

  const data = {
    title,
    company,
    category,
    description,
    location,
    remoteType: remoteType as "REMOTE" | "HYBRID" | "ONSITE",
    employmentType: employmentType as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP",
    tags,
    applyUrl,
    applyEmail,
    logoUrl,
    companyAddress,
    companyEmail,
    companyPhone,
    salaryMin,
    salaryMax,
  };

  const questionRows = questions.map((question, order) => ({ question, order }));

  if (id) {
    // ponytail: employers can't edit after posting yet; add an owner + DRAFT check if that's wanted.
    if (!isAdmin) throw new Error("Unauthorized");
    await prisma.$transaction([
      prisma.job.update({ where: { id }, data }),
      prisma.jobQuestion.deleteMany({ where: { jobId: id } }),
      prisma.jobQuestion.createMany({ data: questionRows.map((q) => ({ ...q, jobId: id })) }),
    ]);
  } else {
    await prisma.job.create({
      data: {
        ...data,
        // Admin jobs go live; employer jobs go to review if their plan is active, else wait as a draft.
        status: isAdmin ? "PUBLISHED" : (await hasActiveSubscription(session.user.id)) ? "PENDING" : "DRAFT",
        postedById: session.user.id,
        questions: { create: questionRows },
      },
    });
  }

  updateTag("jobs");
  revalidatePath("/");
  revalidatePath("/admin/jobs");
  revalidatePath("/dashboard/jobs");
  redirect(isAdmin ? "/admin/jobs" : "/dashboard/jobs");
}

export async function toggleJobActive(jobId: string) {
  await requireAdmin();
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  if (job.status !== "PUBLISHED" && job.status !== "CLOSED") throw new Error("Only live or closed jobs can be toggled.");
  await prisma.job.update({
    where: { id: jobId },
    data: { status: job.status === "PUBLISHED" ? "CLOSED" : "PUBLISHED" },
  });
  updateTag("jobs");
  revalidatePath("/");
  revalidatePath("/admin/jobs");
}

async function reviewJob(jobId: string, status: "PUBLISHED" | "REJECTED") {
  await requireAdmin();
  // updateMany on status: PENDING makes a double-click or stale tab a no-op.
  const { count } = await prisma.job.updateMany({ where: { id: jobId, status: "PENDING" }, data: { status } });
  if (!count) return;

  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId }, include: { postedBy: true } });
  await sendEmail({
    to: job.postedBy.email,
    subject: `Your job "${job.title}" was ${status === "PUBLISHED" ? "approved" : "rejected"}`,
    html:
      status === "PUBLISHED"
        ? `<h2 style="margin:0 0 12px;font-size:20px;">Your job is live 🎉</h2><p style="margin:0;">Your listing <strong>${esc(job.title)}</strong> has been approved and is now visible to job seekers.</p>${emailButton(`${process.env.APP_URL ?? "http://localhost:3000"}/dashboard/jobs`, "View my listings")}`
        : `<h2 style="margin:0 0 12px;font-size:20px;">Listing not approved</h2><p style="margin:0;">Your listing <strong>${esc(job.title)}</strong> wasn't approved. You can post a corrected listing any time while your plan is active. See our <a href="${process.env.APP_URL ?? "http://localhost:3000"}/terms" style="color:#000;">Terms</a> for our listing rules.</p>`,
  });

  updateTag("jobs");
  revalidatePath("/");
  revalidatePath("/admin/jobs");
  revalidatePath("/dashboard/jobs");
}

export async function approveJob(jobId: string) {
  await reviewJob(jobId, "PUBLISHED");
}

export async function rejectJob(jobId: string) {
  await reviewJob(jobId, "REJECTED");
}

export async function deleteJob(jobId: string) {
  await requireAdmin();
  await prisma.job.delete({ where: { id: jobId } });
  updateTag("jobs");
  revalidatePath("/");
  revalidatePath("/admin/jobs");
}

const APPLICATION_STATUSES = ["PENDING", "REVIEWED", "REJECTED", "ACCEPTED"] as const;

// Admins can update any application; employers only those on jobs they posted.
export async function updateApplicationStatus(applicationId: string, status: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!APPLICATION_STATUSES.includes(status as (typeof APPLICATION_STATUSES)[number])) throw new Error("Invalid status");

  const owned = await prisma.application.findUnique({ where: { id: applicationId }, select: { job: { select: { postedById: true } } } });
  if (!owned) throw new Error("Not found");
  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && !(session.user.role === "EMPLOYER" && owned.job.postedById === session.user.id)) throw new Error("Unauthorized");

  const application = await prisma.application.update({
    where: { id: applicationId },
    data: { status: status as "PENDING" | "REVIEWED" | "REJECTED" | "ACCEPTED" },
    include: { applicant: true, job: true },
  });

  await sendEmail({
    to: application.applicant.email,
    subject: `Your application for ${application.job.title} was updated`,
    html: `<h2 style="margin:0 0 12px;font-size:20px;">Application update</h2><p style="margin:0;">Your application for <strong>${esc(application.job.title)}</strong> at ${esc(application.job.company)} is now: <strong>${application.status}</strong>.</p>${emailButton(`${process.env.APP_URL ?? "http://localhost:3000"}/dashboard`, "View my applications")}`,
  });

  revalidatePath("/admin/jobs");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/jobs/${application.jobId}/applications`);
}
