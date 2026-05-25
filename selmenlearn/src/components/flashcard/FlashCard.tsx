"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CARD_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  definition:  { label: "Définition",   color: "bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300"   },
  application: { label: "Application",  color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
  example:     { label: "Exemple",      color: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"    },
  comparison:  { label: "Comparaison",  color: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300" },
};

interface FlashCardProps {
  front:    string;
  back:     string;
  cardType: string;
  flipped:  boolean;
  shake?:   boolean;
  onClick:  () => void;
}

export function FlashCard({ front, back, cardType, flipped, shake = false, onClick }: FlashCardProps) {
  const typeInfo = CARD_TYPE_LABELS[cardType] ?? CARD_TYPE_LABELS.definition;

  return (
    <motion.div
      className="perspective-1000 w-full max-w-lg mx-auto cursor-pointer select-none"
      animate={shake ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
      transition={shake ? { duration: 0.4, ease: "easeInOut" } : {}}
      onClick={() => !flipped && onClick()}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0.0, 0.2, 1.0] }}
      >

        {/* ── Recto — Question ───────────────────────────────────────────── */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          className={cn(
            "w-full min-h-56 rounded-2xl border border-slate-200 dark:border-slate-700",
            "bg-white dark:bg-slate-900 shadow-md p-8",
            "flex flex-col items-center justify-center gap-5"
          )}
        >
          {/* Badge type */}
          <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full", typeInfo.color)}>
            {typeInfo.label}
          </span>

          {/* Question */}
          <p className="text-xl font-semibold text-slate-900 dark:text-slate-50 text-center leading-relaxed">
            {front}
          </p>

          {/* Hint */}
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-slate-400 dark:text-slate-500 flex items-center gap-1.5"
          >
            <span className="text-base">👆</span>
            Appuie pour révéler
          </motion.p>
        </div>

        {/* ── Verso — Réponse ────────────────────────────────────────────── */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute",
            inset: 0,
          }}
          className={cn(
            "rounded-2xl border border-brand-200 dark:border-brand-800",
            "bg-white dark:bg-slate-900 shadow-md p-8",
            "flex flex-col items-center justify-center gap-5"
          )}
        >
          <span className="text-xs font-semibold text-brand-500 dark:text-brand-400 uppercase tracking-wide">
            Réponse
          </span>

          <p className="text-xl font-semibold text-slate-900 dark:text-slate-50 text-center leading-relaxed">
            {back}
          </p>

          <p className="text-sm text-slate-400 dark:text-slate-500">
            Comment tu as trouvé ?
          </p>
        </div>

      </motion.div>
    </motion.div>
  );
}
