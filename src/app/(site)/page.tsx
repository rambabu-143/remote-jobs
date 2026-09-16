import { prisma } from "@/lib/prisma";
import JobCard from "@/components/JobCard";
import type { Prisma } from "@/generated/prisma/client";

export default async function Home({
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
      <h1 className="text-2xl font-bold">Remote jobs</h1>
      <p className="mt-1 text-zinc-400">{jobs.length} open position{jobs.length === 1 ? "" : "s"}</p>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search title, company, or tag"
          className="min-w-[220px] flex-1 rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
        />
        <select name="remote" defaultValue={remote ?? ""} className="rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white">
          <option value="">Any location type</option>
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ONSITE">On-site</option>
        </select>
        <select name="type" defaultValue={type ?? ""} className="rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white">
          <option value="">Any employment type</option>
          <option value="FULL_TIME">Full-time</option>
          <option value="PART_TIME">Part-time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERNSHIP">Internship</option>
        </select>
        <button className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200">
          Filter
        </button>
      </form>

      <div className="mt-6 grid gap-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
        {jobs.length === 0 && (
          <p className="rounded-lg border border-zinc-800 border-dashed p-8 text-center text-zinc-500">
            No jobs match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
