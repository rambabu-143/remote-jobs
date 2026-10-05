import { Suspense } from "react";
import FilterBar from "@/components/FilterBar";
import { JobResults, JobListSkeleton } from "@/components/JobResults";
import { POSTED_OPTIONS } from "@/lib/job-labels";

export const metadata = {
  title: "Remote jobs",
  description: "Browse remote jobs from verified companies. Filter by category, location and employment type.",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    category?: string;
    location?: string;
    posted?: string;
    page?: string;
  }>;
}) {
  const { q, type, category, location, posted: postedParam, page: pageParam } = await searchParams;
  const posted = POSTED_OPTIONS.some((o) => o.value === postedParam) ? postedParam : undefined;
  const page = Math.max(1, Number(pageParam) || 1);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        Find your next <span className="text-ink-600">remote</span> role
      </h1>

      <FilterBar q={q} type={type} category={category} location={location} posted={posted} />

      <Suspense key={`${q ?? ""}|${type ?? ""}|${category ?? ""}|${location ?? ""}|${posted ?? ""}|${page}`} fallback={<JobListSkeleton />}>
        <JobResults q={q} type={type} category={category} location={location} posted={posted} page={page} />
      </Suspense>
    </div>
  );
}

