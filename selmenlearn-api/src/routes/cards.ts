import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { sm2 } from "../services/sm2.js";
import { updateStreak } from "../services/streak.js";
import { xpToLevel } from "../services/level.js";
import {
  scheduleCard,
  invalidateDueCount,
  getDueCardIdsForDeck,
} from "../services/scheduling.js";

const cards = new Hono<{ Variables: { userId: string } }>();

cards.use("*", authMiddleware);

// ─── GET /decks/:deckId/due ───────────────────────────────────────────────────
// Returns cards due for review today (max 20).
// Tries Redis sorted-set first; falls back to DB query.

cards.get("/decks/:deckId/due", async (c) => {
  const userId = c.get("userId");
  const deckId = c.req.param("deckId");

  // Try Redis schedule first
  const redisIds = await getDueCardIdsForDeck(userId, deckId).catch(() => null);

  if (redisIds && redisIds.length > 0) {
    const dueCards = await prisma.card.findMany({
      where: { id: { in: redisIds.slice(0, 20) }, deckId, deck: { userId } },
      include: { reviews: { where: { userId } } },
    });
    if (dueCards.length > 0) return c.json(dueCards);
    // Redis might be stale → fall through to DB
  }

  // DB fallback
  const dueCards = await prisma.card.findMany({
    where: {
      deckId,
      deck: { userId },
      reviews: {
        some: { userId, nextReview: { lte: new Date() } },
      },
    },
    include: { reviews: { where: { userId } } },
    take: 20,
    orderBy: { id: "asc" },
  });

  return c.json(dueCards);
});

// ─── POST /cards/:id/review ───────────────────────────────────────────────────

const reviewSchema = z.object({
  rating:    z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  timeMs:    z.number().int().min(0).max(120_000).optional().default(0),
  sessionId: z.string().optional(),
});

cards.post(
  "/:id/review",
  zValidator("json", reviewSchema),
  async (c) => {
    const userId = c.get("userId");
    const cardId = c.req.param("id");
    const { rating, timeMs, sessionId } = c.req.valid("json");

    // Verify card belongs to this user
    const card = await prisma.card.findFirst({
      where: { id: cardId, deck: { userId } },
      select: { id: true, deckId: true },
    });
    if (!card) return c.json({ message: "Card not found" }, 404);

    // Load current SM-2 state
    const existing = await prisma.cardReview.findUnique({
      where: { userId_cardId: { userId, cardId } },
    });
    const currentState = existing
      ? { easeFactor: existing.easeFactor, interval: existing.interval, repetitions: existing.repetitions }
      : { easeFactor: 2.5, interval: 1, repetitions: 0 };

    // Compute new SM-2 state
    const result = sm2(currentState, rating);

    // Upsert CardReview
    await prisma.cardReview.upsert({
      where:  { userId_cardId: { userId, cardId } },
      update: {
        easeFactor:   result.easeFactor,
        interval:     result.interval,
        repetitions:  result.repetitions,
        nextReview:   result.nextReview,
        lastReviewed: new Date(),
      },
      create: {
        userId,
        cardId,
        easeFactor:   result.easeFactor,
        interval:     result.interval,
        repetitions:  result.repetitions,
        nextReview:   result.nextReview,
        lastReviewed: new Date(),
      },
    });

    // Record session answer
    if (sessionId) {
      await prisma.sessionAnswer.create({
        data: { sessionId, cardId, rating, isCorrect: rating >= 2, timeMs },
      });
    }

    // XP calculation (+15 for Easy, +10 for Good/Hard, 0 for Again)
    const xpGained = rating === 3 ? 15 : rating >= 1 ? 10 : 0;

    // Update XP + recalculate level
    let newStreak = 0;
    let newLevel  = 1;
    let prevLevel = 1;

    if (xpGained > 0) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data:  { xp: { increment: xpGained } },
        select: { xp: true, level: true },
      });
      prevLevel = updatedUser.level; // level stored before recompute
      newLevel  = xpToLevel(updatedUser.xp);
      if (newLevel !== updatedUser.level) {
        await prisma.user.update({
          where: { id: userId },
          data:  { level: newLevel },
        });
      }
    } else {
      const user = await prisma.user.findUnique({
        where:  { id: userId },
        select: { level: true },
      });
      prevLevel = user?.level ?? 1;
      newLevel  = prevLevel;
    }

    // Update streak
    newStreak = await updateStreak(userId);

    // Redis: update schedule + invalidate due-count cache (fire-and-forget)
    Promise.all([
      scheduleCard(userId, cardId, card.deckId, result.nextReview),
      invalidateDueCount(userId, card.deckId),
    ]).catch(() => {});

    return c.json({
      nextReview: result.nextReview,
      interval:   result.interval,
      xpGained,
      streak:     newStreak,
      level:      newLevel,
      prevLevel,
      leveledUp:  newLevel > prevLevel,
    });
  }
);

// ─── POST /sessions ───────────────────────────────────────────────────────────

cards.post(
  "/sessions",
  zValidator("json", z.object({
    deckId: z.string(),
    mode:   z.enum(["sprint", "marathon", "zen"]).default("sprint"),
  })),
  async (c) => {
    const userId = c.get("userId");
    const { deckId, mode } = c.req.valid("json");

    const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
    if (!deck) return c.json({ message: "Deck not found" }, 404);

    const session = await prisma.session.create({
      data: { userId, deckId, mode },
    });
    return c.json(session, 201);
  }
);

// ─── PATCH /sessions/:id/end ──────────────────────────────────────────────────

cards.patch("/sessions/:id/end", async (c) => {
  const userId    = c.get("userId");
  const sessionId = c.req.param("id");

  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) return c.json({ message: "Session not found" }, 404);

  const answers = await prisma.sessionAnswer.findMany({ where: { sessionId } });
  const xpGained = answers.reduce(
    (sum, a) => sum + (a.isCorrect ? (a.rating === 3 ? 15 : 10) : 0),
    0
  );

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data:  { endedAt: new Date(), xpGained, cardsStudied: answers.length },
  });
  return c.json(updated);
});

export default cards;
