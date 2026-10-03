import { redirect } from "next/navigation";
import JobForm from "@/components/JobForm";
import { auth } from "@/lib/auth";
import { isEmployerPlanRequired } from "@/lib/settings";

export default async function NewEmployerJobPage() {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYER") redirect(session?.user?.role === "ADMIN" ? "/admin/jobs/new" : "/dashboard");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Post a job</h1>
      <p className="mt-2 text-sm text-zinc-600">
        {(await isEmployerPlanRequired())
          ? "Your job goes to our team for approval. With an active employer plan it is sent straight away; without one it is saved as a draft until you subscribe."
          : "Your job goes to our team for approval before it goes live."}
      </p>
      <div className="mt-6">
        <JobForm />
      </div>
    </div>
  );
}
