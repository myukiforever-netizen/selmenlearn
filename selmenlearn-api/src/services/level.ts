// XP thresholds at which each level starts
const XP_THRESHOLDS: number[] = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1_000,  // Level 5
  2_500,  // Level 6
  4_000,  // Level 7
  6_000,  // Level 8
  8_000,  // Level 9
  10_000, // Level 10
  15_000, // Level 11
  20_000, // Level 12
  27_500, // Level 13
  35_000, // Level 14
  45_000, // Level 15
  60_000, // Level 16
  75_000, // Level 17
  100_000,// Level 18
  150_000,// Level 19
  200_000,// Level 20
];

export function xpToLevel(xp: number): number {
  let level = 1;
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export interface LevelProgress {
  level:           number;
  currentLevelXp:  number;
  nextLevelXp:     number | null;
  progressPct:     number;
}

export function getLevelProgress(xp: number): LevelProgress {
  const level        = xpToLevel(xp);
  const currentLevelXp = XP_THRESHOLDS[level - 1] ?? 0;
  const nextLevelXp    = XP_THRESHOLDS[level] ?? null; // null = max level

  let progressPct = 100;
  if (nextLevelXp !== null) {
    const range = nextLevelXp - currentLevelXp;
    const gained = xp - currentLevelXp;
    progressPct = range > 0 ? Math.min(100, Math.round((gained / range) * 100)) : 0;
  }

  return { level, currentLevelXp, nextLevelXp, progressPct };
}
