import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import NavLinks from "@/components/NavLinks";

export default async function Nav() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const isAuthed = !!session?.user;

  const links = [
    { href: "/jobs", label: "Browse jobs" },
    ...(isAdmin ? [{ href: "/admin/jobs", label: "Admin" }, { href: "/docs", label: "Docs" }] : []),
    ...(isAuthed ? [{ href: "/dashboard", label: "My applications" }] : [{ href: "/login", label: "Log in" }]),
  ];

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-white">
          <span className="size-2 rounded-full bg-copper-500" />
          RemoteJobs
        </Link>
        <NavLinks links={links} isAuthed={isAuthed} signOutAction={signOutAction} />
      </div>
    </header>
  );
}
