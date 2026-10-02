export const JOB_CATEGORIES = [
  "Software Development",
  "Customer Support",
  "Sales",
  "Marketing",
  "Design",
  "Front End",
  "Back End",
  "Fullstack",
  "Non-Tech",
  "Other",
];

export const LOCATIONS = [
  "Worldwide",
  "India",
  "USA",
  "Canada",
  "England",
  "Africa",
  "Asia",
  "Europe",
  "Latin America",
  "Middle East",
  "Oceania",
];

export const remoteLabel: Record<string, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

export const employmentLabel: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export const statusLabel: Record<string, { text: string; className: string }> = {
  PENDING: { text: "Pending", className: "bg-zinc-200 text-zinc-700" },
  REVIEWED: { text: "Reviewed", className: "bg-sky-50 text-sky-600" },
  ACCEPTED: { text: "Accepted", className: "bg-emerald-50 text-emerald-600" },
  REJECTED: { text: "Rejected", className: "bg-red-50 text-red-600" },
};

export function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  return fmt((min ?? max) as number);
}

export function initials(company: string) {
  return company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// Accepts a string too: unstable_cache round-trips Prisma results through
// JSON, so a cached job's createdAt arrives as a string, not a Date.
export function formatRelativeTime(date: Date | string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
