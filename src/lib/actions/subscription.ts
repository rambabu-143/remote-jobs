"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getRazorpayClient, verifyPaymentSignature, extendExpiry, PLANS } from "@/lib/razorpay";
import type { SubscriptionPlan } from "@prisma/client";

export async function createRazorpayOrder(plan: SubscriptionPlan) {
  const session = await auth();
  if (!session?.user) throw new Error("You must be logged in to subscribe.");

  const config = PLANS[plan];
  if (!config) throw new Error("Unknown plan.");

  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount: config.amountInPaise,
    currency: "INR",
    notes: { userId: session.user.id, plan },
  });

  await prisma.payment.create({
    data: {
      userId: session.user.id,
      plan,
      amountInPaise: config.amountInPaise,
      razorpayOrderId: order.id,
    },
  });

  return { orderId: order.id, amountInPaise: config.amountInPaise, keyId: process.env.RAZORPAY_KEY_ID };
}

export async function verifyRazorpayPayment(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("You must be logged in.");

  const valid = verifyPaymentSignature(input.orderId, input.paymentId, input.signature);
  if (!valid) throw new Error("Payment verification failed.");

  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: input.orderId } });
  if (!payment || payment.userId !== session.user.id) throw new Error("Payment not found.");

  if (payment.status !== "PAID") {
    await activateSubscription(payment.id, input.paymentId);
  }

  revalidatePath("/pricing");
  revalidatePath("/dashboard");
  return { ok: true };
}

// Shared by the client-side verify call and the webhook fallback, idempotent
// on payment.status so a retried webhook can't double-extend the expiry.
export async function activateSubscription(paymentId: string, razorpayPaymentId: string) {
  const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
  if (payment.status === "PAID") return;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: payment.userId } });
  const expiresAt = extendExpiry(user.subscriptionExpiresAt, PLANS[payment.plan].months);

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "PAID", razorpayPaymentId },
    }),
    prisma.user.update({
      where: { id: payment.userId },
      data: { subscriptionPlan: payment.plan, subscriptionExpiresAt: expiresAt },
    }),
  ]);
}

export async function hasActiveSubscription(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { subscriptionExpiresAt: true } });
  return Boolean(user?.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date());
}
