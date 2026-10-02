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

async function AdminJobsTable() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="card mt-6 !p-0">
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
              <TableCell className="font-medium text-zinc-900">{job.title}</TableCell>
              <TableCell className="text-zinc-600">{job.company}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={
                    job.status === "PUBLISHED"
                      ? "bg-emerald-50 text-emerald-600"
                      : job.status === "PENDING"
                        ? "bg-amber-50 text-amber-600"
                        : job.status === "REJECTED"
                          ? "bg-red-50 text-red-600"
                          : "bg-zinc-200 text-zinc-600"
                  }
                >
                  {job.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Link href={`/admin/jobs/${job.id}/applications`} className="text-ink-600 underline hover:text-ink-700">
                  {job._count.applications}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {jobs.length === 0 && (
        <p className="p-8 text-center text-zinc-500">No jobs posted yet.</p>
      )}
    </div>
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
