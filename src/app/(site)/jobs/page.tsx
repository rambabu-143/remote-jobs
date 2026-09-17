import { prisma } from "@/lib/prisma";
import JobCard from "@/components/JobCard";
import FilterBar from "@/components/FilterBar";
import type { Prisma } from "@prisma/client";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; remote?: string; type?: string }>;
}) {
  const { q, remote, type } = await searchParams;

  const where: Prisma.JobWhereInput = { isActive: true };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { company: { contains: q } },
      { tags: { contains: q } },
    ];
  }
  if (remote) where.remoteType = remote as "REMOTE" | "HYBRID" | "ONSITE";
  if (type) where.employmentType = type as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";

  const jobs = await prisma.job.findMany({ where, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-white">
        Find your next <span className="text-copper-400">remote</span> role
      </h1>
      <p className="mt-2 text-zinc-400">
        {jobs.length} open position{jobs.length === 1 ? "" : "s"}
      </p>

      <FilterBar q={q} remote={remote} type={type} />

      <div className="mt-6 grid gap-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
        {jobs.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
            No jobs match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
