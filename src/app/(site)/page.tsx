import Link from "next/link";
import { prisma } from "@/lib/prisma";
import JobCard from "@/components/JobCard";

export default async function LandingPage() {
  const [openCount, companies, applicationCount, featuredJobs] = await Promise.all([
    prisma.job.count({ where: { isActive: true } }),
    prisma.job.findMany({ where: { isActive: true }, distinct: ["company"], select: { company: true } }),
    prisma.application.count(),
    prisma.job.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="py-16 text-center sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Work from anywhere.
          <br />
          <span className="text-copper-400">Hire from anywhere.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          RemoteJobs connects remote-first companies with people who want to do their best work
          from wherever they are — no relocation, no commute, no office politics.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/jobs" className="btn-primary">
            Browse {openCount} open role{openCount === 1 ? "" : "s"}
          </Link>
          <Link href="/admin/jobs/new" className="btn-secondary">
            Post a job
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-4 border-t border-zinc-800 py-10 text-center">
        <div>
          <p className="text-3xl font-bold text-white">{openCount}</p>
          <p className="mt-1 text-sm text-zinc-500">Open roles</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white">{companies.length}</p>
          <p className="mt-1 text-sm text-zinc-500">Companies hiring</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white">{applicationCount}</p>
          <p className="mt-1 text-sm text-zinc-500">Applications sent</p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-800 py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight text-white">How it works</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="card">
            <span className="flex size-8 items-center justify-center rounded-full bg-copper-950 font-mono text-sm text-copper-400">
              1
            </span>
            <h3 className="mt-3 font-semibold text-white">Search &amp; filter</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Filter every listing by remote/hybrid/on-site, employment type, or a free-text
              search across title, company, and tags.
            </p>
          </div>
          <div className="card">
            <span className="flex size-8 items-center justify-center rounded-full bg-copper-950 font-mono text-sm text-copper-400">
              2
            </span>
            <h3 className="mt-3 font-semibold text-white">Apply once, per role</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Upload a resume, add a cover note, and answer any screening questions the company
              set — all on the job page, no separate account per employer.
            </p>
          </div>
          <div className="card">
            <span className="flex size-8 items-center justify-center rounded-full bg-copper-950 font-mono text-sm text-copper-400">
              3
            </span>
            <h3 className="mt-3 font-semibold text-white">Track the outcome</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Your dashboard shows every application&apos;s status — pending, reviewed, accepted, or
              rejected — updated the moment the employer acts on it.
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

      {/* For employers */}
      <section className="border-t border-zinc-800 py-16">
        <div className="card sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Hiring remotely?</h2>
            <p className="mt-2 max-w-md text-sm text-zinc-400">
              Post a role, set optional screening questions, and manage every applicant&apos;s status
              from one admin dashboard.
            </p>
          </div>
          <Link href="/admin/jobs/new" className="btn-primary mt-4 inline-block sm:mt-0">
            Post a job
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-zinc-800 py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white">Ready to find your next role?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
          Create a free account to apply and track every application in one place.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className="btn-primary">
            Sign up free
          </Link>
          <Link href="/jobs" className="btn-secondary">
            Browse jobs
          </Link>
        </div>
      </section>

      <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
        RemoteJobs — a demo job board.
      </footer>
    </div>
  );
}
