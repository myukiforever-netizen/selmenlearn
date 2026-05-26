"use client";

import { motion } from "framer-motion";
import type { Badge } from "@/types";

const RARITY_STYLES: Record<Badge["rarity"], { ring: string; bg: string; label: string; labelColor: string }> = {
  common:    { ring: "ring-slate-200 dark:ring-slate-700",   bg: "bg-slate-50 dark:bg-slate-800/50",       label: "Commun",    labelColor: "text-slate-400"           },
  rare:      { ring: "ring-sky-300 dark:ring-sky-700",       bg: "bg-sky-50 dark:bg-sky-950/40",           label: "Rare",      labelColor: "text-sky-500"             },
  epic:      { ring: "ring-violet-400 dark:ring-violet-600", bg: "bg-violet-50 dark:bg-violet-950/40",     label: "Épique",    labelColor: "text-violet-500"          },
  legendary: { ring: "ring-amber-400 dark:ring-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/40",       label: "Légendaire",labelColor: "text-amber-500"           },
};

interface AchievementBadgeProps {
  badge: Badge;
  index: number;
}

export function AchievementBadge({ badge, index }: AchievementBadgeProps) {
  const styles  = RARITY_STYLES[badge.rarity];
  const unlocked = badge.unlocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={`
        relative flex flex-col items-center text-center p-4 rounded-2xl ring-1
        transition-all duration-200
        ${unlocked ? styles.ring : "ring-slate-100 dark:ring-slate-800"}
        ${unlocked ? styles.bg   : "bg-slate-50/50 dark:bg-slate-800/20"}
        ${!unlocked && "opacity-50 grayscale"}
      `}
    >
      {/* Emoji icon */}
      <div className={`text-3xl mb-2 select-none ${!unlocked && "opacity-40"}`}>
        {badge.emoji}
      </div>

      {/* Name */}
      <p className={`text-xs font-semibold leading-tight mb-0.5 ${
        unlocked ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-600"
      }`}>
        {badge.name}
      </p>

      {/* Description */}
      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-snug mb-2">
        {badge.description}
      </p>

      {/* Rarity tag */}
      <span className={`text-[9px] font-bold uppercase tracking-wider ${unlocked ? styles.labelColor : "text-slate-300 dark:text-slate-600"}`}>
        {styles.label}
      </span>

      {/* Unlock date */}
      {unlocked && badge.unlockedAt && (
        <p className="text-[9px] text-slate-400 mt-1">
          {new Date(badge.unlockedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </p>
      )}

      {/* Lock icon overlay */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
          <span className="text-slate-300 dark:text-slate-700 text-lg">🔒</span>
        </div>
      )}
    </motion.div>
  );
}
