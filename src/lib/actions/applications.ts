"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAllowedResumeType, saveResumeFile } from "@/lib/storage";
import { sendEmail, esc, emailButton } from "@/lib/email";
import { hasActiveSubscription } from "@/lib/actions/subscription";
import { isLive } from "@/lib/live-jobs";
import { isEmployerPlanRequired } from "@/lib/settings";

const MAX_RESUME_BYTES = 4 * 1024 * 1024;

export async function applyToJob(_prevState: string | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return "You must be logged in to apply.";
  }
  if (session.user.role === "EMPLOYER") return "Employer accounts can't apply to jobs.";
  if (session.user.role === "ADMIN") return "Admin accounts can't apply to jobs.";

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
  if (!job || !isLive(job, await isEmployerPlanRequired())) return "Job not found.";

  if (!(await hasActiveSubscription(session.user.id))) {
    return "An active subscription is required to apply.";
  }

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

  const base = process.env.APP_URL ?? "http://localhost:3000";
  const applicantsPath = `${job.postedBy.role === "ADMIN" ? "/admin/jobs" : "/dashboard/jobs"}/${job.id}/applications`;
  // Send after the response so the seeker isn't kept waiting on the email service.
  const notification = {
    to: job.postedBy.email,
    subject: `New application: ${job.title}`,
    html: `<h2 style="margin:0 0 12px;font-size:20px;">New application received</h2><p style="margin:0;"><strong>${esc(session.user.name)}</strong> applied to <strong>${esc(job.title)}</strong>.</p>${emailButton(`${base}${applicantsPath}`, "Review applicants")}`,
  };
  after(() => sendEmail(notification));

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");
  return "Application submitted!";
}
