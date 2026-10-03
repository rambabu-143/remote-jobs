import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import JobForm from "@/components/JobForm";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Edit job</h1>
      <div className="mt-6">
        <JobForm job={job} />
      </div>
    </div>
  );
}
