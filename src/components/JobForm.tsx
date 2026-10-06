"use client";

import { useActionState, useState } from "react";
import { saveJob } from "@/lib/actions/jobs";
import { JOB_CATEGORIES, LOCATIONS } from "@/lib/job-labels";
import type { Job, JobQuestion } from "@prisma/client";
import Spinner from "./Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SelectField, type Option } from "./SelectField";

const plain = (xs: readonly string[]): Option[] => xs.map((x) => ({ value: x, label: x }));
const EMPLOYMENT_TYPES: Option[] = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
];

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
      <input type="hidden" name="remoteType" value="REMOTE" />

      {/* Next injects hidden fields for the server action before this div, so
          `first:` classes on sections need their own DOM scope to work. */}
      <div className="space-y-6">
        <Section title="Basic info">
          <Field label="Job title" required>
            <Input name="title" required maxLength={150} defaultValue={job?.title} />
          </Field>
          <Field label="Company" required>
            <Input name="company" required maxLength={120} defaultValue={job?.company} />
          </Field>
          <Field label="Company logo">
            <Input type="file" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
            {job?.logoUrl && (
              <p className="text-xs text-zinc-500">Leave empty to keep the current logo.</p>
            )}
          </Field>
          <Field label="Job category" required>
            <SelectField name="category" options={plain(JOB_CATEGORIES)} defaultValue={job?.category ?? JOB_CATEGORIES[0]} />
          </Field>
          <Field label="Description" required>
            <Textarea name="description" required maxLength={10000} rows={6} defaultValue={job?.description} />
          </Field>
        </Section>

        <Section title="Location & type">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Candidates can be based in" required>
              <SelectField
                name="locationChoice"
                options={[...plain(LOCATIONS), { value: "Other", label: "Other" }]}
                defaultValue={locationIsOther ? "Other" : job?.location ?? LOCATIONS[0]}
                onValueChange={(v) => setLocationIsOther(v === "Other")}
              />
              {locationIsOther && (
                <Input
                  name="locationOther"
                  required
                  defaultValue={locationIsOther ? job?.location : ""}
                  placeholder="Specify location"
                  className="mt-2"
                />
              )}
            </Field>
            <Field label="Tags (comma separated)">
              <Input name="tags" defaultValue={job?.tags} placeholder="react,typescript" />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Employment type">
              <SelectField name="employmentType" options={EMPLOYMENT_TYPES} defaultValue={job?.employmentType ?? "FULL_TIME"} />
            </Field>
          </div>
        </Section>

        <Section title="Compensation">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Salary min (USD)">
              <Input type="number" name="salaryMin" defaultValue={job?.salaryMin ?? undefined} />
            </Field>
            <Field label="Salary max (USD)">
              <Input type="number" name="salaryMax" defaultValue={job?.salaryMax ?? undefined} />
            </Field>
          </div>
        </Section>

        <Section title="How to apply">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="External apply URL (optional)">
              <Input type="url" name="applyUrl" defaultValue={job?.applyUrl ?? undefined} />
            </Field>
            <Field label="Apply email (optional)">
              <Input type="email" name="applyEmail" defaultValue={job?.applyEmail ?? undefined} />
            </Field>
          </div>
          <Field label="Screening questions (optional, one per line)">
            <Textarea
              name="questions"
              rows={3}
              defaultValue={job?.questions?.map((q) => q.question).join("\n")}
              placeholder={"Why do you want this role?\nHow many years of Node.js experience do you have?"}
            />
            <p className="text-xs text-zinc-500">Shown to applicants as required fields on the apply form.</p>
          </Field>
        </Section>

        <Section title="Company verification">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Company address" required>
              <Input name="companyAddress" required minLength={8} maxLength={300} defaultValue={job?.companyAddress ?? undefined} />
            </Field>
            <Field label="Company phone number (optional)">
              <Input
                type="tel"
                name="companyPhone"
                pattern="[0-9+\(\)\-\s]{7,20}"
                title="Enter a valid phone number, for example +91 98765 43210"
                placeholder="+91 98765 43210"
                defaultValue={job?.companyPhone ?? undefined}
              />
            </Field>
          </div>
          <Field label="Company email" required>
            <Input type="email" name="companyEmail" required maxLength={120} defaultValue={job?.companyEmail ?? undefined} />
          </Field>
          <p className="text-xs text-zinc-500">
            Address and email are required. Our team uses them to verify your company before the job goes live.
          </p>
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            These details are shown publicly on your job page, so anyone, including spammers and scrapers, can see them.
            Use a company email (and a business phone number, if you add one) that you are happy to share, not a personal one.
          </p>
        </Section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={pending}>
          {pending && <Spinner className="size-4" />}
          {pending ? "Saving…" : job ? "Save changes" : "Post job"}
        </Button>
      </div>
    </form>
  );
}
