import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { liveClause } from "@/lib/live-jobs";
import { readEmployerPlanRequired } from "@/lib/settings";
import { LANDINGS } from "@/lib/landing";

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
  const live = liveClause(await readEmployerPlanRequired());
  // Only landing pages that have at least one job (empty ones are noindex).
  const landings = (await Promise.all(LANDINGS.map(async (l) => ((await prisma.job.count({ where: { status: "PUBLISHED", AND: [live, l.where] } })) ? l.path : null)))).filter(Boolean) as string[];
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/jobs`, changeFrequency: "hourly", priority: 0.9 },
    ...landings.map((path) => ({ url: `${base}${path}`, changeFrequency: "daily" as const, priority: 0.8 })),
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.6 },
    ...jobs.map((j) => ({ url: `${base}/jobs/${j.id}`, lastModified: j.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...["terms", "privacy", "refund", "contact"].map((p) => ({ url: `${base}/${p}`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
