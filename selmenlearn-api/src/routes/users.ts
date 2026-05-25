import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { getLevelProgress } from "../services/level.js";

const users = new Hono<{ Variables: { userId: string } }>();

users.use("*", authMiddleware);

// ─── GET /users/me ─────────────────────────────────────────────────────────────

users.get("/me", async (c) => {
  const userId = c.get("userId");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id:        true,
      email:     true,
      name:      true,
      xp:        true,
      level:     true,
      streak:    true,
      lastStudy: true,
      createdAt: true,
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
      select: { xp: true, level: true, streak: true },
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
// Returns daily activity for the last 30 days (for heatmap / streak display).

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

  // Aggregate by calendar day (YYYY-MM-DD)
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

export default users;
