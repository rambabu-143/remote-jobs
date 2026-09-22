import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusLabel } from "@/lib/job-labels";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [applications, user] = await Promise.all([
    prisma.application.findMany({
      where: { applicantId: session.user.id },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
  ]);
  const isActive = Boolean(user.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date());

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-white">My applications</h1>

      {session.user.role !== "ADMIN" && (
        <p className="mt-2 text-sm text-zinc-400">
          {isActive ? (
            <>Apply access active until {user.subscriptionExpiresAt!.toLocaleDateString()}.</>
          ) : (
            <>
              No active plan.{" "}
              <Link href="/pricing" className="text-copper-400 underline hover:text-copper-300">
                See plans
              </Link>
            </>
          )}
        </p>
      )}

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
