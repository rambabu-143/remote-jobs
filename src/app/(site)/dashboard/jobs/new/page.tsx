import JobForm from "@/components/JobForm";

export default function NewEmployerJobPage() {
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
