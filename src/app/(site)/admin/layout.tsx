import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  return (
    <div>
      <nav className="mb-6 flex gap-5 border-b border-zinc-800 pb-3 text-sm">
        <Link href="/admin/jobs" className="font-medium text-white">
          Jobs
        </Link>
        <Link href="/admin/jobs/new" className="text-zinc-400 transition-colors hover:text-white">
          Post a new job
        </Link>
      </nav>
      {children}
    </div>
  );
}
