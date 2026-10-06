"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonVariants, Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { markAppliedExternally } from "@/lib/actions/applications";

// Apply opens the company's own page. Seekers who are logged in get asked "Did you apply?" when they
// come back, like LinkedIn. The pending flag lives in localStorage so it survives the tab switch.
export default function ExternalApplyButton({
  jobId, applyUrl, title, company, canTrack, className,
}: { jobId: string; applyUrl: string; title: string; company: string; canTrack: boolean; className?: string }) {
  const router = useRouter();
  const [ask, setAsk] = useState(false);
  const key = `applyPending:${jobId}`;

  useEffect(() => {
    if (!canTrack) return;
    const check = () => {
      try { if (document.visibilityState === "visible" && localStorage.getItem(key)) setAsk(true); } catch {}
    };
    check();
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => { document.removeEventListener("visibilitychange", check); window.removeEventListener("focus", check); };
  }, [canTrack, key]);

  const clear = () => { try { localStorage.removeItem(key); } catch {} setAsk(false); };

  return (
    <>
      <a
        href={applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => { if (canTrack) try { localStorage.setItem(key, "1"); } catch {} }}
        className={cn(buttonVariants({ variant: "default" }), className)}
      >
        Apply
      </a>
      {ask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="applied-q">
          <div className="card w-full max-w-sm">
            <h2 id="applied-q" className="text-lg font-semibold text-zinc-900">Did you apply?</h2>
            <p className="mt-1 text-sm text-zinc-600">{title} at {company}. Say yes to add it to My applications.</p>
            <div className="mt-5 flex gap-2">
              <Button
                onClick={async () => { clear(); await markAppliedExternally(jobId); router.refresh(); }}
                className="flex-1 rounded-full"
              >
                Yes, I applied
              </Button>
              <Button variant="outline" onClick={clear} className="flex-1 rounded-full">
                No
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
