"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

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
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const remoteType = String(formData.get("remoteType") ?? "REMOTE");
  const employmentType = String(formData.get("employmentType") ?? "FULL_TIME");
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .join(",");
  const applyUrl = String(formData.get("applyUrl") ?? "").trim() || null;
  const applyEmail = String(formData.get("applyEmail") ?? "").trim() || null;
  const salaryMin = toIntOrNull(formData.get("salaryMin"));
  const salaryMax = toIntOrNull(formData.get("salaryMax"));
  const questions = String(formData.get("questions") ?? "")
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean);

  if (!title || !company || !description || !location) {
    return "Title, company, description, and location are required.";
  }

  const data = {
    title,
    company,
    description,
    location,
    remoteType: remoteType as "REMOTE" | "HYBRID" | "ONSITE",
    employmentType: employmentType as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP",
    tags,
    applyUrl,
    applyEmail,
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
      data: { ...data, postedById: session.user.id, questions: { create: questionRows } },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/jobs");
  redirect("/admin/jobs");
}

export async function toggleJobActive(jobId: string) {
  await requireAdmin();
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  await prisma.job.update({ where: { id: jobId }, data: { isActive: !job.isActive } });
  revalidatePath("/");
  revalidatePath("/admin/jobs");
}

export async function deleteJob(jobId: string) {
  await requireAdmin();
  await prisma.job.delete({ where: { id: jobId } });
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
