"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useDeckStatus } from "@/hooks/useDeckStatus";
import { ProgressBar } from "@/components/ui/progress";

interface GenerationProgressProps {
  deckId: string;
  /** Appelé quand la génération passe à "done" — pour recharger les cartes */
  onDone?: () => void;
}

export function GenerationProgress({ deckId, onDone }: GenerationProgressProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useDeckStatus(deckId);

  // Quand la génération se termine, invalider les queries du deck pour recharger les cartes
  useEffect(() => {
    if (data?.status === "done") {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      queryClient.invalidateQueries({ queryKey: ["due-cards", deckId] });
      onDone?.();
    }
  }, [data?.status, deckId, queryClient, onDone]);

  // Ne rien afficher si le statut est idle ou inconnu
  if (isLoading || !data || data.status === "idle") return null;

  return (
    <AnimatePresence>
      <motion.div
        key={data.status}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        {data.status === "processing" && (
          <ProcessingCard progress={data.progress} cardCount={data.cardCount} />
        )}
        {data.status === "done" && (
          <DoneCard cardCount={data.cardCount} />
        )}
        {data.status === "error" && (
          <ErrorCard message={data.error} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function ProcessingCard({ progress, cardCount }: { progress: number; cardCount: number }) {
  return (
    <div className="bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900 rounded-lg flex items-center justify-center shrink-0">
          <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            Génération des flashcards en cours…
          </p>
          <p className="text-xs text-brand-500 dark:text-brand-400">
            {cardCount > 0
              ? `${cardCount} carte${cardCount > 1 ? "s" : ""} créée${cardCount > 1 ? "s" : ""} jusqu'ici`
              : "L'IA analyse ton contenu…"}
          </p>
        </div>
        <span className="ml-auto text-sm font-bold text-brand-600 dark:text-brand-400">
          {progress}%
        </span>
      </div>

      <ProgressBar value={progress} color="brand" animated />

      {/* Indicateur animé de travail en cours */}
      <div className="flex items-center gap-1.5 mt-3">
        {["Découpage", "Analyse", "Génération", "Sauvegarde"].map((step, i) => {
          const stepProgress = (i + 1) * 25;
          const active  = progress >= stepProgress - 25 && progress < stepProgress;
          const done    = progress >= stepProgress;
          return (
            <div key={step} className="flex items-center gap-1 text-xs">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  done
                    ? "bg-brand-500"
                    : active
                    ? "bg-brand-400 animate-pulse"
                    : "bg-brand-200 dark:bg-brand-800"
                }`}
              />
              <span
                className={
                  done
                    ? "text-brand-600 dark:text-brand-400 font-medium"
                    : "text-brand-400 dark:text-brand-600"
                }
              >
                {step}
              </span>
              {i < 3 && (
                <span className="text-brand-300 dark:text-brand-700 mx-0.5">›</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DoneCard({ cardCount }: { cardCount: number }) {
  return (
    <motion.div
      initial={{ scale: 0.96 }}
      animate={{ scale: 1 }}
      className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Génération terminée !
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            <span className="font-bold">{cardCount} flashcard{cardCount > 1 ? "s" : ""}</span>{" "}
            prête{cardCount > 1 ? "s" : ""} à réviser.
          </p>
        </div>
        <Sparkles className="w-5 h-5 text-emerald-400 ml-auto animate-bounce-in" />
      </div>
    </motion.div>
  );
}

function ErrorCard({ message }: { message: string | null }) {
  return (
    <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900 rounded-lg flex items-center justify-center shrink-0">
          <XCircle className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
            Échec de la génération
          </p>
          <p className="text-xs text-rose-500 dark:text-rose-400 mt-0.5">
            {message ?? "Une erreur inattendue s'est produite. Réessaie dans quelques instants."}
          </p>
        </div>
      </div>
    </div>
  );
}
