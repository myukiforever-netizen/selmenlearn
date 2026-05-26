import { prisma } from "../lib/prisma.js";

export interface StreakResult {
  streak:        number;
  streakFreezes: number;
  freezeUsed:    boolean;
  freezeGranted: boolean;
}

// Returns year*100+isoWeek, e.g. 202622 for week 22 of 2026
function getWeekKey(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return d.getUTCFullYear() * 100 + week;
}

const MAX_FREEZES = 3;

export async function updateStreak(userId: string): Promise<StreakResult> {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { streak: true, lastStudy: true, streakFreezes: true, lastFreezeWeek: true },
  });
  if (!user) return { streak: 0, streakFreezes: 0, freezeUsed: false, freezeGranted: false };

  const now       = new Date();
  const today     = new Date(now);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastStudy = user.lastStudy ? new Date(user.lastStudy) : null;
  if (lastStudy) lastStudy.setHours(0, 0, 0, 0);

  const currentWeek = getWeekKey(now);

  // Grant 1 freeze per new ISO week (up to MAX_FREEZES)
  let streakFreezes = user.streakFreezes;
  let lastFreezeWeek = user.lastFreezeWeek;
  let freezeGranted = false;

  if (currentWeek > lastFreezeWeek) {
    lastFreezeWeek = currentWeek;
    if (streakFreezes < MAX_FREEZES) {
      streakFreezes = Math.min(streakFreezes + 1, MAX_FREEZES);
      freezeGranted = true;
    }
  }

  // Already studied today — no streak change (but possibly grant freeze)
  if (lastStudy && lastStudy.getTime() === today.getTime()) {
    if (freezeGranted || lastFreezeWeek !== user.lastFreezeWeek) {
      await prisma.user.update({
        where: { id: userId },
        data:  { streakFreezes, lastFreezeWeek },
      });
    }
    return { streak: user.streak, streakFreezes, freezeUsed: false, freezeGranted };
  }

  let newStreak: number;
  let freezeUsed = false;

  if (!lastStudy) {
    // First ever study
    newStreak = 1;
  } else if (lastStudy.getTime() === yesterday.getTime()) {
    // Studied yesterday → increment
    newStreak = user.streak + 1;
  } else {
    // Missed at least one day — check if freeze covers exactly 1 missed day
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    if (lastStudy.getTime() === twoDaysAgo.getTime() && streakFreezes > 0) {
      // Missed exactly 1 day → consume freeze, maintain streak then count today
      streakFreezes -= 1;
      freezeUsed    = true;
      newStreak     = user.streak + 1;
    } else {
      newStreak = 1;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data:  { streak: newStreak, lastStudy: new Date(), streakFreezes, lastFreezeWeek },
  });

  return { streak: newStreak, streakFreezes, freezeUsed, freezeGranted };
}
