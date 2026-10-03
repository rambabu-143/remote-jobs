import { prisma } from "@/lib/prisma";
import { sendEmail, esc, emailButton } from "@/lib/email";

type PendingJob = { title: string; company: string };

// Tells every admin that employer jobs are waiting for approval. Never throws:
// a failed notification must not break the employer's save or payment.
export async function notifyAdminsOfPendingJobs(jobs: PendingJob[], employerName: string) {
  if (!jobs.length) return;
  try {
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true } });
    const list = jobs.map((j) => `<li><strong>${esc(j.title)}</strong> at ${esc(j.company)}</li>`).join("");
    const many = jobs.length > 1;
    const html = `<h2 style="margin:0 0 12px;font-size:20px;">${many ? `${jobs.length} jobs` : "A job"} waiting for approval</h2>
<p style="margin:0 0 8px;"><strong>${esc(employerName)}</strong> submitted ${many ? "these jobs" : "this job"} for review:</p>
<ul style="margin:0;padding-left:20px;">${list}</ul>${emailButton(`${process.env.APP_URL ?? "http://localhost:3000"}/admin/jobs`, "Review now")}`;
    const subject = many ? `${jobs.length} new jobs waiting for approval` : `New job waiting for approval: ${jobs[0].title}`;
    await Promise.all(admins.map((a) => sendEmail({ to: a.email, subject, html })));
  } catch (err) {
    console.error("Admin notification failed:", err);
  }
}
