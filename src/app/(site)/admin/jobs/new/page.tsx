import JobForm from "@/components/JobForm";

export default function NewJobPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-white">Post a new job</h1>
      <div className="mt-6">
        <JobForm />
      </div>
    </div>
  );
}
