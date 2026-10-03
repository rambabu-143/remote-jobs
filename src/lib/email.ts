import { Resend } from "resend";

const appUrl = () => process.env.APP_URL ?? "http://localhost:3000";

// User-controlled text (names, job titles) must be escaped before it goes into email HTML.
export function esc(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Shared branded shell: every app email goes through sendEmail, so callers only
// pass the inner HTML. Inline styles + tables because email clients ignore most CSS.
export function emailLayout(body: string) {
  const url = appUrl();
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#18181b;">
<tr><td style="background:#000000;border-radius:12px 12px 0 0;padding:20px 32px;">
<a href="${url}" style="color:#ffffff;font-size:18px;font-weight:700;text-decoration:none;letter-spacing:-0.2px;">365DaysJobsTeam</a>
</td></tr>
<tr><td style="padding:32px;font-size:15px;line-height:24px;">${body}</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #e4e4e7;font-size:12px;line-height:18px;color:#71717a;">
You are receiving this email because of activity on your 365DaysJobsTeam account.<br>
<a href="${url}/terms" style="color:#71717a;">Terms &amp; Conditions</a> &nbsp;·&nbsp; <a href="${url}/privacy" style="color:#71717a;">Privacy Policy</a><br>
&copy; ${new Date().getFullYear()} 365DaysJobsTeam. All rights reserved.
</td></tr>
</table>
</td></tr></table></body></html>`;
}

export function emailButton(href: string, label: string) {
  return `<p style="margin:24px 0 0;"><a href="${href}" style="display:inline-block;background:#000000;color:#ffffff;font-weight:600;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:8px;">${label}</a></p>`;
}

// ponytail: no-ops to a console log when RESEND_API_KEY isn't set, so the app
// runs locally with zero setup. Add a real key + verified "from" domain (see
// .env.example) to actually send mail.
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email skipped, no RESEND_API_KEY] to=${to} subject="${subject}"`);
    return;
  }

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM ?? "365DaysJobsTeam <onboarding@resend.dev>";

  const { error } = await resend.emails.send({ from, to, subject, html: emailLayout(html) });
  if (error) console.error("Email send failed:", error);
}
