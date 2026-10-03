import { NextResponse } from "next/server";
import { sendPlanReminders } from "@/lib/plan-reminders";

export const maxDuration = 60;

// Vercel Cron calls this with `Authorization: Bearer $CRON_SECRET`. Refuse everything
// else (and refuse to run at all if the secret isn't configured), so it can't be used to spam.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, ...(await sendPlanReminders()) });
}
