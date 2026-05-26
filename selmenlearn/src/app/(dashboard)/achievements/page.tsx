"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { AchievementBadge } from "@/components/achievements/AchievementBadge";
import { useAchievements } from "@/hooks/useAchievements";
import type { Badge } from "@/types";

const CATEGORY_LABELS: Record<Badge["category"], string> = {
  streak: "🔥 Régularité",
  cards:  "📚 Cartes révisées",
  level:  "⭐ Niveaux",
  quiz:   "🎮 Quiz",
  deck:   "📦 Decks",
};

const CATEGORY_ORDER: Badge["category"][] = ["streak", "cards", "level", "quiz", "deck"];

export default function AchievementsPage() {
  const { data: badges, isLoading } = useAchievements();

  const unlockedCount = badges?.filter((b) => b.unlocked).length ?? 0;
  const totalCount    = badges?.length ?? 0;

  // Group badges by category
  const grouped = CATEGORY_ORDER.reduce<Record<Badge["category"], Badge[]>>((acc, cat) => {
    acc[cat] = badges?.filter((b) => b.category === cat) ?? [];
    return acc;
  }, {} as Record<Badge["category"], Badge[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Badges</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {isLoading ? "…" : `${unlockedCount} / ${totalCount} débloqués`}
          </p>
        </div>

        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="flex flex-col items-end"
          >
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 rounded-2xl px-4 py-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div className="text-right">
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{unlockedCount}</p>
                <p className="text-[10px] text-amber-500/70 leading-none">badges</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-2 w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-amber-400 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: totalCount > 0 ? unlockedCount / totalCount : 0 }}
                style={{ transformOrigin: "left" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Loading skeleton ── */}
      {isLoading && (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Badge categories ── */}
      {!isLoading && badges && (
        <div className="space-y-8">
          {CATEGORY_ORDER.map((cat) => {
            const catBadges = grouped[cat];
            if (catBadges.length === 0) return null;
            const catUnlocked = catBadges.filter((b) => b.unlocked).length;

            return (
              <motion.section
                key={cat}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {CATEGORY_LABELS[cat]}
                  </h2>
                  <span className="text-xs text-slate-400">
                    {catUnlocked}/{catBadges.length}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {catBadges.map((badge, idx) => (
                    <AchievementBadge key={badge.id} badge={badge} index={idx} />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      )}

    </div>
  );
}
