"use client";

import { motion } from "framer-motion";
import { Flame, CheckCircle2 } from "lucide-react";
import type { ActivityDay } from "@/types";

interface StreakCardProps {
  streak: number;
  data:   ActivityDay[];
}

const MILESTONE_DAYS = [3, 7, 14, 30, 100] as const;

const MILESTONE_LABELS: Record<number, string> = {
  3:   "3 jours",
  7:   "1 semaine",
  14:  "2 semaines",
  30:  "1 mois",
  100: "100 jours",
};

function getMotivationalMessage(streak: number): string {
  if (streak === 0) return "Commence aujourd'hui pour lancer ta série !";
  if (streak === 1) return "C'est parti ! Continue demain !";
  if (streak < 7)  return `${streak} jours de suite — tu es lancé !`;
  if (streak < 14) return "Une semaine complète, continue sur ta lancée !";
  if (streak < 30) return "Série impressionnante, ne lâche rien !";
  if (streak < 100) return "Un mois de révisions — extraordinaire !";
  return "Légendaire — rien ne t'arrête !";
}

function toYMD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const DAY_SHORT = ["D", "L", "M", "M", "J", "V", "S"] as const;

export function StreakCard({ streak, data }: StreakCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const studiedDates = new Set(data.filter(d => d.cardsStudied > 0).map(d => d.date));

  // Last 7 days: index 0 = 6 days ago, index 6 = today
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });

  const unlockedMilestones = MILESTONE_DAYS.filter(m => streak >= m);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center">
          <Flame className={`w-4 h-4 text-orange-500 ${streak > 0 ? "animate-streak-pulse" : ""}`} />
        </div>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Série de révisions</h2>
      </div>

      {/* Big streak number */}
      <div className="flex items-end gap-3 mb-5">
        <motion.p
          key={streak}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`text-5xl font-bold ${streak > 0 ? "text-orange-500" : "text-slate-900 dark:text-slate-50"}`}
        >
          {streak}
        </motion.p>
        <p className="text-sm text-slate-500 pb-2">
          {streak === 1 ? "jour consécutif" : "jours consécutifs"}
        </p>
      </div>

      {/* 7-day mini calendar */}
      <div className="flex gap-1.5 mb-4">
        {last7.map((day, i) => {
          const ymd     = toYMD(day);
          const isToday = i === 6;
          const studied = studiedDates.has(ymd);
          const dow     = day.getDay();

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-slate-400 font-medium">{DAY_SHORT[dow]}</span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
                title={day.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })}
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center transition-colors
                  ${isToday && studied
                    ? "bg-orange-500 shadow-sm shadow-orange-500/30"
                    : studied
                    ? "bg-orange-200 dark:bg-orange-900/60"
                    : isToday
                    ? "border-2 border-orange-300 dark:border-orange-700"
                    : "bg-slate-100 dark:bg-slate-800"
                  }
                `}
              >
                {studied && (
                  <Flame className={`w-3.5 h-3.5 ${isToday ? "text-white" : "text-orange-500 dark:text-orange-400"}`} />
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Motivational message */}
      <p className="text-xs text-slate-400 mb-3">{getMotivationalMessage(streak)}</p>

      {/* Milestones badges */}
      {unlockedMilestones.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unlockedMilestones.map(m => (
            <span
              key={m}
              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full
                         bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400"
            >
              <CheckCircle2 className="w-3 h-3" />
              {MILESTONE_LABELS[m]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
