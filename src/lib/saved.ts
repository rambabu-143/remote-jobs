import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SaveContext = { mode: "hidden" | "login" | "user"; savedIds: Set<string> };

// What the heart on a job card should do for the current visitor:
// visitors get a heart that leads to login, job seekers get a working one, everyone else gets none.
export async function getSaveContext(jobIds: string[]): Promise<SaveContext> {
  const session = await auth();
  if (!session?.user) return { mode: "login", savedIds: new Set() };
  if (session.user.role !== "USER") return { mode: "hidden", savedIds: new Set() };
  const rows = jobIds.length
    ? await prisma.savedJob.findMany({ where: { userId: session.user.id, jobId: { in: jobIds } }, select: { jobId: true } })
    : [];
  return { mode: "user", savedIds: new Set(rows.map((r) => r.jobId)) };
}
