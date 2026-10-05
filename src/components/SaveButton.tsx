"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleSavedJob } from "@/lib/actions/saved";
import { cn } from "@/lib/utils";

const base =
  "relative z-10 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900";

// Heart toggle. Visitors get a heart that leads to the login page; saved state is shown optimistically.
export default function SaveButton({
  jobId,
  initialSaved,
  loggedIn,
  className,
}: {
  jobId: string;
  initialSaved: boolean;
  loggedIn: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [, startTransition] = useTransition();

  if (!loggedIn) {
    return (
      <Link href="/login" aria-label="Log in to save this job" title="Log in to save this job" className={cn(base, className)}>
        <Heart className="size-[18px]" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved jobs" : "Save this job"}
      title={saved ? "Remove from saved jobs" : "Save this job"}
      className={cn(base, saved && "text-zinc-900", className)}
      onClick={() => {
        const next = !saved;
        setSaved(next); // instant feedback; corrected below if the server disagrees
        startTransition(async () => {
          const r = await toggleSavedJob(jobId);
          setSaved(r.ok ? r.saved : !next);
        });
      }}
    >
      <Heart className={cn("size-[18px]", saved && "fill-[#0050f0] text-[#0050f0]")} />
    </button>
  );
}
