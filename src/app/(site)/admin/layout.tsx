import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
