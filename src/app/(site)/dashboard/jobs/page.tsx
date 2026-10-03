import Link from "next/link";
import Script from "next/script";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EMPLOYER_PLAN_PRICE_PAISE } from "@/lib/razorpay";
import PricingCard from "@/components/PricingCard";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { toggleMyJobActive } from "@/lib/actions/jobs";
import { isEmployerPlanRequired } from "@/lib/settings";

const STATUS: Record<string, { text: string; className: string }> = {
  DRAFT: { text: "Draft, subscribe to submit", className: "bg-zinc-200 text-zinc-700" },
  PENDING: { text: "Pending review", className: "bg-amber-50 text-amber-600" },
  PUBLISHED: { text: "Live", className: "bg-emerald-50 text-emerald-600" },
  REJECTED: { text: "Rejected", className: "bg-red-50 text-red-600" },
  CLOSED: { text: "Closed", className: "bg-zinc-200 text-zinc-600" },
};

export default async function MyJobsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "EMPLOYER") redirect(session.user.role === "ADMIN" ? "/admin/jobs" : "/dashboard");

  const [jobs, user, planRequired] = await Promise.all([
    prisma.job.findMany({ where: { postedById: session.user.id }, orderBy: { createdAt: "desc" } }),
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    isEmployerPlanRequired(),
  ]);
  const planActive = Boolean(user.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date());
  const planPrice = EMPLOYER_PLAN_PRICE_PAISE / 100;

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">My job listings</h1>
        <Link href="/dashboard/jobs/new" className={buttonVariants({ variant: "default" })}>
          Post a job
        </Link>
      </div>

      {!planRequired ? (
        <p className="mt-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
          Posting is free right now. Every job is reviewed by our team before it goes live.
        </p>
      ) : planActive ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-600">
          Your employer plan is active until {user.subscriptionExpiresAt!.toLocaleDateString()}. Post as many jobs as you like.
        </p>
      ) : (
        <div className="mt-6 grid items-center gap-4 sm:grid-cols-2">
          <p className="text-sm text-zinc-600">
            Subscribe to post unlimited jobs for 30 days. Jobs you have saved as drafts are sent for review as soon as you
            subscribe. Live jobs are hidden when your plan ends and come back when you renew.
          </p>
          <PricingCard
            plan="MONTH_1"
            label="Employer plan"
            normalPrice={planPrice}
            offerPrice={planPrice}
            perMonth={String(planPrice)}
            userName={session.user.name}
            userEmail={session.user.email}
          />
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {jobs.map((job) => (
          <div key={job.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="break-words font-medium text-zinc-900">{job.title}</p>
              <p className="break-words text-sm text-zinc-600">{job.company}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
              {planRequired && job.status === "PUBLISHED" && !planActive ? (
                <Badge variant="secondary" className="bg-zinc-200 text-zinc-600">Hidden, plan expired</Badge>
              ) : (
                <Badge variant="secondary" className={`${STATUS[job.status].className}`}>{STATUS[job.status].text}</Badge>
              )}
              <Link href={`/dashboard/jobs/${job.id}/edit`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Edit
              </Link>
              {(job.status === "PUBLISHED" || job.status === "CLOSED") && (
                <form
                  action={async () => {
                    "use server";
                    await toggleMyJobActive(job.id);
                  }}
                >
                  <Button type="submit" variant="ghost" size="sm">
                    {job.status === "PUBLISHED" ? "Close" : "Reopen"}
                  </Button>
                </form>
              )}
              {(job.status === "PUBLISHED" || job.status === "CLOSED") && (
                <Link href={`/dashboard/jobs/${job.id}/applications`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Applicants
                </Link>
              )}
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-zinc-500">
            You haven&apos;t posted any jobs yet.
          </p>
        )}
      </div>
    </div>
  );
}
