"use client";

import { motion } from "framer-motion";
import { Zap, Flame, BookOpen, Star } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";

// ─── Title mapping ─────────────────────────────────────────────────────────────

const LEVEL_TITLES: Record<number, string> = {
  1:  "Explorateur",  2:  "Explorateur",  3:  "Explorateur",
  4:  "Explorateur",  5:  "Explorateur",
  6:  "Apprenti",     7:  "Apprenti",     8:  "Apprenti",
  9:  "Apprenti",     10: "Apprenti",
  11: "Érudit",       12: "Érudit",       13: "Érudit",
  14: "Érudit",       15: "Érudit",
  16: "Expert",       17: "Expert",       18: "Expert",
  19: "Expert",       20: "Maître",
};

function getLevelTitle(level: number): string {
  return LEVEL_TITLES[level] ?? "Maître";
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function StatsBar() {
  const { data: stats, isLoading } = useUserStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  const { xp, level, streak, totalCards, dueCards, masteredCards, levelProgress } = stats;
  const title = getLevelTitle(level);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

      {/* ── Niveau / XP ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-brand-500" />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Niveau</span>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{level}</p>
        <p className="text-xs text-slate-400 mb-2">{title}</p>
        {/* XP progress bar */}
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-500 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: levelProgress.progressPct / 100 }}
            style={{ transformOrigin: "left" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          {xp.toLocaleString()} XP
          {levelProgress.nextLevelXp !== null && ` / ${levelProgress.nextLevelXp.toLocaleString()}`}
        </p>
      </motion.div>

      {/* ── Streak ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center">
            <Flame className={`w-3.5 h-3.5 text-orange-500 ${streak > 0 ? "animate-streak-pulse" : ""}`} />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Streak</span>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{streak}</p>
        <p className="text-xs text-slate-400">
          {streak === 0
            ? "Commence aujourd'hui !"
            : streak === 1
            ? "1 jour consécutif"
            : `${streak} jours consécutifs`}
        </p>
      </motion.div>

      {/* ── Cartes dues ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">À réviser</span>
        </div>
        <p className={`text-2xl font-bold ${dueCards > 0 ? "text-amber-500" : "text-slate-900 dark:text-slate-50"}`}>
          {dueCards}
        </p>
        <p className="text-xs text-slate-400">
          {dueCards === 0 ? "Tout est à jour !" : `carte${dueCards > 1 ? "s" : ""} en attente`}
        </p>
      </motion.div>

      {/* ── Maîtrisées ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Maîtrisées</span>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{masteredCards}</p>
        <p className="text-xs text-slate-400">
          sur {totalCards} carte{totalCards > 1 ? "s" : ""}
          {totalCards > 0 && (
            <span> · {Math.round((masteredCards / totalCards) * 100)}%</span>
          )}
        </p>
      </motion.div>

    </div>
  );
}
