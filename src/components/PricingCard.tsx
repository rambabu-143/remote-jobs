"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/actions/subscription";
import type { SubscriptionPlan } from "@prisma/client";
import Spinner from "./Spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      order_id: string;
      handler: (response: RazorpaySuccessResponse) => void;
      prefill?: { name?: string; email?: string };
      theme?: { color?: string };
    }) => { open: () => void };
  }
}

export default function PricingCard({
  plan,
  label,
  normalPrice,
  offerPrice,
  perMonth,
  saving,
  highlight,
  userName,
  userEmail,
  returnTo,
}: {
  plan: SubscriptionPlan;
  label: string;
  normalPrice: number;
  offerPrice: number;
  perMonth: string;
  saving?: string;
  highlight?: string;
  userName?: string;
  userEmail?: string;
  /** Where to send the user after a successful payment (a job they were about to apply to). */
  returnTo?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    setPending(true);
    setError(null);

    const order = await createRazorpayOrder(plan);
    if (!order.ok) {
      setError(order.error);
      setPending(false);
      return;
    }

    const razorpay = new window.Razorpay({
      key: order.keyId,
      amount: order.amountInPaise,
      currency: "INR",
      name: "365DaysJobsTeam",
      order_id: order.orderId,
      prefill: { name: userName, email: userEmail },
      theme: { color: "#a8623a" },
      handler: async (response) => {
        const result = await verifyRazorpayPayment({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
        if (!result.ok) {
          setError("Payment succeeded but activation failed. Contact support with your payment ID.");
        } else {
          if (returnTo) router.push(returnTo);
          router.refresh();
        }
        setPending(false);
      },
    });
    razorpay.open();
    setPending(false);
  }

  return (
    <div className={`card relative ${highlight ? "ring-2 ring-zinc-900" : ""}`}>
      {highlight && (
        <Badge variant="secondary" className="absolute -top-3 left-5 bg-zinc-900 text-paper">{highlight}</Badge>
      )}
      <h3 className="text-lg font-semibold text-zinc-900">{label}</h3>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-zinc-900">₹{offerPrice}</span>
        {offerPrice < normalPrice && (
          <span className="text-sm text-zinc-500 line-through">₹{normalPrice}</span>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-600">₹{perMonth} / month{saving ? ` · save ${saving}` : ""}</p>
      <Button onClick={subscribe} disabled={pending} className="mt-4 w-full">
        {pending && <Spinner className="size-4" />}
        {pending ? "Opening checkout…" : "Subscribe"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
