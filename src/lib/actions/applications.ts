"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAllowedResumeType, saveResumeFile } from "@/lib/storage";
import { sendEmail } from "@/lib/email";

const MAX_RESUME_BYTES = 4 * 1024 * 1024;

export async function applyToJob(_prevState: string | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return "You must be logged in to apply.";
  }

  const jobId = String(formData.get("jobId") ?? "");
  const coverNote = String(formData.get("coverNote") ?? "").trim() || null;
  const resume = formData.get("resume");

  if (!jobId || !(resume instanceof File) || resume.size === 0) {
    return "A resume file is required.";
  }
  if (!isAllowedResumeType(resume.type)) {
    return "Resume must be a PDF or Word document.";
  }
  if (resume.size > MAX_RESUME_BYTES) {
    return "Resume must be under 4MB.";
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { questions: true, postedBy: true },
  });
  if (!job) return "Job not found.";

  const existing = await prisma.application.findUnique({
    where: { jobId_applicantId: { jobId, applicantId: session.user.id } },
  });
  if (existing) {
    return "You already applied to this job.";
  }

  const missingAnswer = job.questions.find(
    (q) => !String(formData.get(`answer_${q.id}`) ?? "").trim(),
  );
  if (missingAnswer) {
    return "Please answer all screening questions.";
  }

  const resumeFileName = await saveResumeFile(resume);

  await prisma.application.create({
    data: {
      jobId,
      applicantId: session.user.id,
      resumeFileName,
      coverNote,
      answers: {
        create: job.questions.map((q) => ({
          questionId: q.id,
          answer: String(formData.get(`answer_${q.id}`) ?? "").trim(),
        })),
      },
    },
  });

  await sendEmail({
    to: job.postedBy.email,
    subject: `New application: ${job.title}`,
    html: `<p>${session.user.name} applied to <strong>${job.title}</strong>.</p><p><a href="${process.env.APP_URL ?? "http://localhost:3000"}/admin/jobs/${job.id}/applications">Review applicants</a></p>`,
  });

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");
  return "Application submitted!";
}
