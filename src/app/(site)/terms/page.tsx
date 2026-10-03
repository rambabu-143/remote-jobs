import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/Legal";

export const metadata: Metadata = { title: "Terms & Conditions - 365DaysJobsTeam" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions">
      <p>
        These terms govern your use of 365DaysJobsTeam (&quot;we&quot;, &quot;us&quot;), a job board at 365daysjobs.com
        where employers post jobs and job seekers apply. By creating an account or using the site you agree to them.
      </p>

      <LegalSection title="1. Accounts">
        <p>
          You must give accurate information and keep your password secure. You are responsible for activity on your
          account. You must be at least 18 years old to use the site.
        </p>
      </LegalSection>

      <LegalSection title="2. Job seekers">
        <ul className="list-disc space-y-1 pl-5">
          <li>Browsing jobs is free. Applying to jobs requires a paid access plan (1 month, 6 months or 1 year).</li>
          <li>Plans are one-time, fixed-term payments. They do not renew automatically.</li>
          <li>
            Plan fees are non-refundable once access has been activated, except where required by law. We do not
            guarantee that you will receive interviews or offers.
          </li>
          <li>Resumes and answers you submit are shared with the employer who posted that job and with our admins.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Employers">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Posting jobs requires an active employer plan (currently 30 days of unlimited job posts for a one-time
            payment; it does not renew automatically). Jobs you save without an active plan stay as drafts until you
            subscribe.
          </li>
          <li>
            Every listing is reviewed by us before it goes live. We may reject or remove any listing that breaks these
            terms. Live jobs are hidden when your plan ends and become visible again if you renew.
          </li>
          <li>Employer plan fees are non-refundable once the plan has been activated, except where required by law.</li>
          <li>
            Listings must be real, accurate, lawful and non-discriminatory. You must not charge applicants any fee, or
            ask for payment or sensitive financial details, as part of hiring.
          </li>
          <li>You may only use applicants&apos; personal data to evaluate them for the role they applied to.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Payments">
        <p>
          Payments are processed by Razorpay in Indian rupees (INR). We do not store your card or bank details. Prices
          are shown at checkout and may change for future purchases.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceptable use">
        <p>
          Do not post false, misleading, illegal or offensive content; scrape the site; attempt to access other
          people&apos;s data or accounts; interfere with the service; or use it to spam or defraud anyone. We may
          suspend or delete accounts that do.
        </p>
      </LegalSection>

      <LegalSection title="6. Our role">
        <p>
          We are a platform connecting employers and job seekers. We are not the employer, do not verify every claim in
          a listing, and are not a party to any hiring decision or employment agreement. Do your own checks before
          sharing personal information or accepting a role.
        </p>
      </LegalSection>

      <LegalSection title="7. Liability">
        <p>
          The site is provided &quot;as is&quot;. To the extent permitted by law, we are not liable for indirect or
          consequential losses, or for the actions of employers or applicants. Our total liability for any claim is
          limited to the amount you paid us in the 12 months before the claim.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes and governing law">
        <p>
          We may update these terms; continued use after a change means you accept it. These terms are governed by the
          laws of India, and courts in India have jurisdiction.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
