"use client";

import { useTransition } from "react";
import { updateApplicationStatus } from "@/lib/actions/jobs";

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
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateApplicationStatus(applicationId, e.target.value))}
      className="field-input mt-0 w-auto px-2 py-1 text-xs"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
