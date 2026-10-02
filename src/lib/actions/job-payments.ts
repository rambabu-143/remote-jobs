"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  getRazorpayClient,
  isRazorpayConfigured,
  verifyPaymentSignature,
  JOB_LISTING_PRICE_PAISE,
} from "@/lib/razorpay";

type ActionResult<T> = ({ ok: true } & T) | { ok: false; error: string };

export async function createJobListingOrder(
  jobId: string,
): Promise<ActionResult<{ orderId: string; amountInPaise: number; keyId: string }>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "You must be logged in." };

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.postedById !== session.user.id) return { ok: false, error: "Job not found." };
  if (job.status !== "DRAFT") return { ok: false, error: "This job has already been paid for." };

  if (!isRazorpayConfigured()) {
    return { ok: false, error: "Payments aren't configured yet. Check back soon." };
  }

  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount: JOB_LISTING_PRICE_PAISE,
    currency: "INR",
    notes: { userId: session.user.id, jobId },
  });

  await prisma.jobPayment.upsert({
    where: { jobId },
    create: {
      jobId,
      userId: session.user.id,
      amountInPaise: JOB_LISTING_PRICE_PAISE,
      razorpayOrderId: order.id,
    },
    update: { razorpayOrderId: order.id, status: "CREATED" },
  });

  return { ok: true, orderId: order.id, amountInPaise: JOB_LISTING_PRICE_PAISE, keyId: process.env.RAZORPAY_KEY_ID! };
}

export async function verifyJobListingPayment(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<ActionResult<object>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "You must be logged in." };

  const valid = verifyPaymentSignature(input.orderId, input.paymentId, input.signature);
  if (!valid) return { ok: false, error: "Payment verification failed." };

  const payment = await prisma.jobPayment.findUnique({ where: { razorpayOrderId: input.orderId } });
  if (!payment || payment.userId !== session.user.id) return { ok: false, error: "Payment not found." };

  if (payment.status !== "PAID") {
    await markJobPaidAndPending(payment.id, input.paymentId);
  }

  revalidatePath("/dashboard/jobs");
  revalidatePath("/admin/jobs");
  return { ok: true };
}

// Shared by the client-side verify call and the webhook fallback, idempotent
// on payment.status so a retried webhook can't double-move the job.
export async function markJobPaidAndPending(jobPaymentId: string, razorpayPaymentId: string) {
  const payment = await prisma.jobPayment.findUniqueOrThrow({ where: { id: jobPaymentId } });
  if (payment.status === "PAID") return;

  await prisma.$transaction([
    prisma.jobPayment.update({
      where: { id: jobPaymentId },
      data: { status: "PAID", razorpayPaymentId },
    }),
    prisma.job.update({
      where: { id: payment.jobId },
      data: { status: "PENDING" },
    }),
  ]);
}
