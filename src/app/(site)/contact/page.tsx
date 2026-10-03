import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/Legal";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  const rows = [
    { label: "Email", value: BUSINESS.email, href: BUSINESS.email ? `mailto:${BUSINESS.email}` : "" },
    { label: "Phone", value: BUSINESS.phone, href: BUSINESS.phone ? `tel:${BUSINESS.phone.replace(/\s/g, "")}` : "" },
    { label: "Address", value: BUSINESS.address, href: "" },
  ].filter((r) => r.value);

  return (
    <LegalPage title="Contact Us">
      <p>
        Questions about your account, a payment, a job listing or an application? Get in touch and we will reply as soon
        as we can, usually within 2 business days.
      </p>

      <LegalSection title={BUSINESS.name}>
        <dl className="space-y-3">
          {rows.map((r) => (
            <div key={r.label}>
              <dt className="font-medium text-zinc-900">{r.label}</dt>
              <dd>
                {r.href ? (
                  <a href={r.href} className="underline hover:text-zinc-900">
                    {r.value}
                  </a>
                ) : (
                  <span className="whitespace-pre-line">{r.value}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </LegalSection>

      <LegalSection title="When you write to us">
        <p>
          For payment questions, include the email on your account and your Razorpay payment ID (it is in the receipt
          Razorpay emails you). For refund requests, see our Refund &amp; Cancellation Policy.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
