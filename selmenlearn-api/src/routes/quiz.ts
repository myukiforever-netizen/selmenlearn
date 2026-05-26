import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { generateQuiz } from "../services/ai.js";
import { updateStreak } from "../services/streak.js";
import { xpToLevel } from "../services/level.js";

const quiz = new Hono<{ Variables: { userId: string } }>();

quiz.use("*", authMiddleware);

// ─── GET /decks/:id/quiz ──────────────────────────────────────────────────────
// Génère N questions de quiz depuis les cartes du deck via Claude API.

quiz.get("/:id/quiz", async (c) => {
  const userId = c.get("userId");
  const deckId = c.req.param("id");
  const count  = Math.min(10, Math.max(2, parseInt(c.req.query("count") ?? "10", 10)));

  const deck = await prisma.deck.findFirst({
    where:  { id: deckId, userId },
    select: { id: true, subject: true },
  });
  if (!deck) return c.json({ message: "Deck not found" }, 404);

  const allCards = await prisma.card.findMany({
    where:  { deckId },
    select: { front: true, back: true },
    take:   50,
  });

  if (allCards.length < 2) {
    return c.json(
      { message: "Il faut au moins 2 cartes dans le deck pour générer un quiz." },
      422
    );
  }

  // Mélange + échantillonnage
  const sampled = [...allCards]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(count, allCards.length));

  const questions = await generateQuiz(sampled, deck.subject ?? undefined);

  return c.json({ questions, deckId });
});

// ─── POST /decks/:id/quiz/submit ──────────────────────────────────────────────
// Enregistre les résultats du quiz et attribue les XP.

quiz.post(
  "/:id/quiz/submit",
  zValidator(
    "json",
    z.object({
      score:  z.number().int().min(0),
      total:  z.number().int().min(1),
      timeMs: z.number().int().min(0).optional().default(0),
    })
  ),
  async (c) => {
    const userId               = c.get("userId");
    const deckId               = c.req.param("id");
    const { score, total, timeMs } = c.req.valid("json");

    const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
    if (!deck) return c.json({ message: "Deck not found" }, 404);

    // XP : 10 par bonne réponse + bonus 50 si score parfait
    const xpGained = score * 10 + (score === total ? 50 : 0);

    // Créer l'enregistrement de session
    await prisma.session.create({
      data: {
        userId,
        deckId,
        mode:         "quiz",
        endedAt:      new Date(),
        xpGained,
        cardsStudied: total,
      },
    });

    // Attribuer les XP et recalculer le niveau
    let newLevel  = 1;
    let prevLevel = 1;
    if (xpGained > 0) {
      const updated = await prisma.user.update({
        where:  { id: userId },
        data:   { xp: { increment: xpGained } },
        select: { xp: true, level: true },
      });
      prevLevel = updated.level; // level before recompute
      newLevel  = xpToLevel(updated.xp);
      if (newLevel !== updated.level) {
        await prisma.user.update({ where: { id: userId }, data: { level: newLevel } });
      }
    } else {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { level: true } });
      prevLevel = user?.level ?? 1;
      newLevel  = prevLevel;
    }

    const newStreak = await updateStreak(userId);

    return c.json({ xpGained, streak: newStreak, level: newLevel, prevLevel, leveledUp: newLevel > prevLevel });
  }
);

export default quiz;
