"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LinkItem = { href: string; label: string; match?: string };

export default function NavLinks({
  links,
  isAuthed,
  signOutAction,
}: {
  links: LinkItem[];
  isAuthed: boolean;
  signOutAction?: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Only the single best-matching link is highlighted, so /dashboard/jobs/new doesn't also light up /dashboard/jobs.
  // Links with a query string (like the visitor "Post a job" -> sign up) are never highlighted.
  const prefixOf = (l: LinkItem) => l.match ?? l.href;
  const best = links
    .filter((l) => !l.href.includes("?") && (pathname === prefixOf(l) || pathname.startsWith(prefixOf(l) + "/")))
    .sort((a, b) => prefixOf(b).length - prefixOf(a).length)[0]?.href;
  const isActive = (href: string) => href === best;
  // Shared pill: active = frosted-glass button, hover = lighter glass.
  const pill = "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all";
  const linkClass = (href: string) =>
    cn(
      pill,
      isActive(href)
        ? "bg-white/80 text-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.12)] ring-1 ring-black/5 backdrop-blur"
        : "text-zinc-600 hover:bg-white/60 hover:text-zinc-900",
    );
  const signOutClass = "cursor-pointer rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-black";

  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex">
        {links.map((l) => (
          <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? "page" : undefined} className={linkClass(l.href)}>
            {l.label}
          </Link>
        ))}
        {isAuthed ? (
          <form action={signOutAction} className="ml-1">
            <button type="submit" className={signOutClass}>
              Sign out
            </button>
          </form>
        ) : (
          <Link href="/register" className={cn(buttonVariants({ variant: "default" }), "ml-1 rounded-full px-4")}>
            Sign up
          </Link>
        )}
      </nav>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/70 text-zinc-900 ring-1 ring-black/10 backdrop-blur transition-colors hover:bg-white lg:hidden"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-full mt-2 flex flex-col gap-1 rounded-3xl border border-white/70 bg-white p-3 text-sm shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/5 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(linkClass(l.href), "px-4 py-2.5")}
            >
              {l.label}
            </Link>
          ))}
          {isAuthed ? (
            <form action={signOutAction} className="mt-1">
              <button type="submit" className={cn(signOutClass, "w-full py-2.5")}>
                Sign out
              </button>
            </form>
          ) : (
            <Link href="/register" onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: "default" }), "mt-1 rounded-full py-2.5 text-center")}>
              Sign up
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
