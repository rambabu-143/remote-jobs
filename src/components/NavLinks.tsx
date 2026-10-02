"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LinkItem = { href: string; label: string };

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

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const linkClass = (href: string) =>
    isActive(href)
      ? "border-b border-ink-400 text-zinc-900"
      : "border-b border-transparent text-zinc-600 transition-colors hover:text-zinc-900";
  const mobileLinkClass = (href: string) =>
    isActive(href)
      ? "border-l-2 border-ink-400 text-zinc-900"
      : "border-l-2 border-transparent text-zinc-600 hover:text-zinc-900";

  return (
    <>
      <nav className="hidden items-center gap-6 text-sm sm:flex">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`pb-0.5 ${linkClass(l.href)}`}>
            {l.label}
          </Link>
        ))}
        {isAuthed ? (
          <form action={signOutAction}>
            <button className="text-zinc-600 transition-colors hover:text-zinc-900">Sign out</button>
          </form>
        ) : (
          <Link href="/register" className={buttonVariants({ variant: "default" })}>
            Sign up
          </Link>
        )}
      </nav>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="flex size-9 items-center justify-center rounded-lg border border-zinc-900 text-zinc-900 sm:hidden"
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
        <nav className="absolute top-full inset-x-0 mt-2 flex flex-col gap-1 rounded-2xl bg-paper/70 p-4 text-sm backdrop-blur-xl sm:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`px-3 py-2 ${mobileLinkClass(l.href)}`}
            >
              {l.label}
            </Link>
          ))}
          {isAuthed ? (
            <form action={signOutAction}>
              <button className="w-full rounded-md px-3 py-2 text-left text-zinc-600 hover:text-zinc-900">
                Sign out
              </button>
            </form>
          ) : (
            <Link href="/register" onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: "default" }), "mt-1 text-center")}>
              Sign up
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
