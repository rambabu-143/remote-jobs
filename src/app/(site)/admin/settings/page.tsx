import { setEmployerPlanRequired } from "@/lib/actions/jobs";
import { readEmployerPlanRequired } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { EMPLOYER_PLAN_PRICE_PAISE } from "@/lib/razorpay";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const required = await readEmployerPlanRequired();
  const price = EMPLOYER_PLAN_PRICE_PAISE / 100;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Settings</h1>

      <div className="card mt-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-zinc-900">Require the employer plan (₹{price}/month)</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Choose whether employers must pay to submit jobs. Every job is reviewed and approved by you either way.
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              required ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {required ? "Plan required" : "Free posting"}
          </span>
        </div>

        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600">
          {required ? (
            <>
              <li>Employers see the ₹{price} plan and must subscribe before their jobs reach you for approval.</li>
              <li>Jobs saved without a plan stay as drafts until the employer subscribes.</li>
              <li>An employer&apos;s live jobs are hidden from the public while their plan has expired.</li>
            </>
          ) : (
            <>
              <li>The ₹{price} plan is hidden from employers, and they can post for free.</li>
              <li>Every job still waits for your approval before it goes live.</li>
              <li>Live jobs stay visible; nothing expires.</li>
            </>
          )}
        </ul>

        <form
          action={async () => {
            "use server";
            await setEmployerPlanRequired(!required);
          }}
          className="border-t border-zinc-200 pt-4"
        >
          <Button type="submit" variant={required ? "outline" : "default"}>
            {required ? "Switch to free posting" : "Require the employer plan"}
          </Button>
          <p className="mt-2 text-xs text-zinc-500">
            {required
              ? "Switching to free posting also sends employers' saved drafts to you for review."
              : "Employers who already have a plan keep it; their dates are not changed."}
          </p>
        </form>
      </div>
    </div>
  );
}
