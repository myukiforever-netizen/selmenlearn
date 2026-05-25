"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export type GenerationStatus = "idle" | "processing" | "done" | "error";

export interface DeckStatusResponse {
  deckId:    string;
  status:    GenerationStatus;
  progress:  number;   // 0-100
  cardCount: number;
  error:     string | null;
}

export function useDeckStatus(deckId: string, enabled = true) {
  return useQuery<DeckStatusResponse>({
    queryKey: ["deck-status", deckId],
    queryFn:  () => apiClient.get<DeckStatusResponse>(`/decks/${deckId}/status`),
    enabled,

    // Rafraîchissement toutes les 2s pendant le traitement, arrêt sinon
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "processing") return 2000;
      return false;
    },

    // Garder la dernière donnée visible pendant le refetch (pas de flash)
    placeholderData: (prev) => prev,
  });
}
