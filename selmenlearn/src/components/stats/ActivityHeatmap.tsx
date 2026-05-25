"use client";

import { motion } from "framer-motion";
import type { ActivityDay } from "@/types";

interface ActivityHeatmapProps {
  data:       ActivityDay[];
  isLoading?: boolean;
}

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

const INTENSITY_CLASSES = [
  "bg-slate-100 dark:bg-slate-800",
  "bg-emerald-200 dark:bg-emerald-900",
  "bg-emerald-400 dark:bg-emerald-700",
  "bg-emerald-600 dark:bg-emerald-400",
] as const;

const INTENSITY_LABELS = ["Aucune activité", "1-5 cartes", "6-15 cartes", "16+ cartes"] as const;

function getIntensity(cardsStudied: number): 0 | 1 | 2 | 3 {
  if (cardsStudied === 0) return 0;
  if (cardsStudied <= 5) return 1;
  if (cardsStudied <= 15) return 2;
  return 3;
}

function toYMD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildWeekGrid(): Date[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Monday of the current week
  const dow = today.getDay(); // 0=Sun
  const sinceMonday = dow === 0 ? 6 : dow - 1;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - sinceMonday);

  // Start 4 weeks before thisMonday → 5 weeks total (35 cells)
  const start = new Date(thisMonday);
  start.setDate(thisMonday.getDate() - 28);

  const weeks: Date[][] = [];
  for (let w = 0; w < 5; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + w * 7 + d);
      week.push(day);
    }
    weeks.push(week);
  }
  return weeks;
}

export function ActivityHeatmap({ data, isLoading }: ActivityHeatmapProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
        <div className="h-4 w-56 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="h-36 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayYMD = toYMD(today);

  const activityMap = new Map<string, ActivityDay>(data.map(d => [d.date, d]));
  const weeks = buildWeekGrid();

  const totalCards = data.reduce((sum, d) => sum + d.cardsStudied, 0);
  const activeDays = data.filter(d => d.cardsStudied > 0).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Activité — 30 derniers jours
        </h2>
        <p className="text-xs text-slate-400">
          {activeDays} jour{activeDays > 1 ? "s" : ""} actif{activeDays > 1 ? "s" : ""} · {totalCards} cartes
        </p>
      </div>

      <div className="overflow-x-auto mt-4">
        <div className="min-w-fit">
          {/* Day-of-week labels */}
          <div className="flex gap-1.5 mb-1.5">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="w-8 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                {label}
              </div>
            ))}
          </div>

          {/* Grid: row = week, col = day-of-week */}
          <div className="flex flex-col gap-1.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex gap-1.5">
                {week.map((day, di) => {
                  const ymd    = toYMD(day);
                  const future = day > today;
                  const isToday = ymd === todayYMD;
                  const activity = activityMap.get(ymd);
                  const intensity = activity ? getIntensity(activity.cardsStudied) : 0;

                  const tooltip = future
                    ? ""
                    : activity
                    ? `${day.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} — ${activity.cardsStudied} carte${activity.cardsStudied > 1 ? "s" : ""}, ${activity.xp} XP`
                    : `${day.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} — aucune activité`;

                  return (
                    <motion.div
                      key={di}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: future ? 0 : 1, scale: future ? 0 : 1 }}
                      transition={{ delay: (wi * 7 + di) * 0.006, duration: 0.25 }}
                      title={tooltip}
                      className={`
                        w-8 h-8 rounded-md transition-colors cursor-default
                        ${future ? "pointer-events-none" : INTENSITY_CLASSES[intensity]}
                        ${isToday ? "ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-slate-900" : ""}
                      `}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[10px] text-slate-400">Moins</span>
            {INTENSITY_CLASSES.map((cls, i) => (
              <div
                key={i}
                title={INTENSITY_LABELS[i]}
                className={`w-4 h-4 rounded-sm ${cls}`}
              />
            ))}
            <span className="text-[10px] text-slate-400">Plus</span>
          </div>
        </div>
      </div>
    </div>
  );
}
