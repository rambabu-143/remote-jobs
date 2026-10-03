import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/Legal";

export const metadata: Metadata = { title: "Refund & Cancellation Policy" };

export default function RefundPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy">
      <p>
        This policy covers payments made on 365DaysJobsTeam for job seeker plans (1 month, 6 months, 1 year) and the
        employer plan (30 days of unlimited job posts). All payments are processed by Razorpay in Indian rupees (INR).
      </p>

      <LegalSection title="1. Cancellation">
        <p>
          Plans are one-time, fixed-term purchases. They do not renew automatically, so there is nothing to cancel and
          you will never be charged again unless you choose to buy another plan.
        </p>
      </LegalSection>

      <LegalSection title="2. When we refund">
        <ul className="list-disc space-y-1 pl-5">
          <li>You were charged more than once for the same plan (duplicate payment).</li>
          <li>Your payment succeeded but your plan was not activated and we cannot fix it.</li>
          <li>Where a refund is required by law.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. When we do not refund">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Once a plan has been activated, it is non-refundable. This includes not receiving interviews or offers
            (job seekers) or not receiving applicants (employers).
          </li>
          <li>
            Employer job listings that we do not approve. You can post a corrected listing at no extra cost while your
            plan is active.
          </li>
          <li>Accounts suspended or removed for breaking our Terms &amp; Conditions.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. How to request a refund">
        <p>
          Contact us through our{" "}
          <Link href="/contact" className="underline hover:text-zinc-900">
            Contact page
          </Link>{" "}
          within 7 days of the payment. Include your account email and Razorpay payment ID. We review requests within 3
          business days.
        </p>
      </LegalSection>

      <LegalSection title="5. Refund timeline">
        <p>
          Approved refunds are sent to the original payment method. After we approve, banks typically take 5 to 7
          business days to show the refund.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
