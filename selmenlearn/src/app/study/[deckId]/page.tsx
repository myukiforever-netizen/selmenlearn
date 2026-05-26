"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { FlashCard } from "@/components/flashcard/FlashCard";
import { RatingButtons } from "@/components/flashcard/RatingButtons";
import { SessionProgress } from "@/components/flashcard/SessionProgress";
import { FeedbackOverlay } from "@/components/flashcard/FeedbackOverlay";
import { SessionComplete } from "@/components/flashcard/SessionComplete";
import { LevelUpOverlay } from "@/components/xp/LevelUpOverlay";
import { LumiWidget } from "@/components/lumi/LumiWidget";
import { useStudySession } from "@/hooks/useStudySession";
import { useLumiStore } from "@/stores/useLumiStore";

// ─── Lumi messages ────────────────────────────────────────────────────────────

const LUMI_CORRECT  = ["Super ! 🌟", "Bien joué !", "Tu maîtrises ça !", "C'est ça ! ✨", "Excellent !"];
const LUMI_WRONG    = ["Pas de panique !", "Tu y arriveras !", "L'erreur fait partie de l'apprentissage !", "Essaie encore !"];
const LUMI_END      = ["Belle session ! 🎉", "Du beau travail !", "Tu progresses vite !", "Bravo pour cette séance !"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── Page de session ──────────────────────────────────────────────────────────

export default function StudyPage() {
  const params = useParams<{ deckId: string }>();
  const deckId = params.deckId;

  const {
    status,
    currentCard,
    currentIdx,
    totalCards,
    flipped,
    feedback,
    shake,
    totalXp,
    streak,
    ratingDistribution,
    isRating,
    lastXpGained,
    leveledUp,
    newLevel,
    flip,
    rate,
    restart,
  } = useStudySession(deckId);

  const [showLevelUp, setShowLevelUp] = useState(false);

  const setLumiMood = useLumiStore((s) => s.setMood);

  // Déclencher l'overlay level-up quand la session se termine avec un passage de niveau
  useEffect(() => {
    if (status === "complete" && leveledUp) {
      setShowLevelUp(true);
    }
  }, [status, leveledUp]);

  // Lumi réagit aux réponses
  useEffect(() => {
    if (feedback === "correct") {
      setLumiMood("happy", pick(LUMI_CORRECT));
    } else if (feedback === "incorrect") {
      setLumiMood("sad", pick(LUMI_WRONG));
    }
  }, [feedback, setLumiMood]);

  // Lumi réagit à la fin de session
  useEffect(() => {
    if (status !== "complete") return;
    if (leveledUp) {
      setLumiMood("proud", `Niveau ${newLevel} atteint ! 🎉`);
    } else {
      setLumiMood("happy", pick(LUMI_END));
    }
  }, [status, leveledUp, newLevel, setLumiMood]);

  // ── Raccourcis clavier ────────────────────────────────────────────────────────
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (status !== "active") return;

      if (e.code === "Space" && !flipped) {
        e.preventDefault();
        flip();
      }
      if (flipped && !isRating) {
        if (e.key === "1") rate(0);
        if (e.key === "2") rate(1);
        if (e.key === "3") rate(2);
        if (e.key === "4") rate(3);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [status, flipped, isRating, flip, rate]);

  // ── Écrans alternatifs ────────────────────────────────────────────────────────

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status === "empty") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-950/40 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-brand-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Tout est à jour !
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs">
            Aucune carte à réviser pour le moment. Reviens dans quelques heures.
          </p>
        </div>
        <Link
          href={`/decks/${deckId}`}
          className="flex items-center gap-2 text-brand-500 hover:text-brand-600 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au deck
        </Link>
      </div>
    );
  }

  if (status === "complete") {
    return (
      <>
        <SessionComplete
          deckId={deckId}
          totalCards={totalCards}
          xpGained={totalXp}
          streak={streak}
          ratingDistribution={ratingDistribution}
          onRestart={restart}
        />
        {showLevelUp && (
          <LevelUpOverlay
            newLevel={newLevel}
            onDismiss={() => setShowLevelUp(false)}
          />
        )}
        <LumiWidget />
      </>
    );
  }

  // ── Session active ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">

      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 max-w-xl mx-auto w-full">
        <Link
          href={`/decks/${deckId}`}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200
                     hover:bg-white dark:hover:bg-slate-800 transition-colors shrink-0"
          title="Quitter la session"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <SessionProgress current={currentIdx} total={totalCards} xpGained={totalXp} />
      </header>

      {/* ── Carte centrale ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 gap-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard?.id ?? "empty"}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="w-full max-w-lg"
          >
            {currentCard && (
              <FlashCard
                front={currentCard.front}
                back={currentCard.back}
                cardType={currentCard.cardType}
                flipped={flipped}
                shake={shake}
                onClick={flip}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Boutons de notation ── */}
        <div className="w-full max-w-lg min-h-[100px] flex items-center">
          <AnimatePresence>
            {flipped && (
              <div className="w-full">
                <RatingButtons onRate={rate} disabled={isRating} />
                <p className="text-center text-xs text-slate-400 mt-3 hidden sm:block">
                  Clavier : <kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">Espace</kbd> pour révéler —{" "}
                  <kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">1</kbd>
                  <kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] ml-0.5">2</kbd>
                  <kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] ml-0.5">3</kbd>
                  <kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] ml-0.5">4</kbd>
                  {" "}pour noter
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Feedback overlay (avec +XP) ── */}
      <FeedbackOverlay feedback={feedback} xpGained={lastXpGained} />

      {/* ── Mascotte Lumi ── */}
      <LumiWidget />
    </div>
  );
}

// ─── Écran de chargement ──────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5
                    bg-slate-50 dark:bg-slate-950 animate-pulse">
      <div className="w-full max-w-lg mx-auto px-4 space-y-3">
        <div className="h-2.5 w-32 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="w-full max-w-lg mx-auto px-4">
        <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    </div>
  );
}
