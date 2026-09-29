import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StatusSelect from "@/components/StatusSelect";
import Skeleton from "@/components/Skeleton";

export default async function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <Suspense fallback={<ApplicationsSkeleton />}>
        <Applications id={id} />
      </Suspense>
    </div>
  );
}

async function Applications({ id }: { id: string }) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      applications: {
        include: { applicant: true, answers: { include: { question: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!job) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Applicants for {job.title}</h1>
      <div className="mt-6 grid gap-3">
        {job.applications.map((app) => (
          <div key={app.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-zinc-900">{app.applicant.name}</p>
                <p className="text-sm text-zinc-600">{app.applicant.email}</p>
                <a
                  href={`/api/files/resumes/${app.resumeFileName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm text-ink-600 underline hover:text-ink-700"
                >
                  View resume
                </a>
                {app.coverNote && <p className="mt-2 text-sm text-zinc-700">{app.coverNote}</p>}
                {app.answers.length > 0 && (
                  <dl className="mt-2 space-y-1">
                    {app.answers.map((a) => (
                      <div key={a.id} className="text-sm">
                        <dt className="font-medium text-zinc-700">{a.question.question}</dt>
                        <dd className="text-zinc-600">{a.answer}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
              <StatusSelect applicationId={app.id} status={app.status} />
            </div>
          </div>
        ))}
        {job.applications.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-zinc-500">
            No applications yet.
          </p>
        )}
      </div>
    </>
  );
}

function ApplicationsSkeleton() {
  return (
    <>
      <Skeleton className="h-9 w-64" />
      <div className="mt-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </>
  );
}
