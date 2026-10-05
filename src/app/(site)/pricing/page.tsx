import Script from "next/script";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PricingCard from "@/components/PricingCard";

// Only ever send people back to a job page on this site (never an arbitrary address).
const safeNext = (v?: string) => (v && /^\/jobs\/[A-Za-z0-9]+$/.test(v) ? v : undefined);

export const metadata = {
  title: "Pricing",
  description: "Apply access plans for job seekers: 1 month ₹49, 6 months ₹249, 1 year ₹399. Browsing remote jobs is always free.",
};

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const returnTo = safeNext((await searchParams).next);
  const session = await auth();
  if (session?.user?.role === "EMPLOYER") redirect("/dashboard/jobs");

  // Visitors can read the plans; only logged-in seekers can buy one.
  const user = session?.user ? await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }) : null;
  const loggedIn = Boolean(user);
  const isActive = Boolean(user?.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date());

  return (
    <div>
      {loggedIn && <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />}
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Unlock apply access</h1>
      <p className="mt-2 max-w-xl text-sm text-zinc-600">
        Browsing jobs is always free. Subscribe to unlock the apply form and contact details on
        every listing. Payments are processed securely by Razorpay in Indian rupees (INR). See our{" "}
        <Link href="/refund" className="underline hover:text-zinc-900">
          Refund &amp; Cancellation Policy
        </Link>
        .
      </p>

      {isActive && (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-600">
          Your access is active until {user!.subscriptionExpiresAt!.toLocaleDateString()}.
          {returnTo && (
            <>
              {" "}
              <Link href={returnTo} className="font-medium underline">
                Back to the job →
              </Link>
            </>
          )}
        </p>
      )}
      {returnTo && !isActive && (
        <p className="mt-4 text-sm text-zinc-600">
          Pick a plan to apply to the job you were looking at. After you pay, you will go straight back to it.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <PricingCard
          plan="MONTH_1"
          label="1 Month"
          normalPrice={49}
          offerPrice={49}
          perMonth="49"
          userName={user?.name}
          userEmail={user?.email}
          returnTo={returnTo}
          loggedIn={loggedIn}
        />
        <PricingCard
          plan="MONTH_6"
          label="6 Months"
          normalPrice={294}
          offerPrice={249}
          perMonth="41.50"
          saving="15%"
          highlight="Most popular"
          userName={user?.name}
          userEmail={user?.email}
          returnTo={returnTo}
          loggedIn={loggedIn}
        />
        <PricingCard
          plan="YEAR_1"
          label="1 Year"
          normalPrice={588}
          offerPrice={399}
          perMonth="33.25"
          saving="32%"
          highlight="Best value"
          userName={user?.name}
          userEmail={user?.email}
          returnTo={returnTo}
          loggedIn={loggedIn}
        />
      </div>
    </div>
  );
}
