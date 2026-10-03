import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 pt-28 pb-16 text-center">
        <p className="text-sm font-medium text-zinc-500">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Page not found</h1>
        <p className="mt-2 max-w-md text-sm text-zinc-600">
          This page could not be found. The link may be wrong, or the job may have been closed.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/jobs" className={buttonVariants({ variant: "default" })}>
            Browse jobs
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Go home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
