export interface CardState {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export interface SM2Result extends CardState {
  nextReview: Date;
}

/**
 * Algorithme SuperMemo 2 (SM-2)
 * rating — 0=Again, 1=Hard, 2=Good, 3=Easy
 */
export function sm2(state: CardState, rating: 0 | 1 | 2 | 3): SM2Result {
  let { easeFactor, interval, repetitions } = state;

  if (rating < 2) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // q = qualité de la réponse (échelle 1-5 interne)
  const q = [1, 3, 4, 5][rating];
  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  nextReview.setHours(6, 0, 0, 0); // Révision à 6h du matin

  return { easeFactor, interval, repetitions, nextReview };
}
