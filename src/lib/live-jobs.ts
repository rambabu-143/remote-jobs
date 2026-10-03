import type { Prisma } from "@prisma/client";

// Employers pay a monthly plan, not per job: their PUBLISHED jobs are only visible
// while that plan is active (admin-posted jobs are always visible). Jobs stay
// PUBLISHED in the DB, so renewing the plan brings them straight back.
export const liveClause = (): Prisma.JobWhereInput => ({
  OR: [{ postedBy: { role: "ADMIN" } }, { postedBy: { subscriptionExpiresAt: { gt: new Date() } } }],
});

// unstable_cache JSON-serialises results, so the date may arrive as a string.
export function isLive(job: { status: string; postedBy: { role: string; subscriptionExpiresAt: Date | string | null } }) {
  if (job.status !== "PUBLISHED") return false;
  if (job.postedBy.role === "ADMIN") return true;
  return Boolean(job.postedBy.subscriptionExpiresAt && new Date(job.postedBy.subscriptionExpiresAt) > new Date());
}
