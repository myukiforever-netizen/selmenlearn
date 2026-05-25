"use client";

import { motion } from "framer-motion";
import { BookOpen, Star, Zap } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useActivity } from "@/hooks/useActivity";
import { ActivityHeatmap } from "@/components/stats/ActivityHeatmap";
import { StreakCard } from "@/components/stats/StreakCard";
import { LevelCard } from "@/components/stats/LevelCard";

export default function StatsPage() {
  const { data: stats,    isLoading: statsLoading    } = useUserStats();
  const { data: activity = [], isLoading: activityLoading } = useActivity();

  const isLoading = statsLoading || activityLoading;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Statistiques</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Ton historique d&apos;apprentissage
        </p>
      </div>

      {/* ── Level + Streak cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading || !stats ? (
          <>
            <div className="h-52 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            <div className="h-52 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LevelCard
                level={stats.level}
                xp={stats.xp}
                levelProgress={stats.levelProgress}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <StreakCard streak={stats.streak} data={activity} />
            </motion.div>
          </>
        )}
      </div>

      {/* ── Activity heatmap ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <ActivityHeatmap data={activity} isLoading={activityLoading} />
      </motion.div>

      {/* ── Summary stats row ── */}
      {!isLoading && stats && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Total cards */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.totalCards}</p>
              <p className="text-xs text-slate-400">cartes au total</p>
            </div>
          </div>

          {/* Mastered */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.masteredCards}</p>
              <p className="text-xs text-slate-400">
                maîtrisées
                {stats.totalCards > 0 && (
                  <span> · {Math.round((stats.masteredCards / stats.totalCards) * 100)}%</span>
                )}
              </p>
            </div>
          </div>

          {/* Due */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              stats.dueCards > 0
                ? "bg-amber-100 dark:bg-amber-950/50"
                : "bg-slate-100 dark:bg-slate-800"
            }`}>
              <Zap className={`w-5 h-5 ${stats.dueCards > 0 ? "text-amber-500" : "text-slate-400"}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${
                stats.dueCards > 0 ? "text-amber-500" : "text-slate-900 dark:text-slate-50"
              }`}>
                {stats.dueCards}
              </p>
              <p className="text-xs text-slate-400">à réviser</p>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
