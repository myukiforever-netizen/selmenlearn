import "dotenv/config";

process.on("unhandledRejection", (reason) => {
  console.error("[App] Unhandled rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[App] Uncaught exception:", err);
});

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import usersRouter  from "./routes/users.js";
import decksRouter  from "./routes/decks.js";
import cardsRouter  from "./routes/cards.js";
import importsRouter from "./routes/imports.js";
import quizRouter   from "./routes/quiz.js";
import seedRouter   from "./routes/seed.js";

// BullMQ worker — optional, disabled when ANTHROPIC_API_KEY absent
if (process.env.REDIS_URL) {
  import("./jobs/cardGenerationQueue.js").catch((err) => {
    console.error("[BullMQ] Failed to init worker:", err.message);
  });
}

const app = new Hono();

app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      process.env.FRONTEND_URL ?? "http://localhost:3000",
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.get("/health", (c) => c.json({ status: "ok", ts: new Date().toISOString() }));

app.route("/users",   usersRouter);
app.route("/decks",   decksRouter);
app.route("/decks",   quizRouter);
app.route("/decks",   importsRouter);
app.route("/",        cardsRouter);
app.route("/seed",    seedRouter);

app.notFound((c) => c.json({ message: "Not found" }, 404));
app.onError((err, c) => {
  console.error("[Error]", err);
  return c.json({ message: err.message ?? "Internal server error" }, 500);
});

const PORT = parseInt(process.env.PORT ?? "4000", 10);

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`\n🚀 SelmenLearn API running on port ${PORT}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV ?? "development"}`);
  console.log(`   REDIS_URL set: ${!!process.env.REDIS_URL}`);
});
