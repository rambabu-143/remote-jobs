import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import NavLinks from "@/components/NavLinks";
import NavShell from "@/components/NavShell";

export default async function Nav() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const isEmployer = session?.user?.role === "EMPLOYER";
  const isAuthed = !!session?.user;

  const links = [
    { href: "/jobs", label: "Browse jobs" },
    ...(isAdmin ? [{ href: "/admin/jobs", label: "Admin" }] : []),
    ...(isEmployer ? [{ href: "/dashboard/jobs", label: "My jobs" }] : []),
    ...(isAuthed && !isAdmin && !isEmployer
      ? [{ href: "/pricing", label: "Pricing" }, { href: "/dashboard", label: "My applications" }]
      : []),
    ...(isAuthed && isAdmin ? [{ href: "/dashboard", label: "My applications" }] : []),
    ...(!isAuthed ? [{ href: "/login", label: "Log in" }] : []),
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
          <Image src="/logo.png" alt="" width={700} height={156} priority className="h-9 w-auto" />
          <span className="sr-only">365DaysJobsTeam</span>
        </Link>
        <NavLinks links={links} isAuthed={isAuthed} signOutAction={signOutAction} />
      </div>
    </NavShell>
  );
}
