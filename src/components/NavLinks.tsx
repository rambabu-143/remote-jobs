"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

  const linkClass = (href: string) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return active ? "text-white" : "text-zinc-400 transition-colors hover:text-white";
  };

  return (
    <>
      <nav className="hidden items-center gap-5 text-sm sm:flex">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={linkClass(l.href)}>
            {l.label}
          </Link>
        ))}
        {isAuthed ? (
          <form action={signOutAction}>
            <button className="text-zinc-400 transition-colors hover:text-white">Sign out</button>
          </form>
        ) : (
          <Link href="/register" className="btn-primary">
            Sign up
          </Link>
        )}
      </nav>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="flex size-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 sm:hidden"
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
        <nav className="absolute top-full right-0 left-0 flex flex-col gap-1 border-b border-zinc-800 bg-black p-4 text-sm sm:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`rounded-md px-3 py-2 ${linkClass(l.href)}`}
            >
              {l.label}
            </Link>
          ))}
          {isAuthed ? (
            <form action={signOutAction}>
              <button className="w-full rounded-md px-3 py-2 text-left text-zinc-400 hover:text-white">
                Sign out
              </button>
            </form>
          ) : (
            <Link href="/register" onClick={() => setOpen(false)} className="btn-primary mt-1 text-center">
              Sign up
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
