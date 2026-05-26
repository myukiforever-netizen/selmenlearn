export interface GenerationOptions {
  cardCount?:          5 | 10 | 15 | 20 | "auto";
  difficulty?:         "beginner" | "intermediate" | "advanced";
  cardTypePreference?: "mixed" | "definition" | "application" | "example" | "comparison";
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  xp: number;
  level: number;
  streak: number;
  lastStudy: string | null;
  createdAt: string;
}

export interface Deck {
  id:                 string;
  userId:             string;
  title:              string;
  description:        string | null;
  subject:            string | null;
  sourceType:         "manual" | "text" | "pdf" | "url";
  generationStatus:   "idle" | "processing" | "done" | "error";
  generationProgress: number;
  generationError:    string | null;
  generationOptions?: GenerationOptions | null;
  sourceContent?:     string | null;
  createdAt:          string;
  updatedAt:          string;
  cards?:             Card[];
  _count?: {
    cards:    number;
    dueCards: number;
  };
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  cardType: "definition" | "application" | "comparison" | "example";
  reviews?: CardReview[];
}

export interface CardReview {
  id: string;
  userId: string;
  cardId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastReviewed: string | null;
}

export interface Session {
  id: string;
  userId: string;
  deckId: string;
  mode: "sprint" | "marathon" | "zen";
  startedAt: string;
  endedAt: string | null;
  xpGained: number;
  cardsStudied: number;
}

export interface SessionAnswer {
  id: string;
  sessionId: string;
  cardId: string;
  rating: 0 | 1 | 2 | 3;
  isCorrect: boolean;
  timeMs: number;
  answeredAt: string;
}

export type RatingLabel = "again" | "hard" | "good" | "easy";
export const RATING_MAP: Record<RatingLabel, 0 | 1 | 2 | 3> = {
  again: 0,
  hard:  1,
  good:  2,
  easy:  3,
};

export interface DueCard {
  id:       string;
  deckId:   string;
  front:    string;
  back:     string;
  cardType: "definition" | "application" | "comparison" | "example";
  reviews:  CardReview[];
}

export interface ReviewResponse {
  nextReview: string;
  interval:   number;
  xpGained:   number;
  streak:     number;
}

export interface RatingDistribution {
  again: number;
  hard:  number;
  good:  number;
  easy:  number;
}

export interface LevelProgress {
  level:          number;
  currentLevelXp: number;
  nextLevelXp:    number | null;
  progressPct:    number;
}

export interface UserStats {
  xp:            number;
  level:         number;
  streak:        number;
  totalCards:    number;
  dueCards:      number;
  masteredCards: number;
  levelProgress: LevelProgress;
}

export interface ActivityDay {
  date:         string; // YYYY-MM-DD
  xp:           number;
  cardsStudied: number;
  sessions:     number;
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export interface QuizOption {
  text:      string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id:          string;
  type:        "mcq" | "true_false";
  question:    string;
  options:     QuizOption[];
  explanation: string;
}

export interface QuizSessionResult {
  questionId:  string;
  selectedIdx: number;
  isCorrect:   boolean;
}

export interface QuizSubmitResponse {
  xpGained: number;
  streak:   number;
  level:    number;
}
