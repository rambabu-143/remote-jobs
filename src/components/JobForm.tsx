"use client";

import { useActionState, useState } from "react";
import { saveJob } from "@/lib/actions/jobs";
import { JOB_CATEGORIES, LOCATIONS } from "@/lib/job-labels";
import type { Job, JobQuestion } from "@prisma/client";
import Spinner from "./Spinner";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-zinc-200 pt-6 first:border-t-0 first:pt-0">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

export default function JobForm({ job }: { job?: Job & { questions?: JobQuestion[] } }) {
  const [error, formAction, pending] = useActionState(saveJob, undefined);
  const [locationIsOther, setLocationIsOther] = useState(
    Boolean(job && !LOCATIONS.includes(job.location)),
  );

  return (
    <form action={formAction} className="card max-w-2xl">
      {job && <input type="hidden" name="id" value={job.id} />}
      {job?.logoUrl && <input type="hidden" name="existingLogoUrl" value={job.logoUrl} />}

      {/* Next injects hidden fields for the server action before this div, so
          `first:` classes on sections need their own DOM scope to work. */}
      <div className="space-y-6">
        <Section title="Basic info">
          <div>
            <label className="field-label">Job title</label>
            <input name="title" required defaultValue={job?.title} className="field-input" />
          </div>
          <div>
            <label className="field-label">Company</label>
            <input name="company" required defaultValue={job?.company} className="field-input" />
          </div>
          <div>
            <label className="field-label">Company logo</label>
            <input type="file" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="field-input" />
            {job?.logoUrl && (
              <p className="mt-1 text-xs text-zinc-500">Leave empty to keep the current logo.</p>
            )}
          </div>
          <div>
            <label className="field-label">Job category</label>
            <select name="category" required defaultValue={job?.category ?? JOB_CATEGORIES[0]} className="field-input">
              {JOB_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Description</label>
            <textarea
              name="description"
              required
              rows={6}
              defaultValue={job?.description}
              className="field-input"
            />
          </div>
        </Section>

        <Section title="Location & type">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Location</label>
              <select
                name="locationChoice"
                defaultValue={locationIsOther ? "Other" : job?.location ?? LOCATIONS[0]}
                onChange={(e) => setLocationIsOther(e.target.value === "Other")}
                className="field-input"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              {locationIsOther && (
                <input
                  name="locationOther"
                  required
                  defaultValue={locationIsOther ? job?.location : ""}
                  placeholder="Specify location"
                  className="field-input mt-2"
                />
              )}
            </div>
            <div>
              <label className="field-label">Tags (comma separated)</label>
              <input
                name="tags"
                defaultValue={job?.tags}
                placeholder="react,typescript"
                className="field-input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Location type</label>
              <select name="remoteType" defaultValue={job?.remoteType ?? "REMOTE"} className="field-input">
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-site</option>
              </select>
            </div>
            <div>
              <label className="field-label">Employment type</label>
              <select name="employmentType" defaultValue={job?.employmentType ?? "FULL_TIME"} className="field-input">
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
          </div>
        </Section>

        <Section title="Compensation">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Salary min (USD)</label>
              <input
                type="number"
                name="salaryMin"
                defaultValue={job?.salaryMin ?? undefined}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label">Salary max (USD)</label>
              <input
                type="number"
                name="salaryMax"
                defaultValue={job?.salaryMax ?? undefined}
                className="field-input"
              />
            </div>
          </div>
        </Section>

        <Section title="How to apply">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">External apply URL (optional)</label>
              <input
                type="url"
                name="applyUrl"
                defaultValue={job?.applyUrl ?? undefined}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label">Apply email (optional)</label>
              <input
                type="email"
                name="applyEmail"
                defaultValue={job?.applyEmail ?? undefined}
                className="field-input"
              />
            </div>
          </div>
          <div>
            <label className="field-label">Screening questions (optional, one per line)</label>
            <textarea
              name="questions"
              rows={3}
              defaultValue={job?.questions?.map((q) => q.question).join("\n")}
              placeholder={"Why do you want this role?\nHow many years of Node.js experience do you have?"}
              className="field-input"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Shown to applicants as required fields on the apply form.
            </p>
          </div>
        </Section>

        <Section title="Company verification">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Company address</label>
              <input
                name="companyAddress"
                defaultValue={job?.companyAddress ?? undefined}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label">Company phone number</label>
              <input
                type="tel"
                name="companyPhone"
                defaultValue={job?.companyPhone ?? undefined}
                className="field-input"
              />
            </div>
          </div>
          <div>
            <label className="field-label">Company email</label>
            <input
              type="email"
              name="companyEmail"
              defaultValue={job?.companyEmail ?? undefined}
              className="field-input"
            />
          </div>
        </Section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={pending} className="btn-primary flex items-center gap-2">
          {pending && <Spinner className="size-4" />}
          {pending ? "Saving…" : job ? "Save changes" : "Post job"}
        </button>
      </div>
    </form>
  );
}
