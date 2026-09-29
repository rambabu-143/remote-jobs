import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { activateSubscription } from "@/lib/actions/subscription";
import { markJobPaidAndPending } from "@/lib/actions/job-payments";

// Fallback for when the client never returns to call verifyRazorpayPayment /
// verifyJobListingPayment (closed tab, network drop after a successful
// charge). Idempotent via each payment row's status check.
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  if (event.event === "payment.captured") {
    const orderId = event.payload?.payment?.entity?.order_id;
    const paymentId = event.payload?.payment?.entity?.id;
    if (orderId && paymentId) {
      const [subscriptionPayment, jobPayment] = await Promise.all([
        prisma.payment.findUnique({ where: { razorpayOrderId: orderId } }),
        prisma.jobPayment.findUnique({ where: { razorpayOrderId: orderId } }),
      ]);
      if (subscriptionPayment) await activateSubscription(subscriptionPayment.id, paymentId);
      if (jobPayment) await markJobPaidAndPending(jobPayment.id, paymentId);
    }
  }

  return NextResponse.json({ ok: true });
}
