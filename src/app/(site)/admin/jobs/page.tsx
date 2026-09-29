import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toggleJobActive, deleteJob } from "@/lib/actions/jobs";
import Skeleton from "@/components/Skeleton";

export default function AdminJobsPage() {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Manage jobs</h1>
        <Link href="/admin/jobs/new" className="btn-primary">
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
    <div className="mt-6 overflow-x-auto rounded-md border border-zinc-900 bg-paper">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Applicants</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-b border-zinc-200 last:border-0 hover:bg-zinc-50/50">
              <td className="px-4 py-3 font-medium text-zinc-900">{job.title}</td>
              <td className="px-4 py-3 text-zinc-600">{job.company}</td>
              <td className="px-4 py-3">
                <span
                  className={`badge ${
                    job.status === "PUBLISHED"
                      ? "bg-emerald-50 text-emerald-600"
                      : job.status === "PENDING"
                        ? "bg-amber-50 text-amber-600"
                        : job.status === "REJECTED"
                          ? "bg-red-50 text-red-600"
                          : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {job.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/jobs/${job.id}/applications`} className="text-ink-600 underline hover:text-ink-700">
                  {job._count.applications}
                </Link>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-3 text-xs">
                  <Link href={`/admin/jobs/${job.id}/edit`} className="text-zinc-600 hover:underline">
                    Edit
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await toggleJobActive(job.id);
                    }}
                  >
                    <button className="text-zinc-600 hover:underline">
                      {job.status === "PUBLISHED" ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await deleteJob(job.id);
                    }}
                  >
                    <button className="text-red-600 hover:underline">Delete</button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {jobs.length === 0 && (
        <p className="p-8 text-center text-zinc-500">No jobs posted yet.</p>
      )}
    </div>
  );
}

function AdminJobsTableSkeleton() {
  return (
    <div className="mt-6 space-y-3 rounded-md border border-zinc-900 bg-paper p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
