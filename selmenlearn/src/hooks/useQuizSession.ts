"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useApiClient } from "@/hooks/useApiClient";
import { useUserStore } from "@/stores/useUserStore";
import type { QuizQuestion, QuizSessionResult, QuizSubmitResponse } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuizStatus = "loading" | "error" | "empty" | "active" | "complete";

interface QuizState {
  status:      QuizStatus;
  questions:   QuizQuestion[];
  currentIdx:  number;
  selectedIdx: number | null;
  isAnswered:  boolean;
  results:     QuizSessionResult[];
  xpGained:    number;
  streak:      number;
  quizStartMs: number;
  errorMsg:    string | null;
  leveledUp:   boolean;
  newLevel:    number;
}

const INITIAL: QuizState = {
  status:      "loading",
  questions:   [],
  currentIdx:  0,
  selectedIdx: null,
  isAnswered:  false,
  results:     [],
  xpGained:    0,
  streak:      0,
  quizStartMs: 0,
  errorMsg:    null,
  leveledUp:   false,
  newLevel:    1,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQuizSession(deckId: string) {
  const api    = useApiClient();
  const apiRef = useRef(api);
  apiRef.current = api;

  const { addXP, setLevel } = useUserStore();

  const [state, setState] = useState<QuizState>(INITIAL);

  // ── Chargement des questions ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState(INITIAL);
      try {
        const data = await apiRef.current.get<{ questions: QuizQuestion[] }>(
          `/decks/${deckId}/quiz?count=10`
        );
        if (cancelled) return;

        if (!data.questions?.length) {
          setState((s) => ({ ...s, status: "empty" }));
          return;
        }

        setState((s) => ({
          ...s,
          status:      "active",
          questions:   data.questions,
          quizStartMs: Date.now(),
        }));
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Erreur réseau";
        setState((s) => ({ ...s, status: "error", errorMsg: msg }));
      }
    }

    load();
    return () => { cancelled = true; };
  }, [deckId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sélectionner une réponse ──────────────────────────────────────────────────
  const selectAnswer = useCallback((optionIdx: number) => {
    setState((s) => {
      if (s.isAnswered) return s;

      const question = s.questions[s.currentIdx];
      if (!question)  return s;

      const isCorrect = question.options[optionIdx]?.isCorrect ?? false;

      return {
        ...s,
        selectedIdx: optionIdx,
        isAnswered:  true,
        results: [
          ...s.results,
          { questionId: question.id, selectedIdx: optionIdx, isCorrect },
        ],
      };
    });
  }, []);

  // ── Passer à la question suivante ou terminer ─────────────────────────────────
  const nextQuestion = useCallback(async () => {
    setState((s) => {
      const isLast = s.currentIdx + 1 >= s.questions.length;

      if (!isLast) {
        return {
          ...s,
          currentIdx:  s.currentIdx + 1,
          selectedIdx: null,
          isAnswered:  false,
        };
      }

      return { ...s, status: "complete" as QuizStatus };
    });
  }, []);

  // ── Submit automatique quand on passe à "complete" ────────────────────────────
  useEffect(() => {
    if (state.status !== "complete") return;

    const totalCorrect = state.results.filter((r) => r.isCorrect).length;
    const totalMs      = Date.now() - state.quizStartMs;

    apiRef.current
      .post<QuizSubmitResponse>(`/decks/${deckId}/quiz/submit`, {
        score:  totalCorrect,
        total:  state.results.length,
        timeMs: totalMs,
      })
      .then((res) => {
        // Sync Zustand store so QuizComplete XP bar is up-to-date
        if (res.xpGained > 0) {
          addXP(res.xpGained);
          setLevel(res.level);
        }
        setState((s) => ({
          ...s,
          xpGained:  res.xpGained,
          streak:    res.streak,
          leveledUp: res.leveledUp,
          newLevel:  res.level,
        }));
      })
      .catch(() => {});
  }, [state.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Recommencer (recharge les questions) ─────────────────────────────────────
  const restart = useCallback(() => {
    let cancelled = false;

    setState(INITIAL);

    apiRef.current
      .get<{ questions: QuizQuestion[] }>(`/decks/${deckId}/quiz?count=10`)
      .then((data) => {
        if (cancelled) return;
        if (!data.questions?.length) {
          setState((s) => ({ ...s, status: "empty" }));
          return;
        }
        setState((s) => ({
          ...s,
          status:      "active",
          questions:   data.questions,
          quizStartMs: Date.now(),
        }));
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, status: "error", errorMsg: "Erreur réseau" }));
      });

    return () => { cancelled = true; };
  }, [deckId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Dérivées exposées ────────────────────────────────────────────────────────

  const currentQuestion = state.questions[state.currentIdx] ?? null;
  const score           = state.results.filter((r) => r.isCorrect).length;

  return {
    status:          state.status,
    currentQuestion,
    currentIdx:      state.currentIdx,
    totalQuestions:  state.questions.length,
    selectedIdx:     state.selectedIdx,
    isAnswered:      state.isAnswered,
    score,
    xpGained:        state.xpGained,
    streak:          state.streak,
    errorMsg:        state.errorMsg,
    leveledUp:       state.leveledUp,
    newLevel:        state.newLevel,
    selectAnswer,
    nextQuestion,
    restart,
  };
}
