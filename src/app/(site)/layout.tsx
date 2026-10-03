import Link from "next/link";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-28 pb-8">{children}</main>
      <footer className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 border-t border-zinc-200 px-4 py-6 text-xs text-zinc-500">
        <span>&copy; {new Date().getFullYear()} 365DaysJobsTeam</span>
        <span className="flex gap-4">
          <Link href="/terms" className="hover:text-zinc-900">
            Terms &amp; Conditions
          </Link>
          <Link href="/privacy" className="hover:text-zinc-900">
            Privacy Policy
          </Link>
        </span>
      </footer>
    </>
  );
}
