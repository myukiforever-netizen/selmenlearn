"use client";

import { motion } from "framer-motion";

interface QuizProgressProps {
  current: number; // 1-based
  total:   number;
  score:   number;
}

export function QuizProgress({ current, total, score }: QuizProgressProps) {
  const pct = total > 0 ? ((current - 1) / total) * 100 : 0;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Question {current} / {total}</span>
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          {score} correcte{score > 1 ? "s" : ""}
        </span>
      </div>

      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
