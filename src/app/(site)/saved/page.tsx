import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { liveClause } from "@/lib/live-jobs";
import { readEmployerPlanRequired } from "@/lib/settings";
import JobCard from "@/components/JobCard";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Saved jobs", robots: { index: false, follow: false } };

export default async function SavedJobsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "USER") redirect(session.user.role === "EMPLOYER" ? "/dashboard/jobs" : "/admin/jobs");

  const planRequired = await readEmployerPlanRequired();
  const [saved, total] = await Promise.all([
    prisma.savedJob.findMany({
      where: { userId: session.user.id, job: { status: "PUBLISHED", AND: [liveClause(planRequired)] } },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.savedJob.count({ where: { userId: session.user.id } }),
  ]);
  const gone = total - saved.length;
  const save = { mode: "user" as const, savedIds: new Set(saved.map((s) => s.jobId)) };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Saved jobs</h1>
      <p className="mt-2 text-zinc-600">Jobs you saved to apply to later. Open one and click Apply when you are ready.</p>

      <div className="mt-6 grid gap-4">
        {saved.map((s) => (
          <JobCard key={s.id} job={s.job} save={save} />
        ))}
        {saved.length === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-200 p-10 text-center">
            <Heart className="mx-auto size-8 text-zinc-300" />
            <p className="mt-3 text-zinc-600">You have not saved any jobs yet. Tap the heart on a job to keep it here.</p>
            <Link href="/jobs" className={`${buttonVariants({ variant: "default" })} mt-4`}>
              Browse jobs
            </Link>
          </div>
        )}
      </div>

      {gone > 0 && (
        <p className="mt-4 text-sm text-zinc-500">
          {gone} saved job{gone === 1 ? " is" : "s are"} no longer open, so {gone === 1 ? "it is" : "they are"} hidden here.
        </p>
      )}
    </div>
  );
}
