// ponytail: smallest check for the reminder window + dedup-key logic. `npx tsx src/lib/plan-reminders.test.ts`
import assert from "node:assert";
import { reminderWindows, reminderKey } from "./plan-reminders";

const now = new Date("2026-01-15T04:30:00Z");
const w = reminderWindows(now);
const D = 864e5;

// "Soon" = (now, now+3d); "expired" = [now-3d, now): nothing sits in both, nothing in the 3-day band is missed.
assert.strictEqual(w.expiringSoon.gt.getTime(), now.getTime());
assert.strictEqual(w.expiringSoon.lt.getTime(), now.getTime() + 3 * D);
assert.strictEqual(w.expired.lt.getTime(), now.getTime());
assert.strictEqual(w.expired.gte.getTime(), now.getTime() - 3 * D);

// Tomorrow's window still covers a plan that ends 2.9 days from today's run (a skipped day is caught up).
const tomorrow = reminderWindows(new Date(now.getTime() + D));
const endsAt = now.getTime() + 3.2 * D; // not "soon" today, is "soon" tomorrow
assert.ok(!(endsAt < w.expiringSoon.lt.getTime()) && endsAt < tomorrow.expiringSoon.lt.getTime());

// Same reminder + same expiry => same key (dedup); renewing changes the expiry => new key; kinds differ.
const e1 = new Date("2026-01-18T00:00:00Z"), e2 = new Date("2026-02-18T00:00:00Z");
assert.strictEqual(reminderKey("soon", e1), reminderKey("soon", new Date(e1)));
assert.notStrictEqual(reminderKey("soon", e1), reminderKey("soon", e2));
assert.notStrictEqual(reminderKey("soon", e1), reminderKey("expired", e1));

console.log("plan-reminders: ok");
