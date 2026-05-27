import { redis } from "../lib/redis.js";

// ─── Keys ─────────────────────────────────────────────────────────────────────

const scheduleKey  = (userId: string)               => `schedule:${userId}`;
const dueCountKey  = (userId: string, deckId: string) => `due:${userId}:${deckId}`;

const DUE_COUNT_TTL = 3_600; // 1 hour (counts recalculated if missing)

// ─── Sorted-set scheduling ─────────────────────────────────────────────────────

export async function scheduleCard(
  userId:     string,
  cardId:     string,
  deckId:     string,
  nextReview: Date,
): Promise<void> {
  if (!redis) return;
  await redis.zadd(scheduleKey(userId), nextReview.getTime(), `${cardId}:${deckId}`);
}

export async function removeCardFromSchedule(
  userId: string,
  cardId: string,
  deckId: string,
): Promise<void> {
  if (!redis) return;
  await redis.zrem(scheduleKey(userId), `${cardId}:${deckId}`);
}

export async function getNextReviewTime(userId: string): Promise<Date | null> {
  if (!redis) return null;
  const result = await redis.zrange(scheduleKey(userId), 0, 0, "WITHSCORES");
  if (!result || result.length < 2) return null;
  return new Date(parseFloat(result[1]));
}

export async function getDueCardIdsForDeck(
  userId:  string,
  deckId:  string,
  now:     Date = new Date(),
): Promise<string[]> {
  if (!redis) return [];
  const members = await redis.zrangebyscore(scheduleKey(userId), 0, now.getTime());
  return members
    .filter((m) => m.endsWith(`:${deckId}`))
    .map((m)    => m.slice(0, m.lastIndexOf(":")));
}

// ─── Due-count cache ───────────────────────────────────────────────────────────

export async function setCachedDueCount(
  userId:  string,
  deckId:  string,
  count:   number,
): Promise<void> {
  if (!redis) return;
  await redis.set(dueCountKey(userId, deckId), count, "EX", DUE_COUNT_TTL);
}

export async function getCachedDueCount(
  userId:  string,
  deckId:  string,
): Promise<number | null> {
  if (!redis) return null;
  const val = await redis.get(dueCountKey(userId, deckId));
  return val !== null ? parseInt(val, 10) : null;
}

export async function invalidateDueCount(
  userId:  string,
  deckId:  string,
): Promise<void> {
  if (!redis) return;
  await redis.del(dueCountKey(userId, deckId));
}
