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
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-white">Edit job</h1>
      <div className="mt-6">
        <JobForm job={job} />
      </div>
    </div>
  );
}
