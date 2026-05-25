"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { LevelProgress } from "@/types";

interface LevelCardProps {
  level:         number;
  xp:            number;
  levelProgress: LevelProgress;
}

const LEVEL_TITLES: Record<number, string> = {
  1: "Explorateur", 2: "Explorateur", 3: "Explorateur", 4: "Explorateur", 5: "Explorateur",
  6: "Apprenti",    7: "Apprenti",    8: "Apprenti",    9: "Apprenti",    10: "Apprenti",
  11: "Érudit",     12: "Érudit",     13: "Érudit",     14: "Érudit",     15: "Érudit",
  16: "Expert",     17: "Expert",     18: "Expert",     19: "Expert",     20: "Maître",
};

// Static Tailwind classes per tier (no dynamic string interpolation)
const TIER_STYLES: Record<string, { badge: string; bar: string }> = {
  Explorateur: {
    badge: "bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400",
    bar:   "bg-brand-500",
  },
  Apprenti: {
    badge: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    bar:   "bg-emerald-500",
  },
  Érudit: {
    badge: "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
    bar:   "bg-violet-500",
  },
  Expert: {
    badge: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    bar:   "bg-amber-500",
  },
  Maître: {
    badge: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
    bar:   "bg-rose-500",
  },
};

const DEFAULT_STYLE = TIER_STYLES["Maître"];

export function LevelCard({ level, xp, levelProgress }: LevelCardProps) {
  const title  = LEVEL_TITLES[level] ?? "Maître";
  const styles = TIER_STYLES[title] ?? DEFAULT_STYLE;

  const { progressPct, nextLevelXp, currentLevelXp } = levelProgress;
  const remaining = nextLevelXp !== null ? nextLevelXp - xp : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center">
          <Star className="w-4 h-4 text-brand-500" />
        </div>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Niveau & XP</h2>
      </div>

      {/* Level + title */}
      <div className="flex items-baseline gap-3 mb-1">
        <motion.p
          key={level}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-5xl font-bold text-slate-900 dark:text-slate-50"
        >
          {level}
        </motion.p>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles.badge}`}>
          {title}
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-4">{xp.toLocaleString()} XP total</p>

      {/* XP progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Niv. {level}</span>
          {nextLevelXp !== null && <span>Niv. {level + 1}</span>}
        </div>

        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${styles.bar}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progressPct / 100 }}
            style={{ transformOrigin: "left" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-slate-400">
          <span>{currentLevelXp.toLocaleString()} XP</span>
          {nextLevelXp !== null && <span>{nextLevelXp.toLocaleString()} XP</span>}
        </div>

        {remaining !== null ? (
          <p className="text-xs text-slate-500 pt-0.5">
            Encore{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {remaining.toLocaleString()} XP
            </span>{" "}
            pour atteindre le niveau {level + 1}
          </p>
        ) : (
          <p className="text-xs font-semibold text-rose-500 pt-0.5">Niveau maximum atteint !</p>
        )}
      </div>
    </div>
  );
}
