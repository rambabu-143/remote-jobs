import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ApplyForm from "@/components/ApplyForm";
import { employmentLabel, formatSalary, initials, remoteLabel } from "@/lib/job-labels";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!job || !job.isActive) notFound();

  const session = await auth();
  const existingApplication = session?.user
    ? await prisma.application.findUnique({
        where: { jobId_applicantId: { jobId: job.id, applicantId: session.user.id } },
      })
    : null;

  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <div>
      <Link href="/jobs" className="text-sm text-zinc-400 hover:text-white">
        ← Back to all jobs
      </Link>

      <div className="mt-4 flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-base font-semibold text-zinc-300">
          {initials(job.company)}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{job.title}</h1>
          <p className="mt-1 text-zinc-400">
            {job.company} · {job.location}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="max-w-2xl lg:col-span-2">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="badge bg-copper-950 text-copper-400">{remoteLabel[job.remoteType]}</span>
            <span className="badge bg-zinc-800 text-zinc-300">{employmentLabel[job.employmentType]}</span>
            {salary && <span className="badge bg-zinc-800 font-mono text-zinc-300">{salary}</span>}
          </div>

          <div className="mt-6 max-w-none whitespace-pre-wrap text-sm leading-6 text-zinc-300">
            {job.description}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card">
            <h2 className="text-sm font-semibold text-white">Apply on RemoteJobs</h2>
            {!session?.user ? (
              <p className="mt-2 text-sm text-zinc-400">
                <a href="/login" className="text-copper-400 underline hover:text-copper-300">
                  Log in
                </a>{" "}
                to submit an application.
              </p>
            ) : existingApplication ? (
              <p className="mt-2 text-sm text-emerald-400">
                You already applied — status: {existingApplication.status}
              </p>
            ) : (
              <ApplyForm jobId={job.id} questions={job.questions} />
            )}

            {(job.applyUrl || job.applyEmail) && (
              <p className="mt-4 border-t border-zinc-800 pt-4 text-sm text-zinc-400">
                Prefer to apply directly?{" "}
                {job.applyUrl && (
                  <a
                    href={job.applyUrl}
                    className="text-copper-400 underline hover:text-copper-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Company site
                  </a>
                )}
                {job.applyUrl && job.applyEmail && " or "}
                {job.applyEmail && (
                  <a href={`mailto:${job.applyEmail}`} className="text-copper-400 underline hover:text-copper-300">
                    {job.applyEmail}
                  </a>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
