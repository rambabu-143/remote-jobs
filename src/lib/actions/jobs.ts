"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { isAllowedLogoType, saveLogoFile } from "@/lib/storage";

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
  const session = await requireAdmin();

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
    await prisma.$transaction([
      prisma.job.update({ where: { id }, data }),
      prisma.jobQuestion.deleteMany({ where: { jobId: id } }),
      prisma.jobQuestion.createMany({ data: questionRows.map((q) => ({ ...q, jobId: id })) }),
    ]);
  } else {
    await prisma.job.create({
      data: {
        ...data,
        status: "PUBLISHED",
        postedById: session.user.id,
        questions: { create: questionRows },
      },
    });
  }

  revalidateTag("jobs", "max");
  revalidatePath("/");
  revalidatePath("/admin/jobs");
  redirect("/admin/jobs");
}

export async function toggleJobActive(jobId: string) {
  await requireAdmin();
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  await prisma.job.update({
    where: { id: jobId },
    data: { status: job.status === "PUBLISHED" ? "CLOSED" : "PUBLISHED" },
  });
  revalidateTag("jobs", "max");
  revalidatePath("/");
  revalidatePath("/admin/jobs");
}

export async function deleteJob(jobId: string) {
  await requireAdmin();
  await prisma.job.delete({ where: { id: jobId } });
  revalidateTag("jobs", "max");
  revalidatePath("/");
  revalidatePath("/admin/jobs");
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  await requireAdmin();
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: { status: status as "PENDING" | "REVIEWED" | "REJECTED" | "ACCEPTED" },
    include: { applicant: true, job: true },
  });

  await sendEmail({
    to: application.applicant.email,
    subject: `Your application for ${application.job.title} was updated`,
    html: `<p>Your application status for <strong>${application.job.title}</strong> at ${application.job.company} is now: <strong>${application.status}</strong>.</p>`,
  });

  revalidatePath("/admin/jobs");
  revalidatePath("/dashboard");
}
