import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const KEY = "employerPlanRequired";

// Uncached read: use inside code that is already cached, and on the admin settings page.
export async function readEmployerPlanRequired() {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  return row?.value === "true"; // no row (or anything else) = free posting
}

// Cached read for everything else. The admin toggle expires the "jobs" tag, so a change shows up at once.
export const isEmployerPlanRequired = unstable_cache(readEmployerPlanRequired, ["employer-plan-required"], {
  tags: ["jobs"],
  revalidate: 60,
});

export async function writeEmployerPlanRequired(required: boolean) {
  await prisma.setting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: String(required) },
    update: { value: String(required) },
  });
}
