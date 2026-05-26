"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Lightbulb } from "lucide-react";
import type { QuizQuestion as QuizQuestionType } from "@/types";

const MCQ_LABELS = ["A", "B", "C", "D"];

interface QuizQuestionProps {
  question:    QuizQuestionType;
  selectedIdx: number | null;
  isAnswered:  boolean;
  onSelect:    (idx: number) => void;
  onNext:      () => void;
  isLast:      boolean;
}

export function QuizQuestion({
  question,
  selectedIdx,
  isAnswered,
  onSelect,
  onNext,
  isLast,
}: QuizQuestionProps) {
  const isTrueFalse = question.type === "true_false";

  return (
    <div className="w-full max-w-lg mx-auto space-y-5">

      {/* ── Carte question ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200
                      dark:border-slate-800 p-6 shadow-sm">
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 leading-snug">
          {question.question}
        </p>
      </div>

      {/* ── Options ── */}
      <div className={`grid gap-3 ${isTrueFalse ? "grid-cols-2" : "grid-cols-1"}`}>
        {question.options.map((option, idx) => {
          const state = getOptionState(idx, selectedIdx, isAnswered, option.isCorrect);
          return (
            <OptionButton
              key={idx}
              idx={idx}
              label={isTrueFalse ? undefined : MCQ_LABELS[idx]}
              text={option.text}
              state={state}
              disabled={isAnswered}
              onClick={() => !isAnswered && onSelect(idx)}
            />
          );
        })}
      </div>

      {/* ── Explication + bouton Suivant ── */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {/* Explication */}
            <div className="flex gap-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200
                            dark:border-slate-800 rounded-xl px-4 py-3">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {question.explanation}
              </p>
            </div>

            {/* Bouton Suivant */}
            <button
              type="button"
              onClick={onNext}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white
                         bg-brand-500 hover:bg-brand-600 transition-colors
                         shadow-md shadow-brand-500/25"
            >
              {isLast ? "Voir les résultats" : "Question suivante →"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Option ───────────────────────────────────────────────────────────────────

type OptionState = "idle" | "correct" | "wrong" | "reveal" | "dim";

function getOptionState(
  idx:         number,
  selectedIdx: number | null,
  isAnswered:  boolean,
  isCorrect:   boolean
): OptionState {
  if (!isAnswered) return "idle";
  const isSelected = idx === selectedIdx;
  if (isSelected && isCorrect)  return "correct";
  if (isSelected && !isCorrect) return "wrong";
  if (!isSelected && isCorrect) return "reveal";
  return "dim";
}

const OPTION_STYLES: Record<OptionState, string> = {
  idle:    "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 cursor-pointer",
  correct: "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
  wrong:   "border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
  reveal:  "border-emerald-400 border-dashed bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400",
  dim:     "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 opacity-60",
};

function OptionButton({
  idx, label, text, state, disabled, onClick,
}: {
  idx:      number;
  label?:   string;
  text:     string;
  state:    OptionState;
  disabled: boolean;
  onClick:  () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={state === "idle" ? { scale: 0.98 } : undefined}
      className={`flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl
                  border-2 transition-all duration-150 ${OPTION_STYLES[state]}`}
    >
      {/* Label lettre (A/B/C/D) ou icône feedback */}
      {state === "correct" || state === "wrong" ? (
        <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white
          ${state === "correct" ? "bg-emerald-500" : "bg-rose-500"}`}>
          {state === "correct"
            ? <Check className="w-3.5 h-3.5" strokeWidth={3} />
            : <X     className="w-3.5 h-3.5" strokeWidth={3} />}
        </span>
      ) : label ? (
        <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0
                          text-xs font-bold border
                          ${state === "idle"
                            ? "border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
                            : state === "reveal"
                              ? "border-emerald-400 text-emerald-600 dark:text-emerald-400"
                              : "border-slate-200 dark:border-slate-700 text-slate-400"}`}>
          {label}
        </span>
      ) : null}

      <span className="text-sm font-medium leading-snug">{text}</span>
    </motion.button>
  );
}
