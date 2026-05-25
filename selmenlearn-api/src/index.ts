import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import usersRouter  from "./routes/users.js";
import decksRouter  from "./routes/decks.js";
import cardsRouter  from "./routes/cards.js";
import importsRouter from "./routes/imports.js";

// Start BullMQ worker
import "./jobs/cardGenerationQueue.js";

const app = new Hono();

// Global middleware
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

// Health check
app.get("/health", (c) => c.json({ status: "ok", ts: new Date().toISOString() }));

// Routes
app.route("/users",   usersRouter);
app.route("/decks",   decksRouter);
app.route("/decks",   importsRouter); // POST /decks/:id/import/*
app.route("/",        cardsRouter);   // /decks/:id/due  +  /cards/:id/review  +  /sessions

// 404
app.notFound((c) => c.json({ message: "Not found" }, 404));

// Global error handler
app.onError((err, c) => {
  console.error("[Error]", err);
  return c.json({ message: err.message ?? "Internal server error" }, 500);
});

const PORT = parseInt(process.env.PORT ?? "4000", 10);

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`\n🚀 SelmenLearn API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV ?? "development"}\n`);
});
