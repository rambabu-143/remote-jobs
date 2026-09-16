import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ApplyForm from "@/components/ApplyForm";

const remoteLabel: Record<string, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

const employmentLabel: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

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

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <p className="mt-1 text-zinc-400">
        {job.company} · {job.location}
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-emerald-950 px-2 py-1 text-emerald-400">
          {remoteLabel[job.remoteType]}
        </span>
        <span className="rounded-full bg-zinc-800 px-2 py-1 text-zinc-300">
          {employmentLabel[job.employmentType]}
        </span>
        {(job.salaryMin || job.salaryMax) && (
          <span className="rounded-full bg-zinc-800 px-2 py-1 text-zinc-300">
            ${job.salaryMin ?? "?"} – ${job.salaryMax ?? "?"}
          </span>
        )}
      </div>

      <div className="prose prose-slate mt-6 max-w-none whitespace-pre-wrap text-sm leading-6">
        {job.description}
      </div>

      {(job.applyUrl || job.applyEmail) && (
        <p className="mt-6 text-sm text-zinc-400">
          You can also apply directly:{" "}
          {job.applyUrl && (
            <a href={job.applyUrl} className="text-white underline" target="_blank" rel="noopener noreferrer">
              company site
            </a>
          )}
          {job.applyUrl && job.applyEmail && " or "}
          {job.applyEmail && (
            <a href={`mailto:${job.applyEmail}`} className="text-white underline">
              {job.applyEmail}
            </a>
          )}
        </p>
      )}

      <div className="mt-8 rounded-lg border border-zinc-800 bg-black p-5">
        <h2 className="text-sm font-semibold">Apply on RemoteJobs</h2>
        {!session?.user ? (
          <p className="mt-2 text-sm text-zinc-400">
            <a href="/login" className="underline">
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
      </div>
    </div>
  );
}
