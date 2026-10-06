import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusLabel } from "@/lib/job-labels";
import Skeleton from "@/components/Skeleton";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "EMPLOYER") redirect("/dashboard/jobs");
  if (session.user.role === "ADMIN") redirect("/admin/jobs"); // admins review jobs, they don't apply

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">My applications</h1>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}

async function DashboardContent({ userId }: { userId: string }) {
  const [applications, user] = await Promise.all([
    prisma.application.findMany({
      where: { applicantId: userId },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);
  const isActive = Boolean(user.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date());

  return (
    <>
      <p className="mt-2 text-sm text-zinc-600">
          {isActive ? (
            <>Apply access active until {user.subscriptionExpiresAt!.toLocaleDateString()}.</>
          ) : (
            <>
              No active plan.{" "}
              <Link href="/pricing" className="text-ink-600 underline hover:text-ink-700">
                See plans
              </Link>
            </>
          )}
        </p>

      <div className="mt-6 grid gap-3">
        {applications.map((app) => (
          <Link
            key={app.id}
            href={`/jobs/${app.jobId}`}
            className="card flex items-center justify-between transition-all hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_18px_40px_rgba(0,0,0,0.16)]"
          >
            <div>
              <p className="font-medium text-zinc-900">{app.job.title}</p>
              <p className="text-sm text-zinc-600">{app.job.company}</p>
            </div>
            <Badge variant="secondary" className={`${statusLabel[app.status].className}`}>
              {statusLabel[app.status].text}
            </Badge>
          </Link>
        ))}
        {applications.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-zinc-500">
            You haven&apos;t applied to any jobs yet.
          </p>
        )}
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mt-6 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
