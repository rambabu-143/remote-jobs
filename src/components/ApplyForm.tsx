"use client";

import { useActionState } from "react";
import { applyToJob } from "@/lib/actions/applications";
import type { JobQuestion } from "@prisma/client";
import Spinner from "./Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ApplyForm({ jobId, questions }: { jobId: string; questions: JobQuestion[] }) {
  const [message, formAction, pending] = useActionState(applyToJob, undefined);

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input type="hidden" name="jobId" value={jobId} />
      <div className="space-y-1">
        <Label>Resume (PDF or Word, max 4MB)</Label>
        <Input type="file" name="resume" required accept=".pdf,.doc,.docx" />
      </div>
      <div className="space-y-1">
        <Label>Cover note (optional)</Label>
        <Textarea name="coverNote" rows={3} />
      </div>
      {questions.map((q) => (
        <div key={q.id} className="space-y-1">
          <Label>{q.question}</Label>
          <Input name={`answer_${q.id}`} required />
        </div>
      ))}
      {message && <p className="text-sm text-zinc-700">{message}</p>}
      <Button type="submit" disabled={pending}>
        {pending && <Spinner className="size-4" />}
        {pending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
