"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { SearchIcon } from "lucide-react";
import { JOB_CATEGORIES, LOCATIONS, POSTED_OPTIONS } from "@/lib/job-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ANY = "ANY";
type Option = { value: string; label: string };
const plain = (xs: readonly string[]): Option[] => xs.map((x) => ({ value: x, label: x }));

// Base UI selects can't hold an empty value, so "Any" is a sentinel that
// submits as an empty string (param dropped) through a hidden input.
function FilterSelect({
  name,
  any,
  options,
  defaultValue,
  onChange,
}: {
  name: string;
  any: string;
  options: Option[];
  defaultValue?: string;
  onChange: () => void;
}) {
  const [value, setValue] = useState(defaultValue || ANY);
  const items = [{ value: ANY, label: any }, ...options];

  return (
    <>
      <input type="hidden" name={name} value={value === ANY ? "" : value} />
      <Select
        items={items}
        value={value}
        onValueChange={(v) => {
          flushSync(() => setValue(v as string));
          onChange();
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

export default function FilterBar({
  q,
  type,
  category,
  location,
  posted,
}: {
  q?: string;
  type?: string;
  category?: string;
  location?: string;
  posted?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const submit = () => formRef.current?.requestSubmit();

  return (
    <form ref={formRef} className="card mt-6 flex flex-wrap items-center gap-3 !p-4" method="get">
      {/* Search gets its own full-width row (with the buttons) so the box is never cut off. */}
      <div className="flex w-full items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
          <Input name="q" defaultValue={q} placeholder="Search title, company, or tag" className="pl-9" />
        </div>
        <Button type="submit">Search</Button>
        {(q || type || category || location || posted) && (
          <Button variant="outline" nativeButton={false} render={<Link href="/jobs" />}>
            Clear
          </Button>
        )}
      </div>
      <FilterSelect
        name="type"
        any="Any employment type"
        defaultValue={type}
        onChange={submit}
        options={[
          { value: "FULL_TIME", label: "Full-time" },
          { value: "PART_TIME", label: "Part-time" },
          { value: "CONTRACT", label: "Contract" },
          { value: "INTERNSHIP", label: "Internship" },
        ]}
      />
      <FilterSelect name="category" any="Any category" defaultValue={category} onChange={submit} options={plain(JOB_CATEGORIES)} />
      <FilterSelect name="location" any="Any location" defaultValue={location} onChange={submit} options={plain(LOCATIONS)} />
      <FilterSelect name="posted" any="Any time" defaultValue={posted} onChange={submit} options={POSTED_OPTIONS} />
    </form>
  );
}
