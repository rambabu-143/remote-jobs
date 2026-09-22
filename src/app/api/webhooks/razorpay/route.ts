import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { activateSubscription } from "@/lib/actions/subscription";

// Fallback for when the client never returns to call verifyRazorpayPayment
// (closed tab, network drop after a successful charge). Idempotent via
// activateSubscription's payment.status check.
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
      const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
      if (payment) await activateSubscription(payment.id, paymentId);
    }
  }

  return NextResponse.json({ ok: true });
}
