"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

interface FeedbackOverlayProps {
  feedback:  "correct" | "incorrect" | null;
  xpGained?: number;
}

export function FeedbackOverlay({ feedback, xpGained }: FeedbackOverlayProps) {
  const showXp = feedback === "correct" && xpGained && xpGained > 0;

  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          key={feedback}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none ${
            feedback === "correct"
              ? "bg-emerald-500/8"
              : "bg-rose-500/8"
          }`}
        >
          {/* ── Icône correcte/incorrecte ── */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl ${
              feedback === "correct"
                ? "bg-emerald-500 shadow-emerald-500/40"
                : "bg-rose-500 shadow-rose-500/40"
            }`}
          >
            {feedback === "correct" ? (
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            ) : (
              <X className="w-12 h-12 text-white" strokeWidth={3} />
            )}
          </motion.div>

          {/* ── Badge +XP flottant ── */}
          {showXp && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 1, 0], y: -80, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2
                         bg-emerald-500 text-white font-bold text-base
                         px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/30
                         whitespace-nowrap"
            >
              +{xpGained} XP
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
