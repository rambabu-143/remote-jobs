"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LinkItem = { href: string; label: string; match?: string; icon?: React.ReactNode };

export default function NavLinks({
  links,
  isAuthed,
  signOutAction,
  sidebar,
  children,
}: {
  links: LinkItem[];
  isAuthed: boolean;
  signOutAction?: () => Promise<void>;
  sidebar?: boolean; // logged-in desktop layout: vertical links in a left sidebar (children = logo)
  children?: React.ReactNode;
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
  const signOutClass = "cursor-pointer rounded-full bg-[#0050f0] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#0040c0]";

  if (sidebar) {
    // The docs have their own menu. data-sidebar lets globals.css pad the page to make room.
    if (pathname.startsWith("/docs")) return null;
    return (
      <aside data-sidebar className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-zinc-200 bg-white/70 p-4 backdrop-blur-xl lg:flex">
        <div className="px-2 pb-6 pt-1">{children}</div>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(l.href) ? "bg-[#0050f0]/10 text-[#0050f0]" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )}
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
        </nav>
        <form action={signOutAction}>
          <button type="submit" className={cn(signOutClass, "w-full py-2.5")}>
            Sign out
          </button>
        </form>
      </aside>
    );
  }

  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex">
        {links.map((l) => (
          <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? "page" : undefined} className={cn(linkClass(l.href), l.icon && "inline-flex items-center gap-1.5")}>
            {l.icon}{l.label}
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
              className={cn(linkClass(l.href), "px-4 py-2.5", l.icon && "flex items-center gap-2")}
            >
              {l.icon}
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
