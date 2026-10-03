import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toggleJobActive, deleteJob, approveJob, rejectJob } from "@/lib/actions/jobs";
import Skeleton from "@/components/Skeleton";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminJobsPage() {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Manage jobs</h1>
        <Link href="/admin/jobs/new" className={buttonVariants()}>
          Post a new job
        </Link>
      </div>

      <Suspense fallback={<AdminJobsTableSkeleton />}>
        <AdminJobsTable />
      </Suspense>
    </div>
  );
}

type AdminJob = Awaited<ReturnType<typeof loadJobs>>[number];

function loadJobs() {
  return prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="secondary"
      className={
        status === "PUBLISHED"
          ? "bg-emerald-50 text-emerald-600"
          : status === "PENDING"
            ? "bg-amber-50 text-amber-600"
            : status === "REJECTED"
              ? "bg-red-50 text-red-600"
              : "bg-zinc-200 text-zinc-600"
      }
    >
      {status}
    </Badge>
  );
}

// The same buttons are used by the wide-screen table and the narrow-screen cards.
function JobActions({ job }: { job: AdminJob }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={`/admin/jobs/${job.id}/edit`} />}>
        Edit
      </Button>
      {job.status === "PENDING" && (
        <>
          <form
            action={async () => {
              "use server";
              await approveJob(job.id);
            }}
          >
            <Button type="submit" variant="ghost" size="sm" className="text-emerald-600">
              Approve
            </Button>
          </form>
          <form
            action={async () => {
              "use server";
              await rejectJob(job.id);
            }}
          >
            <Button type="submit" variant="ghost" size="sm" className="text-amber-600">
              Reject
            </Button>
          </form>
        </>
      )}
      {(job.status === "PUBLISHED" || job.status === "CLOSED") && (
        <form
          action={async () => {
            "use server";
            await toggleJobActive(job.id);
          }}
        >
          <Button type="submit" variant="ghost" size="sm">
            {job.status === "PUBLISHED" ? "Deactivate" : "Activate"}
          </Button>
        </form>
      )}
      <form
        action={async () => {
          "use server";
          await deleteJob(job.id);
        }}
      >
        <Button type="submit" variant="ghost" size="sm" className="text-red-600">
          Delete
        </Button>
      </form>
    </div>
  );
}

async function AdminJobsTable() {
  const jobs = await loadJobs();

  if (jobs.length === 0) {
    return <p className="card mt-6 p-8 text-center text-zinc-500">No jobs posted yet.</p>;
  }

  return (
    <>
      {/* Wide screens: table. Long titles wrap instead of pushing the buttons out of view. */}
      <div className="card mt-6 hidden !p-0 lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applicants</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="max-w-64 font-medium whitespace-normal text-zinc-900">{job.title}</TableCell>
                <TableCell className="max-w-40 whitespace-normal text-zinc-600">{job.company}</TableCell>
                <TableCell>
                  <StatusBadge status={job.status} />
                </TableCell>
                <TableCell>
                  <Link href={`/admin/jobs/${job.id}/applications`} className="text-ink-600 underline hover:text-ink-700">
                    {job._count.applications}
                  </Link>
                </TableCell>
                <TableCell>
                  <JobActions job={job} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Phones and tablets: one card per job so every button is visible without sideways scrolling. */}
      <div className="mt-6 grid gap-3 lg:hidden">
        {jobs.map((job) => (
          <div key={job.id} className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words font-medium text-zinc-900">{job.title}</p>
                <p className="break-words text-sm text-zinc-600">{job.company}</p>
              </div>
              <StatusBadge status={job.status} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link href={`/admin/jobs/${job.id}/applications`} className="text-sm text-ink-600 underline hover:text-ink-700">
                {job._count.applications} applicant{job._count.applications === 1 ? "" : "s"}
              </Link>
              <JobActions job={job} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function AdminJobsTableSkeleton() {
  return (
    <div className="card mt-6 space-y-3 !p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
