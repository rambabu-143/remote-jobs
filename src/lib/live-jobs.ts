import type { Prisma } from "@prisma/client";

// When employers have to pay (Settings -> "Require the employer plan"), their PUBLISHED jobs are only
// visible while that plan is active (admin-posted jobs are always visible). When posting is free there
// is no plan to expire, so every PUBLISHED job is visible. Jobs stay PUBLISHED in the DB either way,
// so switching the rule back and forth never loses anything.
export const liveClause = (planRequired: boolean): Prisma.JobWhereInput =>
  planRequired
    ? { OR: [{ postedBy: { role: "ADMIN" } }, { postedBy: { subscriptionExpiresAt: { gt: new Date() } } }] }
    : {};

// unstable_cache JSON-serialises results, so the date may arrive as a string.
export function isLive(
  job: { status: string; postedBy: { role: string; subscriptionExpiresAt: Date | string | null } },
  planRequired: boolean,
) {
  if (job.status !== "PUBLISHED") return false;
  if (!planRequired || job.postedBy.role === "ADMIN") return true;
  return Boolean(job.postedBy.subscriptionExpiresAt && new Date(job.postedBy.subscriptionExpiresAt) > new Date());
}
