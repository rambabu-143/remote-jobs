"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

// Scroll up -> nav width shrinks slightly (stays visible). Scroll down -> back to full width.
export default function NavShell({ children }: { children: React.ReactNode }) {
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

  return (
    <header className="fixed top-4 left-1/2 z-20 -translate-x-1/2">
      <motion.div
        animate={{ scaleX: visible ? 1 : 0.88 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        style={{ transformOrigin: "center" }}
        className="w-[min(92vw,42rem)] rounded-full bg-paper shadow-xl shadow-zinc-900/10"
      >
        {children}
      </motion.div>
    </header>
  );
}
