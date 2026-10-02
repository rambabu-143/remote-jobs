import Link from "next/link";
import type { Job } from "@prisma/client";
import { employmentLabel, formatRelativeTime, formatSalary, initials, remoteLabel } from "@/lib/job-labels";
import { Badge } from "@/components/ui/badge";

export default function JobCard({ job }: { job: Job }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="card flex gap-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_18px_40px_rgba(0,0,0,0.16)]"
    >
      {job.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={job.logoUrl}
          alt={`${job.company} logo`}
          className="size-10 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-700">
          {initials(job.company)}
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{job.title}</h2>
            <p className="text-sm text-zinc-600">{job.company}</p>
          </div>
          <div className="text-right">
            {salary && <p className="whitespace-nowrap font-mono text-sm font-medium text-ink-600">{salary}</p>}
            <p className="mt-1 whitespace-nowrap text-xs text-zinc-500">{formatRelativeTime(job.createdAt)}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary" className="bg-zinc-200 text-zinc-700">{remoteLabel[job.remoteType]}</Badge>
          <Badge variant="secondary" className="bg-zinc-200 text-zinc-700">{employmentLabel[job.employmentType]}</Badge>
          <Badge variant="secondary" className="bg-zinc-200 text-zinc-700">{job.location}</Badge>
          <Badge variant="secondary" className="bg-zinc-200 text-zinc-700">{job.category}</Badge>
        </div>
        {job.tags && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.tags.split(",").map((tag) => (
              <span key={tag} className="rounded-md bg-zinc-50 px-1.5 py-0.5 text-xs text-zinc-500">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
