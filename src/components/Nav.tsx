import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import NavLinks from "@/components/NavLinks";
import NavShell from "@/components/NavShell";

export default async function Nav() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const isAuthed = !!session?.user;

  const links = [
    { href: "/jobs", label: "Browse jobs" },
    ...(isAdmin ? [{ href: "/admin/jobs", label: "Admin" }] : []),
    ...(isAuthed && !isAdmin ? [{ href: "/pricing", label: "Pricing" }] : []),
    ...(isAuthed ? [{ href: "/dashboard", label: "My applications" }] : [{ href: "/login", label: "Log in" }]),
  ];

  async function signOutAction() {
    "use server";
    await signOut();
    redirect("/");
  }

  return (
    <NavShell>
      <div className="relative flex items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center">
          <span className="flex size-9 items-center justify-center rounded-full bg-zinc-900 text-paper">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="7" width="18" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 12h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="sr-only">365DaysJobsTeam</span>
        </Link>
        <NavLinks links={links} isAuthed={isAuthed} signOutAction={signOutAction} />
      </div>
    </NavShell>
  );
}
