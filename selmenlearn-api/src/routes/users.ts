import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { getLevelProgress } from "../services/level.js";
import { BADGES } from "../services/badges.js";

const users = new Hono<{ Variables: { userId: string } }>();

users.use("*", authMiddleware);

// ─── GET /users/me ─────────────────────────────────────────────────────────────

users.get("/me", async (c) => {
  const userId = c.get("userId");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id:            true,
      email:         true,
      name:          true,
      xp:            true,
      level:         true,
      streak:        true,
      streakFreezes: true,
      lastStudy:     true,
      createdAt:     true,
      _count: { select: { decks: true, sessions: true, achievements: true } },
    },
  });
  if (!user) return c.json({ message: "User not found" }, 404);

  const levelProgress = getLevelProgress(user.xp);
  return c.json({ ...user, levelProgress });
});

// ─── GET /users/me/stats ───────────────────────────────────────────────────────

users.get("/me/stats", async (c) => {
  const userId = c.get("userId");

  const [user, totalCards, dueCards, masteredCards] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: userId },
      select: { xp: true, level: true, streak: true, streakFreezes: true },
    }),
    prisma.card.count({ where: { deck: { userId } } }),
    prisma.cardReview.count({ where: { userId, nextReview: { lte: new Date() } } }),
    prisma.cardReview.count({ where: { userId, repetitions: { gte: 3 } } }),
  ]);

  if (!user) return c.json({ message: "User not found" }, 404);

  const levelProgress = getLevelProgress(user.xp);
  return c.json({ ...user, totalCards, dueCards, masteredCards, levelProgress });
});

// ─── GET /users/me/activity ────────────────────────────────────────────────────

users.get("/me/activity", async (c) => {
  const userId = c.get("userId");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const sessions = await prisma.session.findMany({
    where: {
      userId,
      startedAt: { gte: thirtyDaysAgo },
      endedAt:   { not: null },
    },
    select: { startedAt: true, xpGained: true, cardsStudied: true },
  });

  const dayMap = new Map<string, { xp: number; cardsStudied: number; sessions: number }>();

  for (const s of sessions) {
    const day     = s.startedAt.toISOString().slice(0, 10);
    const current = dayMap.get(day) ?? { xp: 0, cardsStudied: 0, sessions: 0 };
    dayMap.set(day, {
      xp:           current.xp           + s.xpGained,
      cardsStudied: current.cardsStudied  + s.cardsStudied,
      sessions:     current.sessions      + 1,
    });
  }

  const activity = Array.from(dayMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return c.json(activity);
});

// ─── GET /users/me/achievements ────────────────────────────────────────────────

users.get("/me/achievements", async (c) => {
  const userId = c.get("userId");

  const unlocked = await prisma.achievement.findMany({
    where:  { userId },
    select: { badgeId: true, unlockedAt: true },
  });

  const unlockedMap = new Map(unlocked.map((a) => [a.badgeId, a.unlockedAt]));

  const badges = BADGES.map((badge) => ({
    ...badge,
    unlocked:   unlockedMap.has(badge.id),
    unlockedAt: unlockedMap.get(badge.id)?.toISOString() ?? null,
  }));

  return c.json(badges);
});

export default users;
