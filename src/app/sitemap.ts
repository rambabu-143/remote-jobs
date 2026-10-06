import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { liveClause } from "@/lib/live-jobs";
import { readEmployerPlanRequired } from "@/lib/settings";

// Read from the DB per request (not at build) so new jobs appear without a redeploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const jobs = await prisma.job.findMany({
    where: { status: "PUBLISHED", AND: [liveClause(await readEmployerPlanRequired())] },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/jobs`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.6 },
    ...jobs.map((j) => ({ url: `${base}/jobs/${j.id}`, lastModified: j.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...["terms", "privacy", "refund", "contact"].map((p) => ({ url: `${base}/${p}`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
