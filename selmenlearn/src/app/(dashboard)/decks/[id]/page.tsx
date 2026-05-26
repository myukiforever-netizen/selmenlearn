"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Zap, Clock, RefreshCw, RotateCcw, Settings2, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GenerationProgress } from "@/components/deck/GenerationProgress";
import { GenerationSettings } from "@/components/deck/GenerationSettings";
import { CardList } from "@/components/deck/CardList";
import { useApiClient } from "@/hooks/useApiClient";
import type { Deck, GenerationOptions } from "@/types";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DeckDetailPage() {
  const params      = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const api         = useApiClient();
  const deckId      = params.id;

  const [showRegenPanel, setShowRegenPanel] = useState(false);
  const [regenOptions, setRegenOptions]     = useState<GenerationOptions>({
    cardCount:          "auto",
    difficulty:         "intermediate",
    cardTypePreference: "mixed",
  });

  // ── Fetch du deck ────────────────────────────────────────────────────────────
  const {
    data: deck,
    isLoading,
    isError,
    refetch,
  } = useQuery<Deck & { _count: { cards: number; dueCards: number } }>({
    queryKey: ["deck", deckId],
    queryFn:  () => api.get(`/decks/${deckId}`),
    staleTime: 10_000,
  });

  // ── Régénération ─────────────────────────────────────────────────────────────
  const regenerate = useMutation<void, Error>({
    mutationFn: () =>
      api.post(`/decks/${deckId}/regenerate`, {
        deleteExisting: true,
        options: regenOptions,
      }),
    onSuccess: () => {
      setShowRegenPanel(false);
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      queryClient.invalidateQueries({ queryKey: ["deck-status", deckId] });
    },
  });

  // Appelé par GenerationProgress quand la génération passe à "done"
  function handleGenerationDone() {
    queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
  }

  if (isLoading) return <DeckSkeleton />;
  if (isError || !deck) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <p className="text-slate-500">Deck introuvable ou accès refusé.</p>
        <Link href="/decks" className="text-brand-500 hover:underline text-sm">
          ← Retour aux decks
        </Link>
      </div>
    );
  }

  const totalCards = deck._count?.cards    ?? 0;
  const dueCards   = deck._count?.dueCards ?? 0;
  const canRegen   = !!deck.sourceContent && deck.generationStatus !== "processing";

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/decks"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100
                       dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 truncate">
              {deck.title}
            </h1>
            {deck.description && (
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 truncate">
                {deck.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canRegen && (
            <button
              onClick={() => setShowRegenPanel((v) => !v)}
              title="Régénérer les cartes"
              className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50
                         dark:hover:text-brand-400 dark:hover:bg-brand-950/40 transition-colors"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          )}
          {totalCards >= 2 && (
            <Link
              href={`/quiz/${deckId}`}
              className="inline-flex items-center gap-2 border border-brand-300 dark:border-brand-700
                         text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30
                         px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              Quiz
            </Link>
          )}
          {dueCards > 0 && (
            <Link
              href={`/study/${deckId}`}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600
                         text-white px-5 py-2.5 rounded-xl font-medium text-sm
                         transition-all hover:-translate-y-0.5 shadow-sm"
            >
              <Zap className="w-4 h-4" />
              Réviser ({dueCards})
            </Link>
          )}
        </div>
      </div>

      {/* ── Panneau de régénération ── */}
      {showRegenPanel && (
        <div className="space-y-3 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              Régénérer les flashcards
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Les cartes existantes seront supprimées
            </p>
          </div>
          <GenerationSettings value={regenOptions} onChange={setRegenOptions} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowRegenPanel(false)}
              className="flex-1 py-2 text-sm text-slate-600 dark:text-slate-400 border border-slate-200
                         dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => regenerate.mutate()}
              disabled={regenerate.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium
                         text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RotateCcw className={`w-4 h-4 ${regenerate.isPending ? "animate-spin" : ""}`} />
              {regenerate.isPending ? "Lancement…" : "Régénérer"}
            </button>
          </div>
          {regenerate.isError && (
            <p className="text-xs text-rose-500">{regenerate.error.message}</p>
          )}
        </div>
      )}

      {/* ── Bandeau de progression IA (polling) ── */}
      <GenerationProgress deckId={deckId} onDone={handleGenerationDone} />

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<BookOpen className="w-4 h-4" />}
          label="Total cartes"
          value={totalCards}
          color="default"
        />
        <StatCard
          icon={<Zap className="w-4 h-4" />}
          label="À réviser"
          value={dueCards}
          color="brand"
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="Source"
          value={SOURCE_LABELS[deck.sourceType ?? "manual"] ?? deck.sourceType}
          color="default"
          isText
        />
      </div>

      {/* ── Liste des cartes + refresh manuel ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Flashcards {totalCards > 0 ? `(${totalCards})` : ""}
          </h2>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600
                       dark:hover:text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </button>
        </div>
        <CardList cards={deck.cards ?? []} />
      </div>
    </div>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manuel",
  text:   "Texte",
  pdf:    "PDF",
  url:    "URL",
};

interface StatCardProps {
  icon:    React.ReactNode;
  label:   string;
  value:   number | string;
  color:   "default" | "brand";
  isText?: boolean;
}

function StatCard({ icon, label, value, color, isText }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
      <div
        className={`flex items-center gap-2 text-sm mb-1 ${
          color === "brand"
            ? "text-brand-500"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        {icon}
        {label}
      </div>
      <p
        className={`font-bold ${isText ? "text-lg" : "text-2xl"} ${
          color === "brand"
            ? "text-brand-600 dark:text-brand-400"
            : "text-slate-900 dark:text-slate-50"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DeckSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
