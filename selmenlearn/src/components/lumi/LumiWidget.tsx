"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLumiStore } from "@/stores/useLumiStore";
import { useUserStore } from "@/stores/useUserStore";
import { LumiSvg } from "./LumiSvg";
import type { LumiEvolution } from "./LumiSvg";

function getLumiEvolution(level: number): LumiEvolution {
  if (level >= 20) return 3;
  if (level >= 10) return 2;
  return 1;
}

export function LumiWidget() {
  const { mood, message, visible } = useLumiStore();
  const level = useUserStore((s) => s.level);
  const evo   = getLumiEvolution(level);

  return (
    <div className="fixed bottom-5 right-4 z-30 flex flex-col items-end gap-1.5 pointer-events-none select-none">
      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        {visible && message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,  scale: 1   }}
            exit={{ opacity: 0,   y: 8,  scale: 0.9 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="max-w-[152px] bg-white dark:bg-slate-900
                       border border-slate-200 dark:border-slate-700
                       rounded-2xl px-3 py-2
                       shadow-md shadow-slate-200/60 dark:shadow-black/30"
          >
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-snug">
              {message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lumi */}
      <LumiSvg mood={mood} evolution={evo} size={70} />
    </div>
  );
}
