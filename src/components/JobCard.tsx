import Link from "next/link";
import type { Job } from "@prisma/client";

const remoteLabel: Record<string, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

const employmentLabel: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  return fmt((min ?? max) as number);
}

export default function JobCard({ job }: { job: Job }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-lg border border-zinc-800 bg-black p-5 hover:border-zinc-600 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">{job.title}</h2>
          <p className="text-sm text-zinc-400">{job.company}</p>
        </div>
        {salary && <span className="whitespace-nowrap text-sm font-medium text-zinc-300">{salary}</span>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-emerald-950 px-2 py-1 text-emerald-400">
          {remoteLabel[job.remoteType]}
        </span>
        <span className="rounded-full bg-zinc-800 px-2 py-1 text-zinc-300">
          {employmentLabel[job.employmentType]}
        </span>
        <span className="rounded-full bg-zinc-800 px-2 py-1 text-zinc-300">{job.location}</span>
      </div>
      {job.tags && (
        <p className="mt-3 text-xs text-zinc-500">{job.tags.split(",").join(" · ")}</p>
      )}
    </Link>
  );
}
