import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import NavLinks from "@/components/NavLinks";
import NavShell from "@/components/NavShell";
import { Heart } from "lucide-react";

export default async function Nav() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const isEmployer = session?.user?.role === "EMPLOYER";
  const isAuthed = !!session?.user;

  // `match` lets one link stay highlighted across a whole section (e.g. every /admin page).
  const links = [
    { href: "/jobs", label: "Browse jobs" },
    ...(isAdmin
      ? [
          { href: "/admin/jobs", label: "Manage jobs" },
          { href: "/admin/jobs/new", label: "Post a job" },
          { href: "/admin/settings", label: "Settings" },
          { href: "/docs", label: "Docs" },
        ]
      : []),
    ...(isEmployer
      ? [
          { href: "/dashboard/jobs/new", label: "Post a job" },
          { href: "/dashboard/jobs", label: "My jobs" },
        ]
      : []),
    // Visitors who want to hire are sent to sign up as an employer.
    ...(!isAuthed ? [{ href: "/register?type=employer", label: "Post a job" }] : []),
    ...(isAuthed && !isAdmin && !isEmployer
      ? [
          { href: "/pricing", label: "Pricing" },
          { href: "/dashboard", label: "My applications" },
          { href: "/saved", label: "Saved", icon: <Heart className="size-4" /> },
        ]
      : []),
    ...(isAuthed && isAdmin ? [{ href: "/dashboard", label: "My applications" }] : []),
    { href: "/contact", label: "Contact" },
  ];

  async function signOutAction() {
    "use server";
    await signOut();
    redirect("/");
  }

  const logo = (
    <Link href="/" className="flex items-center">
      <Image src="/logo.png" alt="" width={700} height={156} priority className="h-9 w-auto" />
      <span className="sr-only">365DaysJobsTeam</span>
    </Link>
  );

  return (
    <>
      {/* Logged-in users get a left sidebar on desktop; the floating bar is for visitors and phones. */}
      {isAuthed && (
        <NavLinks sidebar links={links} isAuthed signOutAction={signOutAction}>
          {logo}
        </NavLinks>
      )}
      <NavShell className={isAuthed ? "lg:hidden" : undefined}>
        <div className="relative flex items-center justify-between px-5 py-3">
          <span className="mr-6">{logo}</span>
          <NavLinks links={links} isAuthed={isAuthed} signOutAction={signOutAction} />
        </div>
      </NavShell>
    </>
  );
}
