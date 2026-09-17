"use client";

import Link from "next/link";
import { useRef } from "react";

export default function FilterBar({
  q,
  remote,
  type,
}: {
  q?: string;
  remote?: string;
  type?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} className="card mt-6 flex flex-wrap gap-3 !p-4" method="get">
      <div className="relative min-w-[220px] flex-1">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search title, company, or tag"
          className="field-input mt-0 pl-9"
        />
      </div>
      <select
        name="remote"
        defaultValue={remote ?? ""}
        onChange={() => formRef.current?.requestSubmit()}
        className="field-input mt-0 w-auto"
      >
        <option value="">Any location type</option>
        <option value="REMOTE">Remote</option>
        <option value="HYBRID">Hybrid</option>
        <option value="ONSITE">On-site</option>
      </select>
      <select
        name="type"
        defaultValue={type ?? ""}
        onChange={() => formRef.current?.requestSubmit()}
        className="field-input mt-0 w-auto"
      >
        <option value="">Any employment type</option>
        <option value="FULL_TIME">Full-time</option>
        <option value="PART_TIME">Part-time</option>
        <option value="CONTRACT">Contract</option>
        <option value="INTERNSHIP">Internship</option>
      </select>
      <button className="btn-primary">Search</button>
      {(q || remote || type) && (
        <Link href="/jobs" className="btn-secondary flex items-center">
          Clear
        </Link>
      )}
    </form>
  );
}
