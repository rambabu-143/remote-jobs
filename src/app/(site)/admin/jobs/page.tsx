import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toggleJobActive, deleteJob } from "@/lib/actions/jobs";

export default async function AdminJobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Manage jobs</h1>
      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-800 bg-black">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-black text-left text-xs uppercase text-zinc-500">
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
              <tr key={job.id} className="border-b border-zinc-800 last:border-0">
                <td className="px-4 py-3 font-medium">{job.title}</td>
                <td className="px-4 py-3 text-zinc-400">{job.company}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      job.isActive ? "bg-emerald-950 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {job.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/jobs/${job.id}/applications`} className="underline">
                    {job._count.applications}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3 text-xs">
                    <Link href={`/admin/jobs/${job.id}/edit`} className="text-zinc-400 hover:underline">
                      Edit
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await toggleJobActive(job.id);
                      }}
                    >
                      <button className="text-zinc-400 hover:underline">
                        {job.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await deleteJob(job.id);
                      }}
                    >
                      <button className="text-red-400 hover:underline">Delete</button>
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
    </div>
  );
}
