import { prisma } from "@/lib/prisma";
import { sendEmail, emailButton } from "@/lib/email";

const DAY_MS = 864e5;
const REMIND_DAYS_BEFORE = 3;
const CATCH_UP_DAYS = 3;

// "Soon" = ends within the next 3 days; "expired" = ended in the last 3 days. The windows
// overlap from one daily run to the next on purpose: reminderSent makes sure nobody is emailed
// twice, and the overlap means a skipped or late run still catches everyone on the next one.
export function reminderWindows(now: Date) {
  return {
    expiringSoon: { gt: now, lt: new Date(now.getTime() + REMIND_DAYS_BEFORE * DAY_MS) },
    expired: { gte: new Date(now.getTime() - CATCH_UP_DAYS * DAY_MS), lt: now },
  };
}

// Same key for the same reminder about the same expiry; renewing changes the expiry, so it resets.
export const reminderKey = (kind: "soon" | "expired", expiresAt: Date) => `${kind}:${expiresAt.toISOString()}`;

const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

function message(role: "USER" | "EMPLOYER", kind: "soon" | "expired", endsOn: Date) {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const employer = role === "EMPLOYER";
  const href = employer ? `${base}/dashboard/jobs` : `${base}/pricing`;
  if (kind === "soon") {
    return {
      subject: employer ? "Your employer plan ends soon" : "Your apply access ends soon",
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

// Run once a day by Vercel Cron (see vercel.json). Each user is "claimed" with an atomic update
// before the email goes out, so a retry or a second run can't send the same reminder twice.
// ponytail: claim-then-send means a failed send is not retried; flip the order if you'd rather risk a duplicate than a miss.
export async function sendPlanReminders(now = new Date()) {
  const w = reminderWindows(now);
  const select = { id: true, email: true, role: true, subscriptionExpiresAt: true, reminderSent: true } as const;
  const roles = { in: ["USER", "EMPLOYER"] as ("USER" | "EMPLOYER")[] };
  const [soon, expired] = await Promise.all([
    prisma.user.findMany({ where: { role: roles, subscriptionExpiresAt: w.expiringSoon }, select }),
    prisma.user.findMany({ where: { role: roles, subscriptionExpiresAt: w.expired }, select }),
  ]);

  const todo = [
    ...soon.map((u) => ({ u, kind: "soon" as const })),
    ...expired.map((u) => ({ u, kind: "expired" as const })),
  ].filter(({ u, kind }) => u.reminderSent !== reminderKey(kind, u.subscriptionExpiresAt!));

  const sent = { expiringSoon: 0, expired: 0 };
  // Small batches keep us under Resend's rate limit.
  for (let i = 0; i < todo.length; i += 5) {
    await Promise.all(
      todo.slice(i, i + 5).map(async ({ u, kind }) => {
        const key = reminderKey(kind, u.subscriptionExpiresAt!);
        const claimed = await prisma.user.updateMany({
          where: { id: u.id, OR: [{ reminderSent: null }, { reminderSent: { not: key } }] },
          data: { reminderSent: key },
        });
        if (claimed.count !== 1) return; // another run got there first
        const m = message(u.role as "USER" | "EMPLOYER", kind, u.subscriptionExpiresAt!);
        try {
          await sendEmail({ to: u.email, subject: m.subject, html: m.html });
          if (kind === "soon") sent.expiringSoon++;
          else sent.expired++;
        } catch (e) {
          console.error("Reminder failed:", e);
        }
      }),
    );
  }
  return sent;
}
