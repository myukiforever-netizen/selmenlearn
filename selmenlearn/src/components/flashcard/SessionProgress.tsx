"use client";

import { motion } from "framer-motion";

interface SessionProgressProps {
  current:  number;
  total:    number;
  xpGained: number;
}

export function SessionProgress({ current, total, xpGained }: SessionProgressProps) {
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="flex-1 space-y-1.5 px-3">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          {current} <span className="text-slate-300 dark:text-slate-600">/</span> {total} cartes
        </span>
        {xpGained > 0 && (
          <motion.span
            key={xpGained}
            initial={{ scale: 1.3, color: "#f59e0b" }}
            animate={{ scale: 1 }}
            className="font-semibold text-amber-500"
          >
            +{xpGained} XP
          </motion.span>
        )}
      </div>

      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand-500 rounded-full origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: percent / 100 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
        />
      </div>
    </div>
  );
}
