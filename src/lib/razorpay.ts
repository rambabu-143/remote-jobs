import Razorpay from "razorpay";
import crypto from "crypto";
import type { SubscriptionPlan } from "@prisma/client";

// ponytail: fixed-term plans, amounts match the pricing sheet exactly (in paise).
export const PLANS: Record<SubscriptionPlan, { label: string; amountInPaise: number; months: number }> = {
  MONTH_1: { label: "1 Month", amountInPaise: 4900, months: 1 },
  MONTH_6: { label: "6 Months", amountInPaise: 24900, months: 6 },
  YEAR_1: { label: "1 Year", amountInPaise: 39900, months: 12 },
};

// Flat fee to publish one job listing (employer self-serve posting).
export const JOB_LISTING_PRICE_PAISE = 99900;

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay is not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing).");
  }
  return new Razorpay({ key_id, key_secret });
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) throw new Error("RAZORPAY_KEY_SECRET missing.");
  const expected = crypto.createHmac("sha256", key_secret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("RAZORPAY_WEBHOOK_SECRET missing.");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

// Renewing before expiry stacks onto the remaining time; renewing after
// expiry (or subscribing fresh) starts the new term from now.
export function extendExpiry(current: Date | null, months: number, now: Date = new Date()): Date {
  const base = current && current > now ? current : now;
  const next = new Date(base);
  next.setMonth(next.getMonth() + months);
  return next;
}
