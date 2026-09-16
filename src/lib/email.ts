import { Resend } from "resend";

// ponytail: no-ops to a console log when RESEND_API_KEY isn't set, so the app
// runs locally with zero setup. Add a real key + verified "from" domain (see
// .env.example) to actually send mail.
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email skipped — no RESEND_API_KEY] to=${to} subject="${subject}"`);
    return;
  }

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM ?? "RemoteJobs <onboarding@resend.dev>";

  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) console.error("Email send failed:", error);
}
