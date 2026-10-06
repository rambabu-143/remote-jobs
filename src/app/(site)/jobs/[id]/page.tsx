import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ApplyForm from "@/components/ApplyForm";
import Skeleton from "@/components/Skeleton";
import { hasActiveSubscription } from "@/lib/actions/subscription";
import { employmentLabel, formatSalary, initials } from "@/lib/job-labels";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isLive } from "@/lib/live-jobs";
import { isEmployerPlanRequired } from "@/lib/settings";
import { getSaveContext } from "@/lib/saved";
import { Clock, Tag } from "lucide-react";
import SaveButton from "@/components/SaveButton";
import ExternalApplyButton from "@/components/ExternalApplyButton";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const job = await getCachedJob(id);
  if (!job || !isLive(job, await isEmployerPlanRequired())) return { title: "Job not found", robots: { index: false } };
  const description = job.description.replace(/\s+/g, " ").trim().slice(0, 160);
  return {
    title: `${job.title} at ${job.company}`,
    description,
    alternates: { canonical: `/jobs/${job.id}` },
    openGraph: { title: `${job.title} at ${job.company}`, description, type: "article" },
  };
}

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Checked before streaming starts so a missing or expired job returns a real 404 status
  // (not a 200 "not found" page, which search engines treat as a soft 404). Cached 60s.
  const job = await getCachedJob(id);
  if (!job || !isLive(job, await isEmployerPlanRequired())) notFound();

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
      include: { questions: { orderBy: { order: "asc" } }, postedBy: { select: { role: true, subscriptionExpiresAt: true } } },
    }),
  ["job-detail"],
  { tags: ["jobs"], revalidate: 60 }
);

async function JobDetail({ id }: { id: string }) {
  const job = await getCachedJob(id);
  if (!job || !isLive(job, await isEmployerPlanRequired())) notFound();

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
  const save = await getSaveContext([job.id]);

  // Structured data so Google can show the job in its job search. Salary is left out on purpose
  // (no stored currency), so we never publish a wrong number.
  const employmentTypes: Record<string, string> = { FULL_TIME: "FULL_TIME", PART_TIME: "PART_TIME", CONTRACT: "CONTRACTOR", INTERNSHIP: "INTERN" };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt,
    ...(job.postedBy.role !== "ADMIN" && job.postedBy.subscriptionExpiresAt ? { validThrough: job.postedBy.subscriptionExpiresAt } : {}),
    employmentType: employmentTypes[job.employmentType],
    hiringOrganization: { "@type": "Organization", name: job.company, ...(job.logoUrl ? { logo: job.logoUrl } : {}) },
    // Every job on this board is remote. "Worldwide" isn't a country, so it gets no country restriction.
    jobLocationType: "TELECOMMUTE",
    ...(job.location !== "Worldwide" ? { applicantLocationRequirements: { "@type": "Country", name: job.location } } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // "<" escaped so a job description can't close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {/* Heading on the left, the Apply button opposite it on the right. */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {job.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.logoUrl}
              alt={`${job.company} logo`}
              className="size-12 shrink-0 rounded-lg bg-white object-contain p-1 ring-1 ring-zinc-200"
            />
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-base font-semibold text-zinc-700">
              {initials(job.company)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold tracking-tight text-zinc-900">{job.title}</h1>
            <p className="mt-1 break-words text-zinc-600">
              {job.company} · {job.location}
            </p>
          </div>
        </div>

        {/* Save (heart) + Apply, opposite the heading. Employers can't apply, so they get neither. */}
        {!isEmployer && !isAdmin && (
          <div className="flex shrink-0 items-center gap-2">
            {save.mode !== "hidden" && (
              <SaveButton
                jobId={job.id}
                initialSaved={save.savedIds.has(job.id)}
                loggedIn={save.mode === "user"}
                className="size-9 bg-white ring-1 ring-zinc-200"
              />
            )}
            {existingApplication ? (
              <span className="inline-flex h-9 flex-1 items-center justify-center rounded-full bg-emerald-50 px-5 text-sm font-medium text-emerald-600 sm:flex-none">
                Applied · {existingApplication.status}
              </span>
            ) : job.applyUrl ? (
              // The company takes applications on its own site, so no resume form here.
              <ExternalApplyButton
                jobId={job.id}
                applyUrl={job.applyUrl}
                title={job.title}
                company={job.company}
                canTrack={session?.user?.role === "USER"}
                className="h-9 flex-1 rounded-full px-6 sm:flex-none"
              />
            ) : (
              <Link
                href={!session?.user ? "/login" : !subscribed ? `/pricing?next=${encodeURIComponent(`/jobs/${job.id}`)}` : "#apply"}
                className={cn(buttonVariants({ variant: "default" }), "h-9 flex-1 rounded-full px-6 sm:flex-none")}
              >
                Apply
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        <Badge variant="secondary" className="bg-zinc-200 text-zinc-700"><Clock className="size-3" />{employmentLabel[job.employmentType]}</Badge>
        <Badge variant="secondary" className="bg-zinc-200 text-zinc-700"><Tag className="size-3" />{job.category}</Badge>
        {salary && <Badge variant="secondary" className="bg-zinc-200 font-mono text-zinc-700">{salary}</Badge>}
      </div>

      <div className="mt-6 max-w-3xl whitespace-pre-wrap break-words text-sm leading-6 text-zinc-700">
        {job.description}
      </div>

      {(job.companyAddress || job.companyPhone || job.companyEmail) && (
        <section className="mt-8 max-w-3xl rounded-xl border border-zinc-200 bg-white p-4 text-sm">
          <h2 className="font-semibold text-zinc-900">About {job.company}</h2>
          <dl className="mt-2 grid gap-1 text-zinc-700 sm:grid-cols-[6rem_1fr]">
            {job.companyAddress && (<><dt className="text-zinc-500">Address</dt><dd className="break-words">{job.companyAddress}</dd></>)}
            {job.companyPhone && (<><dt className="text-zinc-500">Phone</dt><dd><a href={`tel:${job.companyPhone.replace(/[^\d+]/g, "")}`} className="underline">{job.companyPhone}</a></dd></>)}
            {job.companyEmail && (<><dt className="text-zinc-500">Email</dt><dd className="break-all"><a href={`mailto:${job.companyEmail}`} className="underline">{job.companyEmail}</a></dd></>)}
          </dl>
        </section>
      )}

      {/* The Apply button above jumps here (only for people who can actually apply). */}
      {session?.user && !isEmployer && !isAdmin && !existingApplication && subscribed && !job.applyUrl && (
        <section id="apply" className="mt-10 max-w-2xl scroll-mt-28 border-t border-zinc-200 pt-6">
          <h2 className="text-lg font-semibold text-zinc-900">Apply for this job</h2>
          <ApplyForm jobId={job.id} questions={job.questions} />
          {(job.applyUrl || job.applyEmail) && (
            <p className="mt-6 text-sm text-zinc-600">
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
        </section>
      )}
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
