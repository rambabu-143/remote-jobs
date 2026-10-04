"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Saves a job for later, or removes it if it was already saved. Job seekers only
// (employers can't apply, so they have no use for it).
export async function toggleSavedJob(jobId: string): Promise<{ ok: true; saved: boolean } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Log in to save jobs." };
  if (session.user.role !== "USER") return { ok: false, error: "Only job seeker accounts can save jobs." };

  const key = { userId_jobId: { userId: session.user.id, jobId } };
  const existing = await prisma.savedJob.findUnique({ where: key });
  if (existing) {
    await prisma.savedJob.delete({ where: key });
  } else {
    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { id: true } });
    if (!job) return { ok: false, error: "Job not found." };
    await prisma.savedJob.create({ data: { userId: session.user.id, jobId } });
  }
  revalidatePath("/saved");
  return { ok: true, saved: !existing };
}
