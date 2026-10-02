"use client";

import { useTransition } from "react";
import { updateApplicationStatus } from "@/lib/actions/jobs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statuses = ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"] as const;

export default function StatusSelect({
  applicationId,
  status,
}: {
  applicationId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={status}
      disabled={pending}
      onValueChange={(v) => startTransition(() => updateApplicationStatus(applicationId, v as string))}
    >
      <SelectTrigger size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
