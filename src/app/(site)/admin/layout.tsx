import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex flex-col gap-8 sm:flex-row">
      <aside className="flex shrink-0 gap-4 sm:w-40 sm:flex-col sm:gap-2">
        <Link href="/admin/jobs" className="text-sm text-zinc-700 hover:text-zinc-900">
          Jobs
        </Link>
        <Link href="/docs" className="text-sm text-zinc-700 hover:text-zinc-900">
          Docs
        </Link>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
