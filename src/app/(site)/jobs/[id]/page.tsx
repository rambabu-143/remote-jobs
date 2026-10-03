import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ApplyForm from "@/components/ApplyForm";
import Skeleton from "@/components/Skeleton";
import { hasActiveSubscription } from "@/lib/actions/subscription";
import { employmentLabel, formatSalary, initials, remoteLabel } from "@/lib/job-labels";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <Link href="/jobs" className="text-sm text-zinc-600 hover:text-zinc-900">
        ← Back to all jobs
      </Link>

      <Suspense fallback={<JobDetailSkeleton />}>
        <JobDetail id={id} />
      </Suspense>
    </div>
  );
}

const getCachedJob = unstable_cache(
  (id: string) =>
    prisma.job.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: "asc" } } },
    }),
  ["job-detail"],
  { tags: ["jobs"], revalidate: 60 }
);

async function JobDetail({ id }: { id: string }) {
  const job = await getCachedJob(id);
  if (!job || job.status !== "PUBLISHED") notFound();

  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const isEmployer = session?.user?.role === "EMPLOYER";
  const [existingApplication, subscribed] = await Promise.all([
    session?.user
      ? prisma.application.findUnique({
          where: { jobId_applicantId: { jobId: job.id, applicantId: session.user.id } },
        })
      : null,
    session?.user && !isAdmin && !isEmployer ? hasActiveSubscription(session.user.id) : true,
  ]);

  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <>
      <div className="mt-4 flex items-start gap-4">
        {job.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.logoUrl}
            alt={`${job.company} logo`}
            className="size-12 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-base font-semibold text-zinc-700">
            {initials(job.company)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{job.title}</h1>
          <p className="mt-1 text-zinc-600">
            {job.company} · {job.location}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="max-w-2xl lg:col-span-2">
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary" className="bg-zinc-200 text-zinc-700">{remoteLabel[job.remoteType]}</Badge>
            <Badge variant="secondary" className="bg-zinc-200 text-zinc-700">{employmentLabel[job.employmentType]}</Badge>
            <Badge variant="secondary" className="bg-zinc-200 text-zinc-700">{job.category}</Badge>
            {salary && <Badge variant="secondary" className="bg-zinc-200 font-mono text-zinc-700">{salary}</Badge>}
          </div>

          <div className="mt-6 max-w-none whitespace-pre-wrap text-sm leading-6 text-zinc-700">
            {job.description}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card">
            <h2 className="text-sm font-semibold text-zinc-900">Apply on 365DaysJobsTeam</h2>
            {!session?.user ? (
              <p className="mt-2 text-sm text-zinc-600">
                <a href="/login" className="text-ink-600 underline hover:text-ink-700">
                  Log in
                </a>{" "}
                to submit an application.
              </p>
            ) : isEmployer ? (
              <p className="mt-2 text-sm text-zinc-600">Employer accounts can&apos;t apply to jobs. Log in with a job seeker account to apply.</p>
            ) : existingApplication ? (
              <p className="mt-2 text-sm text-emerald-600">
                You already applied. Status: {existingApplication.status}
              </p>
            ) : !subscribed ? (
              <div className="mt-2">
                <p className="text-sm text-zinc-600">
                  Subscribe to unlock the apply form and this company&apos;s contact details.
                </p>
                <Link href="/pricing" className={cn(buttonVariants({ variant: "default" }), "mt-3 inline-block")}>
                  See plans
                </Link>
              </div>
            ) : (
              <ApplyForm jobId={job.id} questions={job.questions} />
            )}

            {subscribed && !isEmployer && (job.applyUrl || job.applyEmail) && (
              <p className="mt-4 border-t border-zinc-200 pt-4 text-sm text-zinc-600">
                Prefer to apply directly?{" "}
                {job.applyUrl && (
                  <a
                    href={job.applyUrl}
                    className="text-ink-600 underline hover:text-ink-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Company site
                  </a>
                )}
                {job.applyUrl && job.applyEmail && " or "}
                {job.applyEmail && (
                  <a href={`mailto:${job.applyEmail}`} className="text-ink-600 underline hover:text-ink-700">
                    {job.applyEmail}
                  </a>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="mt-4 flex gap-4">
      <Skeleton className="size-12 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
