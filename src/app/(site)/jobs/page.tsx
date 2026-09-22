import Link from "next/link";
import { prisma } from "@/lib/prisma";
import JobCard from "@/components/JobCard";
import FilterBar from "@/components/FilterBar";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 20;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    remote?: string;
    type?: string;
    category?: string;
    location?: string;
    page?: string;
  }>;
}) {
  const { q, remote, type, category, location, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

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
  if (category) where.category = category;
  if (location) where.location = location;

  const [jobs, total] = await prisma.$transaction([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.job.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (remote) params.set("remote", remote);
    if (type) params.set("type", type);
    if (category) params.set("category", category);
    if (location) params.set("location", location);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-white">
        Find your next <span className="text-copper-400">remote</span> role
      </h1>
      <p className="mt-2 text-zinc-400">
        {total} open position{total === 1 ? "" : "s"}
      </p>

      <FilterBar q={q} remote={remote} type={type} category={category} location={location} />

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

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="btn-secondary">
              ← Previous
            </Link>
          ) : (
            <span className="btn-secondary opacity-50">← Previous</span>
          )}
          <span className="text-zinc-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className="btn-secondary">
              Next →
            </Link>
          ) : (
            <span className="btn-secondary opacity-50">Next →</span>
          )}
        </div>
      )}
    </div>
  );
}
