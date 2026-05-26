"use client";

import { motion } from "framer-motion";
import { useUserStore } from "@/stores/useUserStore";
import { LumiSvg } from "./LumiSvg";
import type { LumiMood } from "@/stores/useLumiStore";
import type { LumiEvolution } from "./LumiSvg";

function getLumiEvolution(level: number): LumiEvolution {
  if (level >= 20) return 3;
  if (level >= 10) return 2;
  return 1;
}

function getGreeting(streak: number, level: number): { mood: LumiMood; message: string } {
  if (streak >= 30)  return { mood: "proud",    message: `${streak} jours d'affilée ! Tu es légendaire 🏆` };
  if (streak >= 7)   return { mood: "excited",  message: `${streak} jours de série, c'est incroyable ! ⚡` };
  if (streak >= 3)   return { mood: "happy",    message: `${streak} jours consécutifs, continue comme ça ! 🔥` };
  if (streak === 1)  return { mood: "happy",    message: "Première séance du jour, c'est parti ! 🌟" };
  if (level >= 10)   return { mood: "proud",    message: `Niveau ${level}, impressionnant ! Continue à progresser.` };
  return               { mood: "neutral",   message: "Prêt à apprendre aujourd'hui ?" };
}

interface LumiDashboardProps {
  streak: number;
}

export function LumiDashboard({ streak }: LumiDashboardProps) {
  const level = useUserStore((s) => s.level);
  const evo   = getLumiEvolution(level);
  const { mood, message } = getGreeting(streak, level);

  const evoLabel =
    evo === 1 ? "Lumi — Bébé" :
    evo === 2 ? "Lumi — En croissance" :
                "Lumi — Maître ✨";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden flex items-center gap-5 px-5 py-4
                 bg-white dark:bg-slate-900
                 rounded-2xl border border-slate-200 dark:border-slate-800"
    >
      {/* Decorative glow behind Lumi */}
      <div className="absolute left-0 top-0 w-40 h-full
                      bg-gradient-to-r from-violet-50 dark:from-violet-950/25 to-transparent
                      pointer-events-none" />

      <div className="relative shrink-0">
        <LumiSvg mood={mood} evolution={evo} size={88} float />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-1">
          {evoLabel}
        </p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug">
          {message}
        </p>
        {evo < 3 && (
          <p className="mt-1.5 text-[10px] text-slate-400">
            {evo === 1
              ? `Atteins le niveau 10 pour faire évoluer Lumi !`
              : `Atteins le niveau 20 pour la forme finale de Lumi !`}
          </p>
        )}
      </div>
    </motion.div>
  );
}
