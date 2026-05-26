"use client";

import { motion } from "framer-motion";
import { Trophy, Zap, Flame, RotateCcw, LayoutDashboard, Star } from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/stores/useUserStore";
import { XpCountUp } from "@/components/xp/XpCountUp";
import type { RatingDistribution } from "@/types";

// ─── Niveau titles ────────────────────────────────────────────────────────────

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

const XP_THRESHOLDS = [
  0, 100, 250, 500, 1_000, 2_500, 4_000, 6_000, 8_000, 10_000,
  15_000, 20_000, 27_500, 35_000, 45_000, 60_000, 75_000, 100_000, 150_000, 200_000,
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface SessionCompleteProps {
  deckId:              string;
  totalCards:          number;
  xpGained:            number;
  streak:              number;
  ratingDistribution:  RatingDistribution;
  onRestart:           () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SessionComplete({
  deckId,
  totalCards,
  xpGained,
  streak,
  ratingDistribution,
  onRestart,
}: SessionCompleteProps) {
  const againCount = ratingDistribution.again;

  // Read current state from Zustand (updated by useStudySession after each review)
  const level = useUserStore((s) => s.level);
  const totalXp = useUserStore((s) => s.xp);

  const title        = LEVEL_TITLES[level] ?? "Maître";
  const levelStart   = XP_THRESHOLDS[level - 1] ?? 0;
  const levelEnd     = XP_THRESHOLDS[level]      ?? null;
  const progressPct  = levelEnd !== null
    ? Math.min(100, Math.round(((totalXp - levelStart) / (levelEnd - levelStart)) * 100))
    : 100;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <ConfettiParticles />

      {/* ── Trophy ── */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
        className="w-24 h-24 rounded-full bg-brand-500 flex items-center justify-center
                   shadow-2xl shadow-brand-500/40"
      >
        <Trophy className="w-12 h-12 text-white" />
      </motion.div>

      {/* ── Titre ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Session terminée !
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {totalCards} carte{totalCards > 1 ? "s" : ""} révisée{totalCards > 1 ? "s" : ""}
        </p>
      </motion.div>

      {/* ── Stats XP + Streak ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-4 w-full max-w-xs"
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-center">
          <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            <XpCountUp target={xpGained} prefix="+" />
          </p>
          <p className="text-xs text-slate-400 mt-0.5">XP gagnés</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1.5" />
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{streak}</p>
          <p className="text-xs text-slate-400 mt-0.5">Jours de suite</p>
        </div>
      </motion.div>

      {/* ── Barre progression XP ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.48 }}
        className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-brand-500" />
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Niveau {level} — {title}
          </span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-500 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progressPct / 100 }}
            style={{ transformOrigin: "left" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.55 }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5">
          {totalXp.toLocaleString()} XP
          {levelEnd !== null && ` / ${levelEnd.toLocaleString()} XP`}
        </p>
      </motion.div>

      {/* ── Distribution notes ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-xs space-y-2.5"
      >
        <RatingBar label="Facile"    count={ratingDistribution.easy}  total={totalCards} color="bg-brand-500"   delay={0.65} />
        <RatingBar label="Bien"      count={ratingDistribution.good}  total={totalCards} color="bg-emerald-500" delay={0.7}  />
        <RatingBar label="Difficile" count={ratingDistribution.hard}  total={totalCards} color="bg-orange-400"  delay={0.75} />
        <RatingBar label="À revoir"  count={ratingDistribution.again} total={totalCards} color="bg-rose-400"    delay={0.8}  />
      </motion.div>

      {/* ── Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-3 w-full max-w-xs"
      >
        <Link
          href={`/decks/${deckId}`}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl
                     border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400
                     font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          Retour au deck
        </Link>

        {againCount > 0 && (
          <button
            type="button"
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl
                       bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm
                       transition-colors shadow-md shadow-brand-500/25"
          >
            <RotateCcw className="w-4 h-4" />
            Revoir ({againCount})
          </button>
        )}
      </motion.div>
    </div>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function RatingBar({
  label, count, total, color, delay,
}: {
  label: string; count: number; total: number; color: string; delay: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-16 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.55, ease: "easeOut", delay }}
        />
      </div>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-4 shrink-0">
        {count}
      </span>
    </div>
  );
}

function ConfettiParticles() {
  const COLORS = [
    "bg-brand-500", "bg-emerald-400", "bg-amber-400",
    "bg-rose-400",  "bg-purple-400",  "bg-cyan-400",
  ];
  const SHAPES = ["rounded-sm", "rounded-full"];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {Array.from({ length: 28 }, (_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2.5 h-2.5 ${COLORS[i % COLORS.length]} ${SHAPES[i % 2]}`}
          initial={{ left: `${(i * 37) % 100}%`, top: -20, rotate: 0, opacity: 1 }}
          animate={{
            top:     "110vh",
            rotate:  (i % 2 === 0 ? 1 : -1) * (180 + (i * 47) % 360),
            opacity: [1, 1, 1, 0],
          }}
          transition={{
            duration: 2.2 + (i % 5) * 0.4,
            delay:    (i % 7) * 0.15,
            ease:     "easeIn",
          }}
        />
      ))}
    </div>
  );
}
