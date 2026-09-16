"use client";

import { useActionState } from "react";
import { saveJob } from "@/lib/actions/jobs";
import type { Job, JobQuestion } from "@/generated/prisma/client";

export default function JobForm({ job }: { job?: Job & { questions?: JobQuestion[] } }) {
  const [error, formAction, pending] = useActionState(saveJob, undefined);

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      {job && <input type="hidden" name="id" value={job.id} />}

      <div>
        <label className="block text-xs font-medium text-zinc-300">Job title</label>
        <input
          name="title"
          required
          defaultValue={job?.title}
          className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-300">Company</label>
        <input
          name="company"
          required
          defaultValue={job?.company}
          className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-300">Description</label>
        <textarea
          name="description"
          required
          rows={6}
          defaultValue={job?.description}
          className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300">Location</label>
          <input
            name="location"
            required
            defaultValue={job?.location}
            placeholder="Worldwide, US only, ..."
            className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-300">Tags (comma separated)</label>
          <input
            name="tags"
            defaultValue={job?.tags}
            placeholder="react,typescript"
            className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300">Location type</label>
          <select
            name="remoteType"
            defaultValue={job?.remoteType ?? "REMOTE"}
            className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
          >
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">On-site</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-300">Employment type</label>
          <select
            name="employmentType"
            defaultValue={job?.employmentType ?? "FULL_TIME"}
            className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
          >
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300">Salary min (USD)</label>
          <input
            type="number"
            name="salaryMin"
            defaultValue={job?.salaryMin ?? undefined}
            className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-300">Salary max (USD)</label>
          <input
            type="number"
            name="salaryMax"
            defaultValue={job?.salaryMax ?? undefined}
            className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300">External apply URL (optional)</label>
          <input
            type="url"
            name="applyUrl"
            defaultValue={job?.applyUrl ?? undefined}
            className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-300">Apply email (optional)</label>
          <input
            type="email"
            name="applyEmail"
            defaultValue={job?.applyEmail ?? undefined}
            className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-300">
          Screening questions (optional, one per line)
        </label>
        <textarea
          name="questions"
          rows={3}
          defaultValue={job?.questions?.map((q) => q.question).join("\n")}
          placeholder={"Why do you want this role?\nHow many years of Node.js experience do you have?"}
          className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Shown to applicants as required fields on the apply form.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
      >
        {pending ? "Saving…" : job ? "Save changes" : "Post job"}
      </button>
    </form>
  );
}
