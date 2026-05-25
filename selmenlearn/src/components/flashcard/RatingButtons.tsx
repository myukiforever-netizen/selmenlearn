"use client";

import { motion } from "framer-motion";

interface RatingButtonsProps {
  onRate:    (rating: 0 | 1 | 2 | 3) => void;
  disabled?: boolean;
}

const RATINGS = [
  {
    value:   0 as const,
    label:   "À revoir",
    emoji:   "😰",
    hint:    "Oublié",
    classes: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-950/70",
  },
  {
    value:   1 as const,
    label:   "Difficile",
    emoji:   "😬",
    hint:    "Presque",
    classes: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/70",
  },
  {
    value:   2 as const,
    label:   "Bien",
    emoji:   "🙂",
    hint:    "+10 XP",
    classes: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/70",
  },
  {
    value:   3 as const,
    label:   "Facile",
    emoji:   "😄",
    hint:    "+15 XP",
    classes: "bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-950/70",
  },
] as const;

export function RatingButtons({ onRate, disabled }: RatingButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="grid grid-cols-4 gap-2 w-full max-w-lg mx-auto"
    >
      {RATINGS.map(({ value, label, emoji, hint, classes }, i) => (
        <motion.button
          key={value}
          type="button"
          disabled={disabled}
          onClick={() => onRate(value)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 + 0.05, duration: 0.2 }}
          whileTap={{ scale: 0.94 }}
          className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border
                      font-medium text-sm transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed
                      ${classes}`}
        >
          <span className="text-2xl">{emoji}</span>
          <span className="font-semibold text-xs leading-tight">{label}</span>
          <span className="text-[10px] opacity-60">{hint}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
