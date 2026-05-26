"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Zap, Flame, RotateCcw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface QuizCompleteProps {
  deckId:    string;
  score:     number;
  total:     number;
  xpGained:  number;
  streak:    number;
  onRestart: () => void;
}

export function QuizComplete({
  deckId, score, total, xpGained, streak, onRestart,
}: QuizCompleteProps) {
  const pct        = total > 0 ? Math.round((score / total) * 100) : 0;
  const isPerfect  = score === total;
  const isGood     = pct >= 70;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center
                    px-6 py-12 gap-8 overflow-hidden bg-slate-50 dark:bg-slate-950">

      {isPerfect && <ConfettiParticles />}

      {/* ── Icône ── */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
        className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl
          ${isPerfect  ? "bg-amber-400 shadow-amber-400/40"
          : isGood     ? "bg-brand-500 shadow-brand-500/40"
          :              "bg-slate-400 shadow-slate-400/30"}`}
      >
        {isPerfect
          ? <Star  className="w-12 h-12 text-white fill-white" />
          : <Trophy className="w-12 h-12 text-white" />}
      </motion.div>

      {/* ── Titre ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-center space-y-1.5"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          {isPerfect ? "Score parfait !" : isGood ? "Bien joué !" : "Quiz terminé"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {score} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""} sur {total}
        </p>
      </motion.div>

      {/* ── Score circulaire ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 }}
        className="relative w-28 h-28"
      >
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none"
            className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none"
            className={isPerfect ? "stroke-amber-400" : isGood ? "stroke-brand-500" : "stroke-slate-400"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - pct / 100) }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.45 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">{pct}%</span>
        </div>
      </motion.div>

      {/* ── Stats XP + Streak ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="grid grid-cols-2 gap-4 w-full max-w-xs"
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200
                        dark:border-slate-800 p-5 text-center">
          <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">+{xpGained}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            XP gagnés{isPerfect && <span className="text-amber-500"> ★ bonus</span>}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200
                        dark:border-slate-800 p-5 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1.5" />
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{streak}</p>
          <p className="text-xs text-slate-400 mt-0.5">Jours de suite</p>
        </div>
      </motion.div>

      {/* ── Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="flex flex-col sm:flex-row gap-3 w-full max-w-xs"
      >
        <Link
          href={`/decks/${deckId}`}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl
                     border border-slate-200 dark:border-slate-700 text-slate-600
                     dark:text-slate-400 font-medium text-sm
                     hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          Retour au deck
        </Link>

        <button
          type="button"
          onClick={onRestart}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl
                     bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm
                     transition-colors shadow-md shadow-brand-500/25"
        >
          <RotateCcw className="w-4 h-4" />
          Nouveau quiz
        </button>
      </motion.div>
    </div>
  );
}

// ─── Confettis (score parfait uniquement) ─────────────────────────────────────

function ConfettiParticles() {
  const COLORS = ["bg-amber-400", "bg-brand-500", "bg-emerald-400", "bg-rose-400", "bg-purple-400"];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {Array.from({ length: 28 }, (_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2.5 h-2.5 ${COLORS[i % COLORS.length]} rounded-sm`}
          initial={{ left: `${(i * 37) % 100}%`, top: -20, rotate: 0, opacity: 1 }}
          animate={{ top: "110vh", rotate: (i % 2 ? 1 : -1) * (180 + (i * 47) % 360), opacity: [1, 1, 0] }}
          transition={{ duration: 2.2 + (i % 5) * 0.4, delay: (i % 7) * 0.15, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
