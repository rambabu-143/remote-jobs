// ponytail: smallest runnable check for the money-affecting logic in this
// file (expiry stacking, signature verification). `npx tsx src/lib/razorpay.test.ts`
import assert from "node:assert";
import crypto from "crypto";
import { extendExpiry, verifyPaymentSignature } from "./razorpay";

const now = new Date("2026-01-15T00:00:00Z");

// Fresh subscribe: no current expiry -> starts from now.
assert.deepStrictEqual(extendExpiry(null, 1, now), new Date("2026-02-15T00:00:00Z"));

// Renew after expiry: starts from now, not the stale expiry date.
assert.deepStrictEqual(extendExpiry(new Date("2025-12-01T00:00:00Z"), 6, now), new Date("2026-07-15T00:00:00Z"));

// Renew before expiry: stacks on top of the remaining time.
assert.deepStrictEqual(extendExpiry(new Date("2026-02-01T00:00:00Z"), 12, now), new Date("2027-02-01T00:00:00Z"));

process.env.RAZORPAY_KEY_SECRET = "test_secret";
const expected = crypto.createHmac("sha256", "test_secret").update("order_1|pay_1").digest("hex");
assert.strictEqual(verifyPaymentSignature("order_1", "pay_1", expected), true);
assert.strictEqual(verifyPaymentSignature("order_1", "pay_1", "wrong"), false);

console.log("razorpay.test.ts: all checks passed");
