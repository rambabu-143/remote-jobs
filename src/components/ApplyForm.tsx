"use client";

import { useActionState } from "react";
import { applyToJob } from "@/lib/actions/applications";
import type { JobQuestion } from "@prisma/client";

export default function ApplyForm({ jobId, questions }: { jobId: string; questions: JobQuestion[] }) {
  const [message, formAction, pending] = useActionState(applyToJob, undefined);

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input type="hidden" name="jobId" value={jobId} />
      <div>
        <label className="block text-xs font-medium text-zinc-300">Resume (PDF or Word, max 4MB)</label>
        <input
          type="file"
          name="resume"
          required
          accept=".pdf,.doc,.docx"
          className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-300">Cover note (optional)</label>
        <textarea
          name="coverNote"
          rows={3}
          className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
        />
      </div>
      {questions.map((q) => (
        <div key={q.id}>
          <label className="block text-xs font-medium text-zinc-300">{q.question}</label>
          <input
            name={`answer_${q.id}`}
            required
            className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
          />
        </div>
      ))}
      {message && <p className="text-sm text-zinc-300">{message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
