"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJobListingOrder, verifyJobListingPayment } from "@/lib/actions/job-payments";
import Spinner from "./Spinner";
import { Button } from "@/components/ui/button";

// Razorpay's `window.Razorpay` type is declared globally in PricingCard.tsx.
export default function PayForJobButton({
  jobId,
  amountInRupees,
  userName,
  userEmail,
}: {
  jobId: string;
  amountInRupees: number;
  userName?: string;
  userEmail?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setPending(true);
    setError(null);

    const order = await createJobListingOrder(jobId);
    if (!order.ok) {
      setError(order.error);
      setPending(false);
      return;
    }

    new window.Razorpay({
      key: order.keyId,
      amount: order.amountInPaise,
      currency: "INR",
      name: "365DaysJobsTeam",
      order_id: order.orderId,
      prefill: { name: userName, email: userEmail },
      theme: { color: "#a8623a" },
      handler: async (response) => {
        const result = await verifyJobListingPayment({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
        if (!result.ok) setError("Payment succeeded but confirmation failed. Contact support with your payment ID.");
        else router.refresh();
        setPending(false);
      },
    }).open();
    setPending(false);
  }

  return (
    <div className="text-right">
      <Button onClick={pay} disabled={pending}>
        {pending && <Spinner className="size-4" />}
        Pay ₹{amountInRupees} to publish
      </Button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
