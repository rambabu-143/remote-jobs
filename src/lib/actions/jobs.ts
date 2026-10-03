"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, esc, emailButton } from "@/lib/email";
import { isAllowedLogoType, saveLogoFile } from "@/lib/storage";
import { hasActiveSubscription } from "@/lib/actions/subscription";
import { notifyAdminsOfPendingJobs } from "@/lib/notify";

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

  const existing = id
    ? await prisma.job.findUnique({
        where: { id },
        include: { questions: { orderBy: { order: "asc" } }, _count: { select: { applications: true } } },
      })
    : null;
  if (id && !existing) return "Job not found.";
  if (existing && !isAdmin && existing.postedById !== session.user.id) throw new Error("Unauthorized");

  const logoFile = formData.get("logo");
  // The current logo is read from the DB (not the form), so employers can't inject an arbitrary URL.
  let logoUrl = existing?.logoUrl ?? null;
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

  if (existing) {
    // Replacing questions deletes applicants' answers to them (cascade), so only touch them
    // when they actually changed, and don't let employers change them once people have applied.
    const sameQuestions = existing.questions.map((q) => q.question).join("\n") === questions.join("\n");
    if (!sameQuestions && !isAdmin && existing._count.applications > 0) {
      return "Screening questions can't be changed once applications have been received.";
    }

    // Employer edits to anything that was approved (or rejected/closed) go back to review so an
    // approved listing can't be swapped for something else; no active plan -> back to draft.
    let status = existing.status;
    if (!isAdmin && status !== "PENDING") {
      status = (await hasActiveSubscription(session.user.id)) ? "PENDING" : "DRAFT";
    }

    await prisma.$transaction([
      prisma.job.update({ where: { id }, data: { ...data, status } }),
      ...(sameQuestions
        ? []
        : [
            prisma.jobQuestion.deleteMany({ where: { jobId: id } }),
            prisma.jobQuestion.createMany({ data: questionRows.map((q) => ({ ...q, jobId: id })) }),
          ]),
    ]);
    if (!isAdmin && status === "PENDING" && existing.status !== "PENDING") {
      await notifyAdminsOfPendingJobs([{ title, company }], session.user.name);
    }
  } else {
    // Admin jobs go live; employer jobs go to review if their plan is active, else wait as a draft.
    const status = isAdmin ? "PUBLISHED" : (await hasActiveSubscription(session.user.id)) ? "PENDING" : "DRAFT";
    await prisma.job.create({
      data: { ...data, status, postedById: session.user.id, questions: { create: questionRows } },
    });
    if (status === "PENDING") await notifyAdminsOfPendingJobs([{ title, company }], session.user.name);
  }

  updateTag("jobs");
  revalidatePath("/");
  revalidatePath("/admin/jobs");
  revalidatePath("/dashboard/jobs");
  redirect(isAdmin ? "/admin/jobs" : "/dashboard/jobs");
}

// Employers can take their own live job down, and put it back up. CLOSED jobs only ever come
// from approved (PUBLISHED) ones, and any edit sends a job back to review, so reopening is safe.
export async function toggleMyJobActive(jobId: string) {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYER") throw new Error("Unauthorized");
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.postedById !== session.user.id) throw new Error("Unauthorized");
  if (job.status !== "PUBLISHED" && job.status !== "CLOSED") throw new Error("Only live or closed jobs can be toggled.");
  await prisma.job.update({ where: { id: jobId }, data: { status: job.status === "PUBLISHED" ? "CLOSED" : "PUBLISHED" } });
  updateTag("jobs");
  revalidatePath("/");
  revalidatePath("/admin/jobs");
  revalidatePath("/dashboard/jobs");
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
