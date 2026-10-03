import Image from "next/image";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Image src="/logo.png" alt="365daysjobs Docs" width={700} height={156} className="h-7 w-auto dark:bg-white dark:rounded" />,
    },
    links: [
      { text: "Back to admin", url: "/admin/jobs" },
      { text: "Browse jobs", url: "/jobs" },
    ],
  };
}
