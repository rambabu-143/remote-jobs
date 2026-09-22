import Script from "next/script";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PricingCard from "@/components/PricingCard";

export default async function PricingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const isActive = Boolean(user.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date());

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <h1 className="text-2xl font-bold tracking-tight text-white">Unlock apply access</h1>
      <p className="mt-2 max-w-xl text-sm text-zinc-400">
        Browsing jobs is always free. Subscribe to unlock the apply form and contact details on
        every listing.
      </p>

      {isActive && (
        <p className="mt-4 rounded-lg border border-emerald-900 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-400">
          Your access is active until {user.subscriptionExpiresAt!.toLocaleDateString()}.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <PricingCard
          plan="MONTH_1"
          label="1 Month"
          normalPrice={49}
          offerPrice={49}
          perMonth="49"
          userName={user.name}
          userEmail={user.email}
        />
        <PricingCard
          plan="MONTH_6"
          label="6 Months"
          normalPrice={294}
          offerPrice={249}
          perMonth="41.50"
          saving="15%"
          highlight="Most popular"
          userName={user.name}
          userEmail={user.email}
        />
        <PricingCard
          plan="YEAR_1"
          label="1 Year"
          normalPrice={588}
          offerPrice={399}
          perMonth="33.25"
          saving="32%"
          highlight="Best value"
          userName={user.name}
          userEmail={user.email}
        />
      </div>
    </div>
  );
}
