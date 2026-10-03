"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { usePathname } from "next/navigation";

// Scroll up -> nav width shrinks slightly (stays visible). Scroll down -> back to full width.
export default function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const diff = y - lastY;
    if (Math.abs(diff) > 4) {
      setVisible(diff > 0);
      setLastY(y);
    }
  });

  // The docs have their own logo and menu, and this floating bar would sit on top of them.
  if (pathname.startsWith("/docs")) return null;

  return (
    <header className="fixed top-4 left-1/2 z-20 -translate-x-1/2">
      <motion.div
        animate={{ scaleX: visible ? 1 : 0.88 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        style={{ transformOrigin: "center" }}
        className="w-[min(94vw,50rem)] rounded-full border border-white/70 bg-white/55 shadow-[0_8px_32px_rgba(0,0,0,0.08)] ring-1 ring-black/5 backdrop-blur-xl"
      >
        {children}
      </motion.div>
    </header>
  );
}
