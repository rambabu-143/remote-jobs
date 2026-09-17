import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusLabel } from "@/lib/job-labels";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const applications = await prisma.application.findMany({
    where: { applicantId: session.user.id },
    include: { job: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-white">My applications</h1>
      <div className="mt-6 grid gap-3">
        {applications.map((app) => (
          <Link
            key={app.id}
            href={`/jobs/${app.jobId}`}
            className="card flex items-center justify-between transition-colors hover:border-zinc-600"
          >
            <div>
              <p className="font-medium text-white">{app.job.title}</p>
              <p className="text-sm text-zinc-400">{app.job.company}</p>
            </div>
            <span className={`badge ${statusLabel[app.status].className}`}>
              {statusLabel[app.status].text}
            </span>
          </Link>
        ))}
        {applications.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
            You haven&apos;t applied to any jobs yet.
          </p>
        )}
      </div>
    </div>
  );
}
