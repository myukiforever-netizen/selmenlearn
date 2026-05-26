"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useApiClient } from "@/hooks/useApiClient";
import { useUserStore } from "@/stores/useUserStore";
import type { DueCard, ReviewResponse, RatingDistribution } from "@/types";

// ─── Types internes ───────────────────────────────────────────────────────────

type SessionStatus = "loading" | "empty" | "active" | "complete";

interface SessionResult {
  cardId:   string;
  rating:   0 | 1 | 2 | 3;
  xpGained: number;
}

interface StudySessionState {
  status:      SessionStatus;
  cards:       DueCard[];
  currentIdx:  number;
  flipped:     boolean;
  feedback:    "correct" | "incorrect" | null;
  shake:       boolean;
  sessionId:   string | null;
  results:     SessionResult[];
  totalXp:     number;
  streak:      number;
  isRating:    boolean;
  lastXpGained: number;
  leveledUp:   boolean;
  newLevel:    number;
}

const INITIAL: StudySessionState = {
  status:       "loading",
  cards:        [],
  currentIdx:   0,
  flipped:      false,
  feedback:     null,
  shake:        false,
  sessionId:    null,
  results:      [],
  totalXp:      0,
  streak:       0,
  isRating:     false,
  lastXpGained: 0,
  leveledUp:    false,
  newLevel:     1,
};

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useStudySession(deckId: string) {
  const api    = useApiClient();
  const apiRef = useRef(api);
  apiRef.current = api;

  const { addXP, setLevel } = useUserStore();

  const [state, setState] = useState<StudySessionState>(INITIAL);
  const cardStartTime = useRef(Date.now());

  // ── Initialisation au montage ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const dueCards = await apiRef.current.get<DueCard[]>(`/decks/${deckId}/due`);
        if (cancelled) return;

        if (!dueCards.length) {
          setState((s) => ({ ...s, status: "empty" }));
          return;
        }

        const session = await apiRef.current.post<{ id: string }>("/sessions", {
          deckId,
          mode: "sprint",
        });
        if (cancelled) return;

        cardStartTime.current = Date.now();
        setState((s) => ({
          ...s,
          status:    "active",
          cards:     dueCards,
          sessionId: session.id,
        }));
      } catch {
        setState((s) => ({ ...s, status: "empty" }));
      }
    }

    init();
    return () => { cancelled = true; };
  }, [deckId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Retourner la carte ───────────────────────────────────────────────────────
  const flip = useCallback(() => {
    setState((s) => ({ ...s, flipped: true }));
  }, []);

  // ── Évaluer la carte et passer à la suivante ─────────────────────────────────
  const rate = useCallback(
    async (rating: 0 | 1 | 2 | 3) => {
      if (state.isRating) return;
      setState((s) => ({ ...s, isRating: true }));

      const currentCard = state.cards[state.currentIdx];
      if (!currentCard) return;

      const timeMs    = Date.now() - cardStartTime.current;
      const isCorrect = rating >= 2;

      setState((s) => ({
        ...s,
        feedback: isCorrect ? "correct" : "incorrect",
        shake:    !isCorrect,
      }));

      let xpGained  = 0;
      let newStreak = state.streak;
      let newLevel  = state.newLevel;
      let didLevelUp = false;

      try {
        const result = await apiRef.current.post<ReviewResponse>(
          `/cards/${currentCard.id}/review`,
          { rating, timeMs, sessionId: state.sessionId }
        );
        xpGained  = result.xpGained;
        newStreak = result.streak;
        newLevel  = result.level;
        didLevelUp = result.leveledUp;

        // Sync Zustand store immediately so SessionComplete XP bar is accurate
        if (xpGained > 0) {
          addXP(xpGained);
          setLevel(newLevel);
        }
      } catch {
        // Continue even if review fails
      }

      await new Promise<void>((resolve) => setTimeout(resolve, 600));

      const isLastCard = state.currentIdx + 1 >= state.cards.length;

      if (isLastCard) {
        if (state.sessionId) {
          apiRef.current.patch(`/sessions/${state.sessionId}/end`, {}).catch(() => {});
        }
        setState((s) => ({
          ...s,
          feedback:     null,
          shake:        false,
          isRating:     false,
          lastXpGained: xpGained,
          results:      [...s.results, { cardId: currentCard.id, rating, xpGained }],
          totalXp:      s.totalXp + xpGained,
          streak:       newStreak,
          // Sticky: once leveled-up during session, keep the flag
          leveledUp:    s.leveledUp || didLevelUp,
          newLevel:     didLevelUp ? newLevel : s.newLevel,
          status:       "complete",
        }));
      } else {
        cardStartTime.current = Date.now();
        setState((s) => ({
          ...s,
          feedback:     null,
          shake:        false,
          isRating:     false,
          flipped:      false,
          currentIdx:   s.currentIdx + 1,
          lastXpGained: xpGained,
          results:      [...s.results, { cardId: currentCard.id, rating, xpGained }],
          totalXp:      s.totalXp + xpGained,
          streak:       newStreak,
          leveledUp:    s.leveledUp || didLevelUp,
          newLevel:     didLevelUp ? newLevel : s.newLevel,
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.cards, state.currentIdx, state.sessionId, state.streak, state.isRating, state.leveledUp, state.newLevel, addXP, setLevel]
  );

  // ── Recommencer avec les cartes "À revoir" ───────────────────────────────────
  const restart = useCallback(() => {
    setState((s) => {
      const againCards = s.results
        .filter((r) => r.rating === 0)
        .map((r) => s.cards.find((c) => c.id === r.cardId))
        .filter((c): c is DueCard => c !== undefined);

      if (!againCards.length) return s;

      cardStartTime.current = Date.now();
      return {
        ...s,
        cards:        againCards,
        currentIdx:   0,
        flipped:      false,
        feedback:     null,
        shake:        false,
        results:      [],
        isRating:     false,
        leveledUp:    false,
        lastXpGained: 0,
        status:       "active",
      };
    });
  }, []);

  // ── Distribution des notes ───────────────────────────────────────────────────
  const ratingDistribution: RatingDistribution = {
    again: state.results.filter((r) => r.rating === 0).length,
    hard:  state.results.filter((r) => r.rating === 1).length,
    good:  state.results.filter((r) => r.rating === 2).length,
    easy:  state.results.filter((r) => r.rating === 3).length,
  };

  return {
    status:          state.status,
    currentCard:     state.cards[state.currentIdx] ?? null,
    currentIdx:      state.currentIdx,
    totalCards:      state.cards.length,
    flipped:         state.flipped,
    feedback:        state.feedback,
    shake:           state.shake,
    totalXp:         state.totalXp,
    streak:          state.streak,
    isRating:        state.isRating,
    lastXpGained:    state.lastXpGained,
    leveledUp:       state.leveledUp,
    newLevel:        state.newLevel,
    ratingDistribution,
    flip,
    rate,
    restart,
  };
}
