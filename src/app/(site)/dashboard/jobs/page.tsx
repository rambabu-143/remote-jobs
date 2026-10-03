import Link from "next/link";
import Script from "next/script";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JOB_LISTING_PRICE_PAISE } from "@/lib/razorpay";
import PayForJobButton from "@/components/PayForJobButton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

const STATUS: Record<string, { text: string; className: string }> = {
  DRAFT: { text: "Awaiting payment", className: "bg-zinc-200 text-zinc-700" },
  PENDING: { text: "Pending review", className: "bg-amber-50 text-amber-600" },
  PUBLISHED: { text: "Live", className: "bg-emerald-50 text-emerald-600" },
  REJECTED: { text: "Rejected", className: "bg-red-50 text-red-600" },
  CLOSED: { text: "Closed", className: "bg-zinc-200 text-zinc-600" },
};

export default async function MyJobsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const jobs = await prisma.job.findMany({
    where: { postedById: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">My job listings</h1>
        <Link href="/dashboard/jobs/new" className={buttonVariants({ variant: "default" })}>
          Post a job
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {jobs.map((job) => (
          <div key={job.id} className="card flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-zinc-900">{job.title}</p>
              <p className="text-sm text-zinc-600">{job.company}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className={`${STATUS[job.status].className}`}>{STATUS[job.status].text}</Badge>
              {(job.status === "PUBLISHED" || job.status === "CLOSED") && (
                <Link href={`/dashboard/jobs/${job.id}/applications`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Applicants
                </Link>
              )}
              {job.status === "DRAFT" && (
                <PayForJobButton
                  jobId={job.id}
                  amountInRupees={JOB_LISTING_PRICE_PAISE / 100}
                  userName={session.user.name}
                  userEmail={session.user.email}
                />
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
