import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { redis } from "../lib/redis.js";
const getQueue = async () => redis ? (await import("../jobs/cardGenerationQueue.js")).cardGenerationQueue : null;
import { getCachedDueCount, setCachedDueCount } from "../services/scheduling.js";
import { checkAndAwardBadges } from "../services/badges.js";

const decks = new Hono<{ Variables: { userId: string } }>();

decks.use("*", authMiddleware);

const createDeckSchema = z.object({
  title:       z.string().min(1).max(120),
  description: z.string().max(300).optional(),
  subject:     z.string().max(80).optional(),
  sourceType:  z.enum(["manual", "text", "pdf", "url"]).default("manual"),
  content:     z.string().max(50000).optional(),
});

// GET /decks — liste des decks de l'utilisateur
decks.get("/", async (c) => {
  const userId = c.get("userId");
  const rawDecks = await prisma.deck.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { cards: true } },
    },
  });

  // Due count: try Redis cache first, fall back to DB + cache result
  const now = new Date();
  const decksWithDue = await Promise.all(
    rawDecks.map(async (deck) => {
      let dueCards = await getCachedDueCount(userId, deck.id).catch(() => null);
      if (dueCards === null) {
        dueCards = await prisma.cardReview.count({
          where: { userId, card: { deckId: deck.id }, nextReview: { lte: now } },
        });
        setCachedDueCount(userId, deck.id, dueCards).catch(() => {});
      }
      return { ...deck, _count: { ...deck._count, dueCards } };
    })
  );

  return c.json(decksWithDue);
});

// GET /decks/:id — détail d'un deck avec ses cartes
decks.get("/:id", async (c) => {
  const userId = c.get("userId");
  const deckId = c.req.param("id");

  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId },
    include: {
      cards: { orderBy: { id: "asc" } },
      _count: { select: { cards: true } },
    },
  });

  if (!deck) return c.json({ message: "Deck not found" }, 404);

  let dueCards = await getCachedDueCount(userId, deckId).catch(() => null);
  if (dueCards === null) {
    dueCards = await prisma.cardReview.count({
      where: { userId, card: { deckId }, nextReview: { lte: new Date() } },
    });
    setCachedDueCount(userId, deckId, dueCards).catch(() => {});
  }

  return c.json({ ...deck, _count: { ...deck._count, dueCards } });
});

// POST /decks — créer un deck et lancer la génération si contenu fourni
decks.post("/", zValidator("json", createDeckSchema), async (c) => {
  const userId = c.get("userId");
  const { title, description, subject, sourceType, content } = c.req.valid("json");

  const deck = await prisma.deck.create({
    data: { userId, title, description, subject, sourceType },
  });

  if (content && content.trim().length > 0) {
    const queue = await getQueue();
    if (queue) await queue.add("generate-cards", { deckId: deck.id, userId, content, subject });
  }

  // Fire-and-forget badge check (deck_first, deck_3, deck_10)
  checkAndAwardBadges(userId).catch(() => {});

  return c.json(deck, 201);
});

// PATCH /decks/:id — mettre à jour titre/description
decks.patch(
  "/:id",
  zValidator("json", createDeckSchema.partial()),
  async (c) => {
    const userId = c.get("userId");
    const deckId = c.req.param("id");
    const data = c.req.valid("json");

    const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
    if (!deck) return c.json({ message: "Deck not found" }, 404);

    const updated = await prisma.deck.update({
      where: { id: deckId },
      data: { ...data, updatedAt: new Date() },
    });
    return c.json(updated);
  }
);

// GET /decks/:id/status — état de la génération (polling)
decks.get("/:id/status", async (c) => {
  const userId = c.get("userId");
  const deckId = c.req.param("id");

  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId },
    select: {
      id:                 true,
      generationStatus:   true,
      generationProgress: true,
      generationError:    true,
      _count: { select: { cards: true } },
    },
  });

  if (!deck) return c.json({ message: "Deck not found" }, 404);

  return c.json({
    deckId:    deck.id,
    status:    deck.generationStatus,   // idle | processing | done | error
    progress:  deck.generationProgress, // 0-100
    cardCount: deck._count.cards,
    error:     deck.generationError,
  });
});

// POST /decks/:id/regenerate — relance la génération avec de nouvelles options
const regenerateSchema = z.object({
  deleteExisting: z.boolean().default(true),
  options: z
    .object({
      cardCount: z
        .union([z.literal(5), z.literal(10), z.literal(15), z.literal(20), z.literal("auto")])
        .optional(),
      difficulty:         z.enum(["beginner", "intermediate", "advanced"]).optional(),
      cardTypePreference: z.enum(["mixed", "definition", "application", "example", "comparison"]).optional(),
    })
    .optional(),
});

decks.post("/:id/regenerate", zValidator("json", regenerateSchema), async (c) => {
  const userId = c.get("userId");
  const deckId = c.req.param("id");
  const { deleteExisting, options = {} } = c.req.valid("json");

  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) return c.json({ message: "Deck not found" }, 404);

  if (deck.generationStatus === "processing") {
    return c.json({ message: "Une génération est déjà en cours pour ce deck." }, 409);
  }

  if (!deck.sourceContent) {
    return c.json(
      { message: "Aucun contenu source disponible pour régénérer. Réimporte un fichier ou du texte." },
      422
    );
  }

  if (deleteExisting) {
    await prisma.card.deleteMany({ where: { deckId } });
  }

  await prisma.deck.update({
    where: { id: deckId },
    data: {
      generationStatus:   "processing",
      generationProgress: 0,
      generationError:    null,
      updatedAt:          new Date(),
    },
  });

  const queue = await getQueue();
  if (queue) {
    await queue.add("generate-cards", { deckId, userId, content: deck.sourceContent, subject: deck.subject ?? undefined, options }, { priority: 1 });
  }

  return c.json({ status: "processing" });
});

// DELETE /decks/:id
decks.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const deckId = c.req.param("id");

  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) return c.json({ message: "Deck not found" }, 404);

  await prisma.deck.delete({ where: { id: deckId } });
  return c.body(null, 204);
});

export default decks;
