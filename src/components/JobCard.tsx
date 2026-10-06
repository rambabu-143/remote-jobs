import Link from "next/link";
import type { Job } from "@prisma/client";
import { employmentLabel, formatRelativeTime, formatSalary, initials } from "@/lib/job-labels";
import { Clock, MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SaveButton from "@/components/SaveButton";
import type { SaveContext } from "@/lib/saved";

export default function JobCard({ job, save }: { job: Job; save?: SaveContext }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    // The whole card is clickable through the title's stretched link; the heart sits above it,
    // so a button is never nested inside a link.
    <div className="card group relative flex min-w-0 gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_18px_40px_rgba(0,0,0,0.16)]">
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
              <Link href={`/jobs/${job.id}`} className="after:absolute after:inset-0 after:rounded-[inherit]">
                {job.title}
              </Link>
            </h2>
            <p className="truncate text-sm text-zinc-600" title={job.company}>
              {job.company}
            </p>
            {salary && <p className="mt-1 whitespace-nowrap font-mono text-sm font-medium text-ink-600">{salary}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <p className="whitespace-nowrap text-xs text-zinc-500">{formatRelativeTime(job.createdAt)}</p>
            {save && save.mode !== "hidden" && (
              <SaveButton jobId={job.id} initialSaved={save.savedIds.has(job.id)} loggedIn={save.mode === "user"} />
            )}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary" className="bg-zinc-200 text-zinc-700"><Clock className="size-3" />{employmentLabel[job.employmentType]}</Badge>
          <Badge variant="secondary" className="bg-zinc-200 text-zinc-700"><MapPin className="size-3" />{job.location}</Badge>
          <Badge variant="secondary" className="bg-zinc-200 text-zinc-700"><Tag className="size-3" />{job.category}</Badge>
        </div>
      </div>
    </div>
  );
}
