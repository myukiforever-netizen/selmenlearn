import { Queue, Worker } from "bullmq";
import { redis } from "../lib/redis.js";
import { prisma } from "../lib/prisma.js";
import { generateFlashcards, splitIntoChunks, GenerationOptions } from "../services/ai.js";

export const cardGenerationQueue = new Queue("card-generation", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: { age: 3600 },
    removeOnFail:     { age: 86400 },
  },
});

// ─── Helpers de statut ────────────────────────────────────────────────────────

async function setStatus(
  deckId:   string,
  status:   "processing" | "done" | "error",
  progress: number,
  error?:   string
) {
  await prisma.deck.update({
    where: { id: deckId },
    data: {
      generationStatus:   status,
      generationProgress: progress,
      generationError:    error ?? null,
      updatedAt:          new Date(),
    },
  });
}

// ─── Worker ───────────────────────────────────────────────────────────────────

export const cardGenerationWorker = new Worker(
  "card-generation",
  async (job) => {
    const { deckId, userId, content, subject, options = {} } = job.data as {
      deckId:    string;
      userId:    string;
      content:   string;
      subject?:  string;
      options?:  GenerationOptions;
    };

    console.log(`[Worker] Starting deck ${deckId} (options: ${JSON.stringify(options)})`);

    const deck = await prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) {
      console.warn(`[Worker] Deck ${deckId} not found — aborting`);
      return;
    }

    const chunks = splitIntoChunks(content, 500);
    const total  = chunks.length;
    console.log(`[Worker] ${total} chunk(s) to process`);

    // Persister les options et marquer 0%
    await prisma.deck.update({
      where: { id: deckId },
      data: {
        generationStatus:   "processing",
        generationProgress: 0,
        generationError:    null,
        generationOptions:  Object.keys(options).length > 0 ? JSON.stringify(options) : null,
        updatedAt:          new Date(),
      },
    });

    let totalCardsCreated = 0;

    for (let i = 0; i < total; i++) {
      const chunk = chunks[i];

      try {
        const generatedCards = await generateFlashcards(chunk, subject, options);

        if (generatedCards.length > 0) {
          await prisma.$transaction(
            generatedCards.map((card) =>
              prisma.card.create({
                data: {
                  deckId,
                  front:    card.front,
                  back:     card.back,
                  cardType: card.cardType,
                  reviews: {
                    create: {
                      userId,
                      nextReview: new Date(),
                    },
                  },
                },
              })
            )
          );
          totalCardsCreated += generatedCards.length;
        }

        const progress = Math.round(((i + 1) / total) * 98) + 1;
        await setStatus(deckId, "processing", progress);

        console.log(
          `[Worker] Chunk ${i + 1}/${total} → ${generatedCards.length} cards (total: ${totalCardsCreated})`
        );

        if (i < total - 1) {
          await new Promise((r) => setTimeout(r, 300));
        }
      } catch (err) {
        console.error(`[Worker] Error on chunk ${i + 1}:`, err);
        throw err;
      }
    }

    await setStatus(deckId, "done", 100);
    console.log(`[Worker] Done — deck ${deckId}, ${totalCardsCreated} cards total`);
  },
  { connection: redis, concurrency: 3 }
);

// ─── Événements worker ────────────────────────────────────────────────────────

cardGenerationWorker.on("failed", async (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed permanently:`, err.message);

  if (job?.data?.deckId) {
    await setStatus(
      job.data.deckId,
      "error",
      0,
      `Échec de la génération : ${err.message}`
    ).catch(() => {});
  }
});

cardGenerationWorker.on("error", (err) => {
  console.error("[Worker] Uncaught error:", err.message);
});
