import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function Nav() {
  const session = await auth();

  return (
    <header className="border-b border-zinc-800 bg-black">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-white">
          RemoteJobs
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-zinc-400 hover:text-white">
            Browse jobs
          </Link>
          {session?.user?.role === "ADMIN" && (
            <>
              <Link href="/admin/jobs" className="text-zinc-400 hover:text-white">
                Admin
              </Link>
              <Link href="/docs" className="text-zinc-400 hover:text-white">
                Docs
              </Link>
            </>
          )}
          {session?.user && (
            <Link href="/dashboard" className="text-zinc-400 hover:text-white">
              My applications
            </Link>
          )}
          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button className="text-zinc-400 hover:text-white">Sign out</button>
            </form>
          ) : (
            <>
              <Link href="/login" className="text-zinc-400 hover:text-white">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-white px-3 py-1.5 font-medium text-black hover:bg-zinc-200"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
