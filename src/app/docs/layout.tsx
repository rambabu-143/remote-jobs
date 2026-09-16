import { redirect } from "next/navigation";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { auth } from "@/lib/auth";
import { source } from "@/lib/source";
import { baseOptions } from "@/lib/layout.shared";

export default async function Layout({ children }: LayoutProps<"/docs">) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
