import { redirect } from "next/navigation";
import JobForm from "@/components/JobForm";
import { auth } from "@/lib/auth";

export default async function NewEmployerJobPage() {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYER") redirect(session?.user?.role === "ADMIN" ? "/admin/jobs/new" : "/dashboard");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Post a job</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Save your listing, then pay the one-time fee to send it for review.
      </p>
      <div className="mt-6">
        <JobForm />
      </div>
    </div>
  );
}
