import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { redis } from "../lib/redis.js";
import { ingestText, ingestPDF, ingestURL } from "../services/ingest.js";
import type { GenerationOptions } from "../services/ai.js";

const imports = new Hono<{ Variables: { userId: string } }>();

imports.use("*", authMiddleware);

// ─── Schéma des options de génération (réutilisé dans plusieurs routes) ────────

const generationOptionsSchema = z.object({
  cardCount: z
    .union([z.literal(5), z.literal(10), z.literal(15), z.literal(20), z.literal("auto")])
    .optional(),
  difficulty: z
    .enum(["beginner", "intermediate", "advanced"])
    .optional(),
  cardTypePreference: z
    .enum(["mixed", "definition", "application", "example", "comparison"])
    .optional(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getDeckOrFail(deckId: string, userId: string) {
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  return deck ?? null;
}

async function enqueueGeneration(
  deckId:       string,
  userId:       string,
  cleanText:    string,
  subject?:     string,
  options:      GenerationOptions = {}
) {
  await prisma.deck.update({
    where: { id: deckId },
    data: {
      generationStatus:   "processing",
      generationProgress: 0,
      generationError:    null,
      sourceContent:      cleanText.slice(0, 100_000), // Stocké pour la régénération
      updatedAt:          new Date(),
    },
  });

  if (redis) {
    const { cardGenerationQueue } = await import("../jobs/cardGenerationQueue.js");
    await cardGenerationQueue.add("generate-cards", { deckId, userId, content: cleanText, subject, options }, { priority: 1 });
  }
}

// ─── POST /decks/:id/import/text ──────────────────────────────────────────────

imports.post(
  "/:id/import/text",
  zValidator(
    "json",
    z.object({
      content: z.string().min(50, "Le texte doit contenir au moins 50 caractères.").max(100_000),
      subject: z.string().max(80).optional(),
      options: generationOptionsSchema.optional(),
    })
  ),
  async (c) => {
    const userId = c.get("userId");
    const deckId = c.req.param("id");
    const { content, subject, options = {} } = c.req.valid("json");

    const deck = await getDeckOrFail(deckId, userId);
    if (!deck) return c.json({ message: "Deck not found" }, 404);

    if (deck.generationStatus === "processing") {
      return c.json({ message: "Une génération est déjà en cours pour ce deck." }, 409);
    }

    let result;
    try {
      result = ingestText(content);
    } catch (err) {
      return c.json({ message: err instanceof Error ? err.message : "Erreur d'ingestion." }, 422);
    }

    if (deck.sourceType === "manual") {
      await prisma.deck.update({ where: { id: deckId }, data: { sourceType: "text" } });
    }

    await enqueueGeneration(deckId, userId, result.cleanText, subject ?? deck.subject ?? undefined, options);

    return c.json({
      status:          "processing",
      estimatedTokens: result.metadata.estimatedTokens,
      charCount:       result.metadata.charCount,
    });
  }
);

// ─── POST /decks/:id/import/pdf ───────────────────────────────────────────────

imports.post("/:id/import/pdf", async (c) => {
  const userId = c.get("userId");
  const deckId = c.req.param("id");

  const deck = await getDeckOrFail(deckId, userId);
  if (!deck) return c.json({ message: "Deck not found" }, 404);

  if (deck.generationStatus === "processing") {
    return c.json({ message: "Une génération est déjà en cours pour ce deck." }, 409);
  }

  let body: Record<string, string | File>;
  try {
    body = await c.req.parseBody();
  } catch {
    return c.json({ message: "Corps de requête invalide. Utilise multipart/form-data." }, 400);
  }

  const file = body["file"];
  if (!file || typeof file === "string") {
    return c.json({ message: "Aucun fichier reçu. Envoie le PDF avec le champ 'file'." }, 400);
  }

  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    return c.json({ message: "Seuls les fichiers PDF sont acceptés." }, 415);
  }

  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return c.json({ message: "Le fichier dépasse la limite de 10 Mo." }, 413);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let result;
  try {
    result = await ingestPDF(buffer);
  } catch (err) {
    return c.json({ message: err instanceof Error ? err.message : "Erreur de lecture PDF." }, 422);
  }

  // Lire les options depuis le champ texte du formulaire (multipart ne supporte pas JSON natif)
  let options: GenerationOptions = {};
  const rawOptions = body["options"];
  if (rawOptions && typeof rawOptions === "string") {
    try { options = JSON.parse(rawOptions); } catch { /* ignore options invalides */ }
  }

  await prisma.deck.update({ where: { id: deckId }, data: { sourceType: "pdf" } });

  await enqueueGeneration(deckId, userId, result.cleanText, deck.subject ?? undefined, options);

  return c.json({
    status:    "processing",
    pageCount: result.metadata.pageCount,
    charCount: result.metadata.charCount,
    pdfTitle:  result.metadata.title,
  });
});

// ─── POST /decks/:id/import/url ───────────────────────────────────────────────

imports.post(
  "/:id/import/url",
  zValidator(
    "json",
    z.object({
      url:     z.string().url("URL invalide."),
      subject: z.string().max(80).optional(),
      options: generationOptionsSchema.optional(),
    })
  ),
  async (c) => {
    const userId = c.get("userId");
    const deckId = c.req.param("id");
    const { url, subject, options = {} } = c.req.valid("json");

    const deck = await getDeckOrFail(deckId, userId);
    if (!deck) return c.json({ message: "Deck not found" }, 404);

    if (deck.generationStatus === "processing") {
      return c.json({ message: "Une génération est déjà en cours pour ce deck." }, 409);
    }

    let result;
    try {
      result = await ingestURL(url);
    } catch (err) {
      return c.json({ message: err instanceof Error ? err.message : "Erreur lors du scraping." }, 422);
    }

    const titleUpdate =
      result.metadata.title && deck.title.trim().length === 0
        ? { title: result.metadata.title.slice(0, 120) }
        : {};

    await prisma.deck.update({
      where: { id: deckId },
      data: { sourceType: "url", ...titleUpdate },
    });

    await enqueueGeneration(deckId, userId, result.cleanText, subject ?? deck.subject ?? undefined, options);

    return c.json({
      status:    "processing",
      pageTitle: result.metadata.title,
      charCount: result.metadata.charCount,
    });
  }
);

export default imports;
