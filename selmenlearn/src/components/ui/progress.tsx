"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: "brand" | "success" | "warning";
  showLabel?: boolean;
  animated?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  color = "brand",
  showLabel,
  animated = true,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    brand:   "bg-brand-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
  };

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        {animated ? (
          <motion.div
            className={cn("h-full rounded-full", colors[color])}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        ) : (
          <div className={cn("h-full rounded-full", colors[color])} style={{ width: `${pct}%` }} />
        )}
      </div>
    </div>
  );
}
