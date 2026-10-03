import { prisma } from "@/lib/prisma";
import { sendEmail, emailButton } from "@/lib/email";

const IST_OFFSET_MS = 5.5 * 3600e3;
const DAY_MS = 864e5;
const REMIND_DAYS_BEFORE = 3;

// Start (as an absolute time) of the current calendar day in India. Matching on
// calendar days, not "N hours from now", means a cron that fires at a slightly
// different time each day can't skip or double-count anyone.
export function startOfDayIST(now: Date) {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET_MS);
}

// Plans ending on the day that is REMIND_DAYS_BEFORE days away, and plans that ended yesterday.
export function reminderWindows(now: Date) {
  const today = startOfDayIST(now).getTime();
  return {
    expiringSoon: { gte: new Date(today + REMIND_DAYS_BEFORE * DAY_MS), lt: new Date(today + (REMIND_DAYS_BEFORE + 1) * DAY_MS) },
    expired: { gte: new Date(today - DAY_MS), lt: new Date(today) },
  };
}

const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

function message(role: "USER" | "EMPLOYER", kind: "soon" | "expired", endsOn: Date) {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const employer = role === "EMPLOYER";
  const href = employer ? `${base}/dashboard/jobs` : `${base}/pricing`;
  if (kind === "soon") {
    return {
      subject: employer ? "Your employer plan ends in 3 days" : "Your apply access ends in 3 days",
      html: `<h2 style="margin:0 0 12px;font-size:20px;">Your plan ends on ${fmt(endsOn)}</h2><p style="margin:0;">${
        employer
          ? "When it ends, your live jobs are hidden from job seekers until you renew. Renew now to keep them visible."
          : "After that you will not be able to apply to jobs until you renew. Renew now to keep applying."
      }</p>${emailButton(href, "Renew now")}`,
    };
  }
  return {
    subject: employer ? "Your employer plan has ended" : "Your apply access has ended",
    html: `<h2 style="margin:0 0 12px;font-size:20px;">Your plan ended on ${fmt(endsOn)}</h2><p style="margin:0;">${
      employer
        ? "Your jobs are now hidden from job seekers. Renew and they come back straight away."
        : "You can still browse jobs, but you need an active plan to apply. Renew to start applying again."
    }</p>${emailButton(href, "Renew")}`,
  };
}

// Run once a day by Vercel Cron (see vercel.json). ponytail: no per-user "already sent" flag,
// so running it twice on the same day would email people twice; add a column if that matters.
export async function sendPlanReminders(now = new Date()) {
  const w = reminderWindows(now);
  const select = { email: true, role: true, subscriptionExpiresAt: true } as const;
  const [soon, expired] = await Promise.all([
    prisma.user.findMany({ where: { role: { in: ["USER", "EMPLOYER"] }, subscriptionExpiresAt: w.expiringSoon }, select }),
    prisma.user.findMany({ where: { role: { in: ["USER", "EMPLOYER"] }, subscriptionExpiresAt: w.expired }, select }),
  ]);

  const jobs = [
    ...soon.map((u) => ({ u, kind: "soon" as const })),
    ...expired.map((u) => ({ u, kind: "expired" as const })),
  ];
  // Small batches keep us under Resend's rate limit.
  for (let i = 0; i < jobs.length; i += 5) {
    await Promise.all(
      jobs.slice(i, i + 5).map(({ u, kind }) => {
        const m = message(u.role as "USER" | "EMPLOYER", kind, u.subscriptionExpiresAt!);
        return sendEmail({ to: u.email, subject: m.subject, html: m.html }).catch((e) => console.error("Reminder failed:", e));
      }),
    );
  }
  return { expiringSoon: soon.length, expired: expired.length };
}
