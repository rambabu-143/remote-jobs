import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { JobResults, JobListSkeleton, getJobsPage } from "@/components/JobResults";
import { LANDINGS, type LandingT } from "@/lib/landing";

// Empty landing pages are thin content, so they stay out of Google until a matching job exists.
export async function landingMetadata(l: LandingT): Promise<Metadata> {
  const { total } = await getJobsPage({ status: "PUBLISHED", AND: [l.where] }, 1, 0);
  return { title: l.title, description: l.description, alternates: { canonical: l.path }, robots: total === 0 ? { index: false } : undefined };
}

export default async function LandingPage({ landing: l, searchParams }: { landing: LandingT; searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{l.h1}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600">{l.intro}</p>
      <Suspense key={page} fallback={<JobListSkeleton />}>
        <JobResults page={page} basePath={l.path} extra={l.where} />
      </Suspense>
      <nav aria-label="More job searches" className="mt-12 flex flex-wrap gap-x-4 gap-y-2 border-t border-zinc-200 pt-6 text-sm">
        <Link href="/jobs" className="font-medium text-ink-600 underline">All remote jobs</Link>
        {LANDINGS.filter((x) => x.path !== l.path).map((x) => (
          <Link key={x.path} href={x.path} className="text-zinc-600 hover:text-zinc-900">{x.h1}</Link>
        ))}
      </nav>
    </div>
  );
}
