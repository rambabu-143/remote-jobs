import { Suspense } from "react";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import JobCard from "@/components/JobCard";
import FilterBar from "@/components/FilterBar";
import Skeleton from "@/components/Skeleton";
import type { Prisma } from "@prisma/client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const getJobsPage = unstable_cache(
  async (where: Prisma.JobWhereInput, page: number) => {
    const [jobs, total] = await prisma.$transaction([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.job.count({ where }),
    ]);
    return { jobs, total };
  },
  ["jobs-list"],
  { tags: ["jobs"], revalidate: 60 }
);

type Filters = {
  q?: string;
  remote?: string;
  type?: string;
  category?: string;
  location?: string;
  page: number;
};

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

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        Find your next <span className="text-ink-600">remote</span> role
      </h1>

      <FilterBar q={q} remote={remote} type={type} category={category} location={location} />

      <Suspense key={`${q ?? ""}|${remote ?? ""}|${type ?? ""}|${category ?? ""}|${location ?? ""}|${page}`} fallback={<JobListSkeleton />}>
        <JobResults q={q} remote={remote} type={type} category={category} location={location} page={page} />
      </Suspense>
    </div>
  );
}

async function JobResults({ q, remote, type, category, location, page }: Filters) {
  const where: Prisma.JobWhereInput = { status: "PUBLISHED" };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { tags: { contains: q, mode: "insensitive" } },
    ];
  }
  if (remote) where.remoteType = remote as "REMOTE" | "HYBRID" | "ONSITE";
  if (type) where.employmentType = type as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  if (category) where.category = category;
  if (location) where.location = location;

  const { jobs, total } = await getJobsPage(where, page);
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
    <>
      <p className="mt-2 text-zinc-600">
        {total} open position{total === 1 ? "" : "s"}
      </p>

      <div className="mt-6 grid gap-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
        {jobs.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-zinc-500">
            No jobs match your filters.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className={buttonVariants({ variant: "outline" })}>
              ← Previous
            </Link>
          ) : (
            <span className={cn(buttonVariants({ variant: "outline" }), "opacity-50")}>← Previous</span>
          )}
          <span className="text-zinc-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className={buttonVariants({ variant: "outline" })}>
              Next →
            </Link>
          ) : (
            <span className={cn(buttonVariants({ variant: "outline" }), "opacity-50")}>Next →</span>
          )}
        </div>
      )}
    </>
  );
}

function JobListSkeleton() {
  return (
    <>
      <Skeleton className="mt-2 h-5 w-40" />
      <div className="mt-6 grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card flex gap-4">
            <Skeleton className="size-10 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
