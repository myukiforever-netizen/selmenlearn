"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface LevelUpOverlayProps {
  newLevel:  number;
  onDismiss: () => void;
}

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

// Static gradient class per tier to satisfy Tailwind JIT
const TIER_BG: Record<string, string> = {
  Explorateur: "bg-brand-950",
  Apprenti:    "bg-emerald-950",
  Érudit:      "bg-violet-950",
  Expert:      "bg-amber-950",
  Maître:      "bg-rose-950",
};

const TIER_RING: Record<string, string> = {
  Explorateur: "ring-brand-500/40",
  Apprenti:    "ring-emerald-500/40",
  Érudit:      "ring-violet-500/40",
  Expert:      "ring-amber-500/40",
  Maître:      "ring-rose-500/40",
};

export function LevelUpOverlay({ newLevel, onDismiss }: LevelUpOverlayProps) {
  const title  = LEVEL_TITLES[newLevel] ?? "Maître";
  const bg     = TIER_BG[title]   ?? TIER_BG["Maître"];
  const ring   = TIER_RING[title] ?? TIER_RING["Maître"];

  return (
    <div className={`fixed inset-0 z-[100] ${bg} flex items-center justify-center`}>

      <LevelUpConfetti />

      <div className="relative z-10 flex flex-col items-center gap-7 text-center px-6">

        {/* ── Star badge ── */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.05 }}
          className={`w-28 h-28 rounded-full bg-amber-400 flex items-center justify-center
                      shadow-2xl shadow-amber-400/60 ring-8 ${ring}`}
        >
          <Star className="w-14 h-14 text-white fill-white" />
        </motion.div>

        {/* ── Label + number + title ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <p className="text-amber-400 text-sm font-bold uppercase tracking-[0.2em]">
            Niveau supérieur !
          </p>
          <p className="text-[6rem] font-black text-white leading-none">{newLevel}</p>
          <p className="text-xl font-semibold text-slate-200">{title}</p>
        </motion.div>

        {/* ── CTA ── */}
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          whileTap={{ scale: 0.97 }}
          onClick={onDismiss}
          className="px-10 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-900
                     font-bold rounded-2xl text-sm transition-colors
                     shadow-lg shadow-amber-400/30"
        >
          Continuer ✨
        </motion.button>
      </div>
    </div>
  );
}

// ─── Confettis ────────────────────────────────────────────────────────────────

function LevelUpConfetti() {
  const COLORS = [
    "bg-amber-400", "bg-amber-300", "bg-white",
    "bg-brand-400", "bg-emerald-400", "bg-rose-300", "bg-violet-400",
  ];
  const SHAPES = ["rounded-sm", "rounded-full"];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {Array.from({ length: 44 }, (_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2.5 h-2.5 ${COLORS[i % COLORS.length]} ${SHAPES[i % 2]}`}
          initial={{ left: `${(i * 23 + 7) % 100}%`, top: -28, rotate: 0, opacity: 1 }}
          animate={{
            top:     "115vh",
            rotate:  (i % 2 === 0 ? 1 : -1) * (240 + (i * 53) % 360),
            opacity: [1, 1, 1, 0.6, 0],
          }}
          transition={{
            duration: 2.4 + (i % 6) * 0.35,
            delay:    (i % 9) * 0.09,
            ease:     "easeIn",
          }}
        />
      ))}
    </div>
  );
}
