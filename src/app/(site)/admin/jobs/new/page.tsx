import JobForm from "@/components/JobForm";

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Post a new job</h1>
      <div className="mt-6">
        <JobForm />
      </div>
    </div>
  );
}
