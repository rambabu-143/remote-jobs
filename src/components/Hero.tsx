"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LandingBackground from "./LandingBackground";

// postJobHref is null for job seekers (they can't post), so the button is simply left out.
export default function Hero({ postJobHref }: { postJobHref: string | null }) {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <LandingBackground />
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl"
      >
        Remote jobs from
        <br />
        <span className="text-ink-600">verified companies.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="mx-auto mt-5 max-w-xl text-lg text-zinc-600"
      >
        Every company here lists a real address, phone, and email before a role goes live. Apply
        straight to the company, no recruiters, no spam, no middlemen.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <Link href="/jobs" className={cn(buttonVariants({ variant: "default" }), "px-6 py-3 text-base")}>
          Browse open roles
        </Link>
        {postJobHref && (
          <Link href={postJobHref} className={cn(buttonVariants({ variant: "outline" }), "px-6 py-3 text-base")}>
            Post a job
          </Link>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500"
      >
        <span>✓ Verified companies</span>
        <span>✓ Apply directly</span>
        <span>✓ No recruiter spam</span>
      </motion.div>
    </section>
  );
}
