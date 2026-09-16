import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const applications = await prisma.application.findMany({
    where: { applicantId: session.user.id },
    include: { job: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">My applications</h1>
      <div className="mt-6 grid gap-3">
        {applications.map((app) => (
          <Link
            key={app.id}
            href={`/jobs/${app.jobId}`}
            className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black p-4 hover:border-zinc-600"
          >
            <div>
              <p className="font-medium">{app.job.title}</p>
              <p className="text-sm text-zinc-400">{app.job.company}</p>
            </div>
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
              {app.status}
            </span>
          </Link>
        ))}
        {applications.length === 0 && (
          <p className="rounded-lg border border-zinc-800 border-dashed p-8 text-center text-zinc-500">
            You haven&apos;t applied to any jobs yet.
          </p>
        )}
      </div>
    </div>
  );
}
