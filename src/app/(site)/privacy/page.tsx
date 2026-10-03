import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/Legal";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>This policy explains what personal data 365DaysJobsTeam collects, why, and who sees it.</p>

      <LegalSection title="1. What we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>Account data: your name, email address and password (stored hashed by our authentication provider).</li>
          <li>
            Application data: resumes, cover notes and answers to screening questions you submit when applying to a job.
          </li>
          <li>Employer data: job listings and company details you enter, such as address, email and phone.</li>
          <li>
            Payment records: order and payment IDs and amounts. Card and bank details are handled by Razorpay and never
            reach our servers.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How we use it">
        <p>
          To run the service: create and secure your account, show job listings, deliver your applications to employers,
          process payments, and send you emails about your account, applications and listings.
        </p>
      </LegalSection>

      <LegalSection title="3. Who sees it">
        <ul className="list-disc space-y-1 pl-5">
          <li>The employer who posted a job, and our admins, can see your application and resume for that job.</li>
          <li>Other users cannot access your resume. Resume files are private.</li>
          <li>We do not sell your personal data.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Service providers">
        <p>
          We use Supabase (authentication, database and file storage), Vercel (hosting), Razorpay (payments) and Resend
          (email delivery) to operate the site. They process data only on our behalf.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies">
        <p>We use only essential cookies to keep you logged in. We do not use advertising cookies.</p>
      </LegalSection>

      <LegalSection title="6. Retention and your rights">
        <p>
          We keep your data while your account is active. You can ask us to access, correct or delete your data,
          including your resumes, by contacting us, and we will respond within a reasonable time. Payment records may be
          kept as required for accounting and legal purposes.
        </p>
      </LegalSection>

      <LegalSection title="7. Security">
        <p>
          We use access controls, encrypted connections and private storage to protect your data, but no system is
          completely secure.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes">
        <p>We may update this policy and will change the date above when we do.</p>
      </LegalSection>
    </LegalPage>
  );
}
