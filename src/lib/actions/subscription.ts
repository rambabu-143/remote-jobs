"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath, updateTag } from "next/cache";
import { notifyAdminsOfPendingJobs } from "@/lib/notify";
import { isEmployerPlanRequired } from "@/lib/settings";
import {
  getRazorpayClient,
  isRazorpayConfigured,
  verifyPaymentSignature,
  extendExpiry,
  PLANS,
  EMPLOYER_PLAN_PRICE_PAISE,
} from "@/lib/razorpay";
import type { SubscriptionPlan } from "@prisma/client";

// Next.js redacts thrown Server Action errors in production builds (only a
// generic message reaches the client). Expected/known failures are returned
// as data instead of thrown, so the real message survives to the UI.
type ActionResult<T> = ({ ok: true } & T) | { ok: false; error: string };

export async function createRazorpayOrder(
  plan: SubscriptionPlan,
): Promise<ActionResult<{ orderId: string; amountInPaise: number; keyId: string }>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "You must be logged in to subscribe." };
  const isEmployer = session.user.role === "EMPLOYER";
  if (isEmployer && !(await isEmployerPlanRequired())) return { ok: false, error: "Posting is free right now, no plan is needed." };
  if (session.user.role !== "USER" && !isEmployer) return { ok: false, error: "Plans are for job seeker and employer accounts." };

  // Employers have one plan (monthly, unlimited posts); seekers pick from PLANS.
  const chosenPlan: SubscriptionPlan = isEmployer ? "MONTH_1" : plan;
  const config = PLANS[chosenPlan];
  if (!config) return { ok: false, error: "Unknown plan." };
  const amountInPaise = isEmployer ? EMPLOYER_PLAN_PRICE_PAISE : config.amountInPaise;

  if (!isRazorpayConfigured()) {
    return { ok: false, error: "Payments aren't configured yet. Check back soon." };
  }

  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    notes: { userId: session.user.id, plan: chosenPlan },
  });

  await prisma.payment.create({
    data: {
      userId: session.user.id,
      plan: chosenPlan,
      amountInPaise,
      razorpayOrderId: order.id,
    },
  });

  return { ok: true, orderId: order.id, amountInPaise, keyId: process.env.RAZORPAY_KEY_ID! };
}

export async function verifyRazorpayPayment(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<ActionResult<object>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "You must be logged in." };

  const valid = verifyPaymentSignature(input.orderId, input.paymentId, input.signature);
  if (!valid) return { ok: false, error: "Payment verification failed." };

  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: input.orderId } });
  if (!payment || payment.userId !== session.user.id) return { ok: false, error: "Payment not found." };

  if (payment.status !== "PAID") {
    await activateSubscription(payment.id, input.paymentId);
  }

  revalidatePath("/pricing");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/jobs");
  revalidatePath("/admin/jobs");
  updateTag("jobs"); // employer jobs reappear immediately on renewal
  return { ok: true };
}

// Shared by the client-side verify call and the webhook fallback, idempotent
// on payment.status so a retried webhook can't double-extend the expiry.
export async function activateSubscription(paymentId: string, razorpayPaymentId: string) {
  const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
  if (payment.status === "PAID") return;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: payment.userId } });
  const expiresAt = extendExpiry(user.subscriptionExpiresAt, PLANS[payment.plan].months);

  // Employers who saved drafts while unsubscribed: paying sends them for admin review.
  const drafts =
    user.role === "EMPLOYER"
      ? await prisma.job.findMany({ where: { postedById: payment.userId, status: "DRAFT" }, select: { title: true, company: true } })
      : [];

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "PAID", razorpayPaymentId },
    }),
    prisma.user.update({
      where: { id: payment.userId },
      data: { subscriptionPlan: payment.plan, subscriptionExpiresAt: expiresAt },
    }),
    ...(drafts.length
      ? [prisma.job.updateMany({ where: { postedById: payment.userId, status: "DRAFT" }, data: { status: "PENDING" } })]
      : []),
  ]);
  await notifyAdminsOfPendingJobs(drafts, user.name);
}

export async function hasActiveSubscription(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { subscriptionExpiresAt: true } });
  return Boolean(user?.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date());
}
