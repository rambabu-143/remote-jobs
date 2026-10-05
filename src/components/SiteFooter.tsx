import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-zinc-200 px-4 py-6 text-xs text-zinc-500">
      <span>&copy; {new Date().getFullYear()} 365DaysJobsTeam</span>
      <span className="flex w-full flex-wrap gap-x-4 gap-y-1">
        <Link href="/remote-jobs" className="hover:text-zinc-900">Remote jobs</Link>
        <Link href="/work-from-home-jobs" className="hover:text-zinc-900">Work from home jobs</Link>
        <Link href="/jobs/freshers" className="hover:text-zinc-900">Jobs for freshers</Link>
        <Link href="/jobs/software-development" className="hover:text-zinc-900">Software jobs</Link>
        <Link href="/jobs/customer-support" className="hover:text-zinc-900">Customer support jobs</Link>
        <Link href="/jobs/sales" className="hover:text-zinc-900">Sales jobs</Link>
      </span>
      <span className="flex flex-wrap gap-x-4 gap-y-1">
        <Link href="/terms" className="hover:text-zinc-900">
          Terms &amp; Conditions
        </Link>
        <Link href="/privacy" className="hover:text-zinc-900">
          Privacy Policy
        </Link>
        <Link href="/pricing" className="hover:text-zinc-900">
          Pricing
        </Link>
        <Link href="/refund" className="hover:text-zinc-900">
          Refund Policy
        </Link>
        <Link href="/contact" className="hover:text-zinc-900">
          Contact
        </Link>
      </span>
    </footer>
  );
}
