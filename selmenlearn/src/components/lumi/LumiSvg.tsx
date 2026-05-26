"use client";

import { useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LumiMood } from "@/stores/useLumiStore";

export type LumiEvolution = 1 | 2 | 3;

interface LumiSvgProps {
  mood?:      LumiMood;
  evolution?: LumiEvolution;
  size?:      number;
  float?:     boolean;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DARK = "#1E1B4B";

// Eye anchor points
const lx = 31, rx = 49, ey = 46;

// Per-evolution body fill colors
const EVO_COLORS: Record<LumiEvolution, { from: string; to: string; halo: string }> = {
  1: { from: "#B39DFF", to: "#6D28D9", halo: "#7C3AED" },
  2: { from: "#67C3FF", to: "#1D4ED8", halo: "#3B82F6" },
  3: { from: "#FDE68A", to: "#B45309", halo: "#F59E0B" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FourPointStar({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  const q = r * 0.35;
  const pts = [
    `${cx},${cy - r}`,
    `${cx + q},${cy - q}`,
    `${cx + r},${cy}`,
    `${cx + q},${cy + q}`,
    `${cx},${cy + r}`,
    `${cx - q},${cy + q}`,
    `${cx - r},${cy}`,
    `${cx - q},${cy - q}`,
  ].join(" ");
  return <polygon points={pts} fill={fill} />;
}

function Eyes({ mood }: { mood: LumiMood }) {
  switch (mood) {
    case "happy":
      return (
        <>
          <path d={`M${lx-5},${ey+3} Q${lx},${ey-4} ${lx+5},${ey+3}`}
                fill="none" stroke={DARK} strokeWidth="2.8" strokeLinecap="round" />
          <path d={`M${rx-5},${ey+3} Q${rx},${ey-4} ${rx+5},${ey+3}`}
                fill="none" stroke={DARK} strokeWidth="2.8" strokeLinecap="round" />
        </>
      );

    case "sad":
      return (
        <>
          <path d={`M${lx-5},${ey-1} Q${lx},${ey+6} ${lx+5},${ey-1}`}
                fill="none" stroke={DARK} strokeWidth="2.8" strokeLinecap="round" />
          <path d={`M${rx-5},${ey-1} Q${rx},${ey+6} ${rx+5},${ey-1}`}
                fill="none" stroke={DARK} strokeWidth="2.8" strokeLinecap="round" />
          {/* Teardrop */}
          <ellipse cx={lx} cy={ey+10} rx="1.5" ry="2.5" fill="#93C5FD" fillOpacity="0.75" />
        </>
      );

    case "surprised":
      return (
        <>
          <circle cx={lx} cy={ey} r="6" fill={DARK} />
          <circle cx={rx} cy={ey} r="6" fill={DARK} />
          <circle cx={lx+2} cy={ey-2} r="2" fill="white" fillOpacity="0.9" />
          <circle cx={rx+2} cy={ey-2} r="2" fill="white" fillOpacity="0.9" />
        </>
      );

    case "proud":
      return (
        <>
          {/* Upper arc (squint top) */}
          <path d={`M${lx-5},${ey} Q${lx},${ey-5} ${lx+5},${ey}`}
                fill="none" stroke={DARK} strokeWidth="2.8" strokeLinecap="round" />
          <path d={`M${rx-5},${ey} Q${rx},${ey-5} ${rx+5},${ey}`}
                fill="none" stroke={DARK} strokeWidth="2.8" strokeLinecap="round" />
          {/* Lower arc (squint bottom) */}
          <path d={`M${lx-4},${ey} Q${lx},${ey+3} ${lx+4},${ey}`}
                fill="none" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.45" />
          <path d={`M${rx-4},${ey} Q${rx},${ey+3} ${rx+4},${ey}`}
                fill="none" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.45" />
        </>
      );

    case "excited":
      return (
        <>
          <FourPointStar cx={lx} cy={ey} r={6} fill="#FCD34D" />
          <FourPointStar cx={rx} cy={ey} r={6} fill="#FCD34D" />
        </>
      );

    case "thinking":
      return (
        <>
          {/* Left: normal oval */}
          <ellipse cx={lx} cy={ey} rx="4" ry="5" fill={DARK} />
          <circle cx={lx+1.5} cy={ey-2} r="1.5" fill="white" fillOpacity="0.85" />
          {/* Right: half-lidded */}
          <ellipse cx={rx} cy={ey+1.5} rx="4" ry="3" fill={DARK} />
          <circle cx={rx+1.5} cy={ey-0.5} r="1" fill="white" fillOpacity="0.8" />
        </>
      );

    default: // neutral
      return (
        <>
          <ellipse cx={lx} cy={ey} rx="4" ry="5" fill={DARK} />
          <ellipse cx={rx} cy={ey} rx="4" ry="5" fill={DARK} />
          <circle cx={lx+1.5} cy={ey-2} r="1.5" fill="white" fillOpacity="0.85" />
          <circle cx={rx+1.5} cy={ey-2} r="1.5" fill="white" fillOpacity="0.85" />
        </>
      );
  }
}

function Mouth({ mood }: { mood: LumiMood }) {
  switch (mood) {
    case "happy":
      return <path d="M32,62 Q40,55 48,62" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />;
    case "sad":
      return <path d="M33,57 Q40,64 47,57" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" />;
    case "surprised":
      return <ellipse cx="40" cy="60" rx="3.5" ry="4.5" fill={DARK} />;
    case "proud":
      return <path d="M33,62 Q40,55 47,62" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />;
    case "excited":
      return <path d="M30,62 Q40,53 50,62" fill="none" stroke={DARK} strokeWidth="3" strokeLinecap="round" />;
    case "thinking":
      return <path d="M36,59 Q42,56 46,62" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" />;
    default: // neutral
      return <path d="M35,60 Q40,63 45,60" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" />;
  }
}

function Sparkles() {
  return (
    <>
      <motion.g
        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        style={{ transformOrigin: "10px 20px" }}
      >
        <FourPointStar cx={10} cy={20} r={3.5} fill="#FCD34D" />
      </motion.g>
      <motion.g
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [1, 0.6, 1] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut", delay: 0.9 }}
        style={{ transformOrigin: "70px 16px" }}
      >
        <FourPointStar cx={70} cy={16} r={3} fill="#FCD34D" />
      </motion.g>
      <motion.g
        animate={{ scale: [1.1, 0.8, 1.1], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 1.7, ease: "easeInOut", delay: 0.4 }}
        style={{ transformOrigin: "7px 70px" }}
      >
        <FourPointStar cx={7} cy={70} r={2.5} fill="#A78BFA" />
      </motion.g>
    </>
  );
}

function Crown() {
  return (
    <motion.g
      animate={{ y: [0, -2, 0] }}
      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
    >
      <path
        d="M30,24 L30,14 L35,20 L40,10 L45,20 L50,14 L50,24 Z"
        fill="#FBBF24" stroke="#D97706" strokeWidth="1" strokeLinejoin="round"
      />
      <circle cx="40" cy="12.5" r="2.5" fill="#EF4444" />
      <circle cx="31.5" cy="17" r="1.8" fill="#60A5FA" />
      <circle cx="48.5" cy="17" r="1.8" fill="#34D399" />
    </motion.g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LumiSvg({
  mood      = "neutral",
  evolution = 1,
  size      = 80,
  float     = true,
  className,
}: LumiSvgProps) {
  const uid    = useId();
  const evo    = (Math.min(3, Math.max(1, evolution))) as LumiEvolution;
  const colors = EVO_COLORS[evo];
  const bodyR  = evo === 1 ? 26 : evo === 2 ? 27 : 28;
  const gradId = `${uid}-body`;
  const haloId = `${uid}-halo`;

  return (
    <motion.div
      className={className}
      animate={float ? { y: [0, -5, 0] } : {}}
      transition={float ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" } : {}}
      style={{ width: size, height: Math.round(size * 1.125) }}
    >
      {/* Spring bounce on mood change */}
      <motion.div
        key={mood}
        initial={{ scale: 0.88 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 16 }}
        style={{ width: "100%", height: "100%" }}
      >
        <svg
          viewBox="0 0 80 90"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          overflow="visible"
        >
          <defs>
            <radialGradient id={gradId} cx="38%" cy="32%" r="65%">
              <stop offset="0%"   stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to}   />
            </radialGradient>
            <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={colors.halo} stopOpacity="0.18" />
              <stop offset="100%" stopColor={colors.halo} stopOpacity="0"    />
            </radialGradient>
          </defs>

          {/* Outer halo glow */}
          <motion.circle
            cx="40" cy="52" r="36"
            fill={`url(#${haloId})`}
            animate={{ r: [36, 39, 36] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          />

          {/* Body with gentle pulse */}
          <motion.g
            animate={{ scale: [1, 1.025, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            style={{ transformOrigin: "40px 52px" }}
          >
            <circle cx="40" cy="52" r={bodyR} fill={`url(#${gradId})`} />
          </motion.g>

          {/* Blush cheeks */}
          <ellipse cx="21" cy="55" rx="5" ry="3.5" fill="#EC4899" fillOpacity="0.22" />
          <ellipse cx="59" cy="55" rx="5" ry="3.5" fill="#EC4899" fillOpacity="0.22" />

          {/* Face — cross-fades on mood change */}
          <AnimatePresence mode="wait">
            <motion.g
              key={mood}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Eyes  mood={mood} />
              <Mouth mood={mood} />
            </motion.g>
          </AnimatePresence>

          {/* Evolution extras */}
          {evo >= 2 && <Sparkles />}
          {evo === 3 && <Crown    />}
        </svg>
      </motion.div>
    </motion.div>
  );
}
