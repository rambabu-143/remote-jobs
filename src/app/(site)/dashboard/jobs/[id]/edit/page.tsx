import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import JobForm from "@/components/JobForm";

export default async function EditMyJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (session?.user?.role !== "EMPLOYER") redirect(session?.user ? "/dashboard" : "/login");

  const job = await prisma.job.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!job || job.postedById !== session.user.id) notFound();

  const wasApproved = job.status === "PUBLISHED" || job.status === "CLOSED";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Edit job</h1>
      {wasApproved && (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-700">
          Saving changes sends this job back for review. It will be hidden until it is approved again.
        </p>
      )}
      <div className="mt-6">
        <JobForm job={job} />
      </div>
    </div>
  );
}
