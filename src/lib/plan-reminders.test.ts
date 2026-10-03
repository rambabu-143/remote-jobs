// ponytail: smallest check for the date-window logic. `npx tsx src/lib/plan-reminders.test.ts`
import assert from "node:assert";
import { startOfDayIST, reminderWindows } from "./plan-reminders";

// 10:00 IST on 15 Jan is 04:30 UTC; the IST day began at 18:30 UTC on the 14th.
assert.deepStrictEqual(startOfDayIST(new Date("2026-01-15T04:30:00Z")), new Date("2026-01-14T18:30:00Z"));
// A run at 23:50 IST (18:20 UTC) is still the same IST day...
assert.deepStrictEqual(startOfDayIST(new Date("2026-01-15T18:20:00Z")), new Date("2026-01-14T18:30:00Z"));
// ...and 00:10 IST the next day (18:40 UTC) is the next one.
assert.deepStrictEqual(startOfDayIST(new Date("2026-01-15T18:40:00Z")), new Date("2026-01-15T18:30:00Z"));

// Whatever time of day the cron fires, the same calendar-day window is used.
const a = reminderWindows(new Date("2026-01-15T04:30:00Z"));
const b = reminderWindows(new Date("2026-01-15T11:00:00Z"));
assert.deepStrictEqual(a, b);
// Windows are exactly one day wide and tile with the next day's: no gaps, no overlap.
assert.strictEqual(a.expiringSoon.lt.getTime() - a.expiringSoon.gte.getTime(), 864e5);
const next = reminderWindows(new Date("2026-01-16T04:30:00Z"));
assert.strictEqual(next.expiringSoon.gte.getTime(), a.expiringSoon.lt.getTime());
// "Expired" is yesterday; "soon" is 3 days ahead.
assert.strictEqual(a.expired.lt.getTime(), startOfDayIST(new Date("2026-01-15T04:30:00Z")).getTime());
assert.strictEqual(a.expiringSoon.gte.getTime() - a.expired.lt.getTime(), 3 * 864e5);

console.log("plan-reminders: ok");
