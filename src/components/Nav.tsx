import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import NavLinks from "@/components/NavLinks";
import NavShell from "@/components/NavShell";
import { BadgeIndianRupee, BookOpen, Briefcase, FileText, Heart, Mail, PlusCircle, Search, Settings, ListChecks } from "lucide-react";

const ic = "size-4 shrink-0";

export default async function Nav() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const isEmployer = session?.user?.role === "EMPLOYER";
  const isAuthed = !!session?.user;

  // `match` lets one link stay highlighted across a whole section (e.g. every /admin page).
  const links = [
    { href: "/jobs", label: "Browse jobs", icon: <Search className={ic} /> },
    ...(isAdmin
      ? [
          { href: "/admin/jobs", label: "Manage jobs", icon: <ListChecks className={ic} /> },
          { href: "/admin/jobs/new", label: "Post a job", icon: <PlusCircle className={ic} /> },
          { href: "/admin/settings", label: "Settings", icon: <Settings className={ic} /> },
          { href: "/docs", label: "Docs", icon: <BookOpen className={ic} /> },
        ]
      : []),
    ...(isEmployer
      ? [
          { href: "/dashboard/jobs/new", label: "Post a job", icon: <PlusCircle className={ic} /> },
          { href: "/dashboard/jobs", label: "My jobs", icon: <Briefcase className={ic} /> },
        ]
      : []),
    // Visitors who want to hire are sent to sign up as an employer.
    ...(!isAuthed ? [{ href: "/register?type=employer", label: "Post a job", icon: <PlusCircle className={ic} /> }] : []),
    ...(isAuthed && !isAdmin && !isEmployer
      ? [
          { href: "/pricing", label: "Pricing", icon: <BadgeIndianRupee className={ic} /> },
          { href: "/dashboard", label: "My applications", icon: <FileText className={ic} /> },
          { href: "/saved", label: "Saved", icon: <Heart className={ic} /> },
        ]
      : []),
    { href: "/contact", label: "Contact", icon: <Mail className={ic} /> },
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
