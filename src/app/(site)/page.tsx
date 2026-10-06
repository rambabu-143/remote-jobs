import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import JobCard from "@/components/JobCard";
import Skeleton from "@/components/Skeleton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { liveClause } from "@/lib/live-jobs";
import { readEmployerPlanRequired } from "@/lib/settings";
import { getSaveContext } from "@/lib/saved";

export default async function LandingPage() {
  const session = await auth();
  const role = session?.user?.role;
  // The landing page is for visitors. Logged-in users go straight to their own home (the logo links here).
  if (session?.user) redirect(role === "ADMIN" ? "/admin/jobs" : role === "EMPLOYER" ? "/dashboard/jobs" : "/jobs");
  const postJobHref = "/register?type=employer"; // visitors only; logged-in users are redirected above

  return (
    <div className="relative">
      <Hero postJobHref={postJobHref} />

      {/* Recent postings */}
      <section className="py-16">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Recent postings</h2>
          <Link href="/jobs" className="text-sm font-medium text-ink-600 underline hover:text-ink-700">
            View all jobs →
          </Link>
        </div>
        <Reveal className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<RecentJobsSkeleton />}>
            <RecentJobs />
          </Suspense>
        </Reveal>
      </section>

      {/* For seekers / employers */}
      <section className="py-16">
        <Reveal className="grid gap-4 sm:grid-cols-2">
          <div className="card-glass">
            <Badge variant="secondary" className="bg-zinc-200 text-zinc-700">For job seekers</Badge>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-zinc-900">
              Skip the recruiter spam.
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Every listing comes from a company we&apos;ve verified, not a staffing agency. Filter
              by category, location, date posted, or employment type, then apply straight to the
              employer and track every application from one dashboard.
            </p>
            <Link
              href="/jobs"
              className="mt-4 inline-block text-sm font-medium text-ink-600 underline hover:text-ink-700"
            >
              Browse open roles →
            </Link>
          </div>
          <div className="card-glass">
            <Badge variant="secondary" className="bg-zinc-200 text-zinc-700">For employers</Badge>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-zinc-900">
              Reach candidates directly.
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Post a role with your own screening questions, and applications land straight in
              your dashboard, resume, cover note, and answers included. No bidding against other
              job boards for attention.
            </p>
            {postJobHref && (
            <Link
              href={postJobHref}
              className="mt-4 inline-block text-sm font-medium text-ink-600 underline hover:text-ink-700"
            >
              Post a job →
            </Link>
            )}
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900">
          Find your next role in 3 steps
        </h2>
        <Reveal className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="card-glass">
            <span className="flex size-8 items-center justify-center rounded-full bg-ink-50 font-mono text-sm text-ink-600">
              1
            </span>
            <h3 className="mt-3 font-semibold text-zinc-900">Search &amp; filter</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Filter every listing by category, location, date posted, or employment
              type to find roles that actually fit.
            </p>
          </div>
          <div className="card-glass">
            <span className="flex size-8 items-center justify-center rounded-full bg-ink-50 font-mono text-sm text-ink-600">
              2
            </span>
            <h3 className="mt-3 font-semibold text-zinc-900">Apply once, per role</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Upload a resume, add a cover note, and answer any screening questions the company
              set, all on the job page. No separate account per employer.
            </p>
          </div>
          <div className="card-glass">
            <span className="flex size-8 items-center justify-center rounded-full bg-ink-50 font-mono text-sm text-ink-600">
              3
            </span>
            <h3 className="mt-3 font-semibold text-zinc-900">Track the outcome</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Your dashboard shows every application&apos;s status: pending, reviewed, accepted, or
              rejected. It updates the moment the employer acts on it.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Why 365DaysJobsTeam */}
      <section className="py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900">
          Built to cut out the noise
        </h2>
        <Reveal className="mt-8 grid gap-4 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold text-zinc-900">Verified companies only</h3>
            <p className="mt-2 text-sm text-zinc-600">
              A real company address and email are required before any role goes live.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900">Direct applications</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Your application goes to the employer, not a recruiter&apos;s inbox waiting to be
              resold.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900">One dashboard</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Every role you&apos;ve applied to, and its status, in one place, updated in real time.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Final CTA */}
      {!session?.user && (
        <section className="py-16 text-center">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
              Ready to find your next role?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
              Create a free account to apply to verified companies and track every application in
              one place.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className={buttonVariants({ variant: "default" })}>
                Sign up free
              </Link>
            </div>
          </Reveal>
        </section>
      )}

    </div>
  );
}

const getRecentJobs = unstable_cache(
  async () =>
    prisma.job.findMany({
      where: { status: "PUBLISHED", AND: [liveClause(await readEmployerPlanRequired())] },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ["recent-jobs"],
  { tags: ["jobs"], revalidate: 60 }
);

async function RecentJobs() {
  const jobs = await getRecentJobs();

  if (jobs.length === 0) {
    return (
      <p className="col-span-full rounded-xl border border-dashed border-zinc-200 p-8 text-center text-zinc-500">
        No roles posted yet, check back soon.
      </p>
    );
  }

  const save = await getSaveContext(jobs.map((j) => j.id));
  return jobs.map((job) => <JobCard key={job.id} job={job} save={save} />);
}

function RecentJobsSkeleton() {
  return Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="card flex gap-4">
      <Skeleton className="size-10 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  ));
}
