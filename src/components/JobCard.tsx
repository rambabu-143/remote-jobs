import Link from "next/link";
import type { Job } from "@prisma/client";
import { employmentLabel, formatRelativeTime, formatSalary, initials } from "@/lib/job-labels";
import { Badge } from "@/components/ui/badge";

export default function JobCard({ job }: { job: Job }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const tags = job.tags ? job.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="card flex min-w-0 gap-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_18px_40px_rgba(0,0,0,0.16)]"
    >
      {job.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={job.logoUrl}
          alt={`${job.company} logo`}
          className="size-10 shrink-0 rounded-lg bg-white object-contain p-0.5 ring-1 ring-zinc-200"
        />
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-700">
          {initials(job.company)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* Long titles wrap onto two lines then cut off, so cards in a row stay the same height. */}
            <h2 className="line-clamp-2 break-words text-base font-semibold text-zinc-900" title={job.title}>
              {job.title}
            </h2>
            <p className="truncate text-sm text-zinc-600" title={job.company}>
              {job.company}
            </p>
            {salary && <p className="mt-1 whitespace-nowrap font-mono text-sm font-medium text-ink-600">{salary}</p>}
          </div>
          <p className="shrink-0 whitespace-nowrap text-xs text-zinc-500">{formatRelativeTime(job.createdAt)}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary" className="bg-zinc-200 text-zinc-700">{employmentLabel[job.employmentType]}</Badge>
          <Badge variant="secondary" className="bg-zinc-200 text-zinc-700">{job.location}</Badge>
          <Badge variant="secondary" className="bg-zinc-200 text-zinc-700">{job.category}</Badge>
        </div>
        {tags.length > 0 && (
          <p className="mt-3 truncate text-xs text-zinc-500">
            {tags.slice(0, 4).join("  ·  ")}
            {tags.length > 4 && `  +${tags.length - 4}`}
          </p>
        )}
      </div>
    </Link>
  );
}
