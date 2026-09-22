"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/actions/subscription";
import type { SubscriptionPlan } from "@prisma/client";

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
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    setPending(true);
    setError(null);
    try {
      const order = await createRazorpayOrder(plan);
      if (!order.keyId) throw new Error("Payments aren't configured yet.");

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amountInPaise,
        currency: "INR",
        name: "RemoteJobs",
        order_id: order.orderId,
        prefill: { name: userName, email: userEmail },
        theme: { color: "#a8623a" },
        handler: async (response) => {
          try {
            await verifyRazorpayPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            router.refresh();
          } catch {
            setError("Payment succeeded but activation failed. Contact support with your payment ID.");
          } finally {
            setPending(false);
          }
        },
      });
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(false);
      return;
    }
    setPending(false);
  }

  return (
    <div className={`card relative ${highlight ? "border-copper-500" : ""}`}>
      {highlight && (
        <span className="badge absolute -top-3 left-5 bg-copper-500 text-white">{highlight}</span>
      )}
      <h3 className="text-lg font-semibold text-white">{label}</h3>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">₹{offerPrice}</span>
        {offerPrice < normalPrice && (
          <span className="text-sm text-zinc-500 line-through">₹{normalPrice}</span>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-400">₹{perMonth} / month{saving ? ` · save ${saving}` : ""}</p>
      <button onClick={subscribe} disabled={pending} className="btn-primary mt-4 w-full">
        {pending ? "Opening checkout…" : "Subscribe"}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
