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
        <label className="field-label">Resume (PDF or Word, max 4MB)</label>
        <input type="file" name="resume" required accept=".pdf,.doc,.docx" className="field-input" />
      </div>
      <div>
        <label className="field-label">Cover note (optional)</label>
        <textarea name="coverNote" rows={3} className="field-input" />
      </div>
      {questions.map((q) => (
        <div key={q.id}>
          <label className="field-label">{q.question}</label>
          <input name={`answer_${q.id}`} required className="field-input" />
        </div>
      ))}
      {message && <p className="text-sm text-zinc-300">{message}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
