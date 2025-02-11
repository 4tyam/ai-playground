"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function ScrollText() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.7], [0.8, 1]);

  return (
    <div
      ref={ref}
      className="h-[40vh] flex items-center justify-center relative"
    >
      <motion.h2
        style={{ opacity, scale }}
        className="text-6xl md:text-8xl font-bold text-white tracking-tight"
      >
        Just use one.
      </motion.h2>
    </div>
  );
}
