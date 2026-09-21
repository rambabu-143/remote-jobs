import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import JobCard from "@/components/JobCard";

export default async function LandingPage() {
  const [session, openCount, featuredJobs] = await Promise.all([
    auth(),
    prisma.job.count({ where: { isActive: true } }),
    prisma.job.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="py-16 text-center sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Remote jobs from
          <br />
          <span className="text-copper-400">verified employers.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          Every company on RemoteJobs lists a real address, phone, and email before a role goes
          live. Apply straight to the company, no recruiters, no spam.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/jobs" className="btn-primary">
            Browse {openCount} open role{openCount === 1 ? "" : "s"}
          </Link>
          <Link href="/admin/jobs/new" className="btn-secondary">
            Post a job
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
          <span>✓ Verified employers</span>
          <span>✓ Apply directly</span>
          <span>✓ No recruiter spam</span>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-800 py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight text-white">
          Find your next role in 3 steps
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="card">
            <span className="flex size-8 items-center justify-center rounded-full bg-copper-950 font-mono text-sm text-copper-400">
              1
            </span>
            <h3 className="mt-3 font-semibold text-white">Search &amp; filter</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Filter every listing by category, location, remote/hybrid/on-site, or employment
              type to find roles that actually fit.
            </p>
          </div>
          <div className="card">
            <span className="flex size-8 items-center justify-center rounded-full bg-copper-950 font-mono text-sm text-copper-400">
              2
            </span>
            <h3 className="mt-3 font-semibold text-white">Apply once, per role</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Upload a resume, add a cover note, and answer any screening questions the company
              set, all on the job page. No separate account per employer.
            </p>
          </div>
          <div className="card">
            <span className="flex size-8 items-center justify-center rounded-full bg-copper-950 font-mono text-sm text-copper-400">
              3
            </span>
            <h3 className="mt-3 font-semibold text-white">Track the outcome</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Your dashboard shows every application&apos;s status: pending, reviewed, accepted, or
              rejected. It updates the moment the employer acts on it.
            </p>
          </div>
        </div>
      </section>

      {/* Featured jobs */}
      {featuredJobs.length > 0 && (
        <section className="border-t border-zinc-800 py-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-white">Recently posted</h2>
            <Link href="/jobs" className="text-sm text-copper-400 underline hover:text-copper-300">
              View all jobs
            </Link>
          </div>
          <div className="mt-6 grid gap-4">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      {!session?.user && (
        <section className="border-t border-zinc-800 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">Ready to find your next role?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Create a free account to apply to verified employers and track every application in
            one place.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn-primary">
              Sign up free
            </Link>
          </div>
        </section>
      )}

      <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
        RemoteJobs. Remote jobs from verified employers.
      </footer>
    </div>
  );
}
