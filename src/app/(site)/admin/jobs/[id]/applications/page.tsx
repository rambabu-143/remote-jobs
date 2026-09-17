import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StatusSelect from "@/components/StatusSelect";

export default async function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-white">Applicants for {job.title}</h1>
      <div className="mt-6 grid gap-3">
        {job.applications.map((app) => (
          <div key={app.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-white">{app.applicant.name}</p>
                <p className="text-sm text-zinc-400">{app.applicant.email}</p>
                <a
                  href={`/api/files/resumes/${app.resumeFileName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm text-copper-400 underline hover:text-copper-300"
                >
                  View resume
                </a>
                {app.coverNote && <p className="mt-2 text-sm text-zinc-300">{app.coverNote}</p>}
                {app.answers.length > 0 && (
                  <dl className="mt-2 space-y-1">
                    {app.answers.map((a) => (
                      <div key={a.id} className="text-sm">
                        <dt className="font-medium text-zinc-300">{a.question.question}</dt>
                        <dd className="text-zinc-400">{a.answer}</dd>
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
          <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
            No applications yet.
          </p>
        )}
      </div>
    </div>
  );
}
