import { prisma } from "../lib/prisma.js";

export interface BadgeDef {
  id:          string;
  name:        string;
  description: string;
  emoji:       string;
  category:    "streak" | "cards" | "level" | "quiz" | "deck";
  rarity:      "common" | "rare" | "epic" | "legendary";
}

export const BADGES: BadgeDef[] = [
  // ── Streak ─────────────────────────────────────────────────────────────────
  { id: "streak_1",    name: "Premier Pas",      description: "1 jour de série",         emoji: "🌱", category: "streak", rarity: "common"    },
  { id: "streak_3",    name: "En Route",          description: "3 jours consécutifs",     emoji: "🔥", category: "streak", rarity: "common"    },
  { id: "streak_7",    name: "Semaine Parfaite",  description: "7 jours consécutifs",     emoji: "⚡", category: "streak", rarity: "rare"      },
  { id: "streak_14",   name: "Régulier",          description: "14 jours consécutifs",    emoji: "💪", category: "streak", rarity: "rare"      },
  { id: "streak_30",   name: "Marathonien",       description: "30 jours consécutifs",    emoji: "🏆", category: "streak", rarity: "epic"      },
  // ── Cards reviewed ─────────────────────────────────────────────────────────
  { id: "cards_10",    name: "Débutant",          description: "10 cartes révisées",      emoji: "📚", category: "cards",  rarity: "common"    },
  { id: "cards_50",    name: "Studieux",          description: "50 cartes révisées",      emoji: "📖", category: "cards",  rarity: "common"    },
  { id: "cards_100",   name: "Centurion",         description: "100 cartes révisées",     emoji: "🎯", category: "cards",  rarity: "rare"      },
  { id: "cards_500",   name: "Encyclopédiste",    description: "500 cartes révisées",     emoji: "🧠", category: "cards",  rarity: "epic"      },
  { id: "cards_1000",  name: "Bibliothécaire",    description: "1 000 cartes révisées",   emoji: "🏛️", category: "cards",  rarity: "legendary" },
  // ── Level ──────────────────────────────────────────────────────────────────
  { id: "level_5",     name: "Apprenti",          description: "Atteindre le niveau 5",   emoji: "⭐", category: "level",  rarity: "common"    },
  { id: "level_10",    name: "Érudit",            description: "Atteindre le niveau 10",  emoji: "🌟", category: "level",  rarity: "rare"      },
  { id: "level_15",    name: "Expert",            description: "Atteindre le niveau 15",  emoji: "💎", category: "level",  rarity: "epic"      },
  { id: "level_20",    name: "Maître",            description: "Atteindre le niveau 20",  emoji: "👑", category: "level",  rarity: "legendary" },
  // ── Quiz ───────────────────────────────────────────────────────────────────
  { id: "quiz_first",  name: "Testeur",           description: "Compléter un quiz",       emoji: "🎮", category: "quiz",   rarity: "common"    },
  { id: "quiz_perfect",name: "Score Parfait",     description: "100% à un quiz",          emoji: "🌠", category: "quiz",   rarity: "rare"      },
  { id: "quiz_10",     name: "Quiz Master",       description: "10 quiz complétés",       emoji: "🏅", category: "quiz",   rarity: "epic"      },
  // ── Decks ──────────────────────────────────────────────────────────────────
  { id: "deck_first",  name: "Créateur",          description: "Créer son premier deck",  emoji: "✏️", category: "deck",   rarity: "common"    },
  { id: "deck_3",      name: "Collectionneur",    description: "Avoir 3 decks",           emoji: "🗂️", category: "deck",   rarity: "common"    },
  { id: "deck_10",     name: "Bibliothèque",      description: "Avoir 10 decks",          emoji: "📦", category: "deck",   rarity: "rare"      },
];

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const existing = await prisma.achievement.findMany({
    where:  { userId },
    select: { badgeId: true },
  });
  const unlockedIds = new Set(existing.map((a) => a.badgeId));

  const pending = BADGES.filter((b) => !unlockedIds.has(b.id));
  if (pending.length === 0) return [];

  const [user, cardsReviewed, quizSessions, deckCount] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: userId },
      select: { streak: true, level: true },
    }),
    prisma.sessionAnswer.count({ where: { session: { userId } } }),
    prisma.session.findMany({
      where:  { userId, mode: "quiz" },
      select: { xpGained: true, cardsStudied: true },
    }),
    prisma.deck.count({ where: { userId } }),
  ]);

  if (!user) return [];

  const quizCount     = quizSessions.length;
  const perfectQuizzes = quizSessions.filter(
    (s) => s.cardsStudied > 0 && s.xpGained === s.cardsStudied * 10 + 50
  ).length;

  const newIds: string[] = [];

  for (const badge of pending) {
    let earned = false;
    switch (badge.id) {
      case "streak_1":    earned = user.streak >= 1;    break;
      case "streak_3":    earned = user.streak >= 3;    break;
      case "streak_7":    earned = user.streak >= 7;    break;
      case "streak_14":   earned = user.streak >= 14;   break;
      case "streak_30":   earned = user.streak >= 30;   break;
      case "cards_10":    earned = cardsReviewed >= 10;   break;
      case "cards_50":    earned = cardsReviewed >= 50;   break;
      case "cards_100":   earned = cardsReviewed >= 100;  break;
      case "cards_500":   earned = cardsReviewed >= 500;  break;
      case "cards_1000":  earned = cardsReviewed >= 1000; break;
      case "level_5":     earned = user.level >= 5;    break;
      case "level_10":    earned = user.level >= 10;   break;
      case "level_15":    earned = user.level >= 15;   break;
      case "level_20":    earned = user.level >= 20;   break;
      case "quiz_first":  earned = quizCount >= 1;     break;
      case "quiz_perfect":earned = perfectQuizzes >= 1; break;
      case "quiz_10":     earned = quizCount >= 10;    break;
      case "deck_first":  earned = deckCount >= 1;     break;
      case "deck_3":      earned = deckCount >= 3;     break;
      case "deck_10":     earned = deckCount >= 10;    break;
    }
    if (earned) newIds.push(badge.id);
  }

  if (newIds.length > 0) {
    await prisma.achievement.createMany({
      data:           newIds.map((badgeId) => ({ userId, badgeId })),
      skipDuplicates: true,
    });
  }

  return newIds;
}
