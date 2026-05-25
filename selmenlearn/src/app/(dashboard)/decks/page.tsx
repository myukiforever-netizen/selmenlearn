"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeckGrid } from "@/components/deck/DeckGrid";
import { EmptyDecksState } from "@/components/deck/EmptyDecksState";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { useApiClient } from "@/hooks/useApiClient";
import type { Deck } from "@/types";

export default function DecksPage() {
  const api = useApiClient();

  const { data: decks = [], isLoading } = useQuery({
    queryKey:  ["decks"],
    queryFn:   () => api.get<Deck[]>("/decks"),
    staleTime: 30_000,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Stats bar ── */}
      <StatsBar />

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Mes Decks
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {isLoading
              ? "Chargement…"
              : decks.length === 0
              ? "Crée ton premier deck pour commencer"
              : `${decks.length} deck${decks.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/dashboard/decks/new"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600
                     text-white px-4 py-2.5 rounded-xl font-medium text-sm
                     transition-all hover:-translate-y-0.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouveau deck
        </Link>
      </div>

      {/* ── Deck grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : decks.length === 0 ? (
        <EmptyDecksState />
      ) : (
        <DeckGrid decks={decks} />
      )}
    </div>
  );
}
