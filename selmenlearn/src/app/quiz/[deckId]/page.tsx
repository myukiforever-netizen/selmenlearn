"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, HelpCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizComplete } from "@/components/quiz/QuizComplete";
import { LevelUpOverlay } from "@/components/xp/LevelUpOverlay";
import { LumiWidget } from "@/components/lumi/LumiWidget";
import { useQuizSession } from "@/hooks/useQuizSession";
import { useLumiStore } from "@/stores/useLumiStore";

// ─── Lumi messages ────────────────────────────────────────────────────────────

const LUMI_CORRECT  = ["Super ! 🌟", "Bonne réponse !", "Tu sais ça ! ✨", "Excellent !"];
const LUMI_WRONG    = ["Pas de panique !", "On apprend de ses erreurs !", "Tu y arriveras !", "Continue !"];
const LUMI_END      = ["Quiz terminé ! 🎉", "Belle performance !", "Bien joué !", "Tu progresses !"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── Page principale ──────────────────────────────────────────────────────────

export default function QuizPage() {
  const params  = useParams<{ deckId: string }>();
  const deckId  = params.deckId;

  const {
    status,
    currentQuestion,
    currentIdx,
    totalQuestions,
    selectedIdx,
    isAnswered,
    score,
    xpGained,
    streak,
    errorMsg,
    leveledUp,
    newLevel,
    selectAnswer,
    nextQuestion,
    restart,
  } = useQuizSession(deckId);

  const [showLevelUp, setShowLevelUp] = useState(false);

  const setLumiMood = useLumiStore((s) => s.setMood);

  // Déclencher l'overlay level-up quand le quiz est terminé avec un passage de niveau
  useEffect(() => {
    if (status === "complete" && leveledUp) {
      setShowLevelUp(true);
    }
  }, [status, leveledUp]);

  // Lumi réagit aux réponses du quiz
  useEffect(() => {
    if (!isAnswered || selectedIdx === null || !currentQuestion) return;
    const correct = currentQuestion.options[selectedIdx]?.isCorrect ?? false;
    setLumiMood(correct ? "happy" : "sad", correct ? pick(LUMI_CORRECT) : pick(LUMI_WRONG));
  }, [isAnswered]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lumi réagit à la fin du quiz
  useEffect(() => {
    if (status !== "complete") return;
    const perfect = score === totalQuestions && totalQuestions > 0;
    if (perfect) {
      setLumiMood("excited", "Score parfait ! 🌠 Incroyable !");
    } else {
      setLumiMood("happy", pick(LUMI_END));
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Si level-up arrive (réponse API asynchrone) — override
  useEffect(() => {
    if (!leveledUp || status !== "complete") return;
    setLumiMood("proud", `Niveau ${newLevel} atteint ! 🎉`);
  }, [leveledUp, newLevel, status, setLumiMood]);

  // Raccourci clavier : Entrée pour passer à la question suivante
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Enter" && isAnswered && status === "active") {
        e.preventDefault();
        nextQuestion();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isAnswered, status, nextQuestion]);

  // ── Écrans alternatifs ────────────────────────────────────────────────────────

  if (status === "loading") return <LoadingScreen />;

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6
                      bg-slate-50 dark:bg-slate-950">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Erreur de génération</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
            {errorMsg ?? "Impossible de générer le quiz. Réessaie dans un moment."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/decks/${deckId}`}
            className="py-2.5 px-5 rounded-xl border border-slate-200 dark:border-slate-700
                       text-sm font-medium text-slate-600 dark:text-slate-400
                       hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Retour au deck
          </Link>
          <button type="button" onClick={restart}
            className="py-2.5 px-5 rounded-xl bg-brand-500 hover:bg-brand-600
                       text-white text-sm font-medium transition-colors">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6
                      bg-slate-50 dark:bg-slate-950">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-950/40 flex items-center justify-center">
          <HelpCircle className="w-8 h-8 text-brand-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Pas assez de cartes</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
            Il faut au moins 2 cartes dans le deck pour générer un quiz.
          </p>
        </div>
        <Link href={`/decks/${deckId}`}
          className="flex items-center gap-2 text-brand-500 hover:text-brand-600 font-medium text-sm">
          <ArrowLeft className="w-4 h-4" />
          Retour au deck
        </Link>
      </div>
    );
  }

  if (status === "complete") {
    return (
      <>
        <QuizComplete
          deckId={deckId}
          score={score}
          total={totalQuestions}
          xpGained={xpGained}
          streak={streak}
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
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 max-w-lg mx-auto w-full">
        <Link
          href={`/decks/${deckId}`}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200
                     hover:bg-white dark:hover:bg-slate-800 transition-colors shrink-0"
          title="Quitter le quiz"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <QuizProgress
          current={currentIdx + 1}
          total={totalQuestions}
          score={score}
        />
      </header>

      {/* ── Question centrale ── */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="w-full"
            >
              <QuizQuestion
                question={currentQuestion}
                selectedIdx={selectedIdx}
                isAnswered={isAnswered}
                onSelect={selectAnswer}
                onNext={nextQuestion}
                isLast={currentIdx + 1 >= totalQuestions}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint clavier */}
        {isAnswered && (
          <p className="mt-4 text-xs text-slate-400 hidden sm:block">
            Appuie sur{" "}
            <kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">
              Entrée
            </kbd>{" "}
            pour continuer
          </p>
        )}
      </main>

      {/* ── Mascotte Lumi ── */}
      <LumiWidget />
    </div>
  );
}

// ─── Écran de chargement ──────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5
                    bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-lg mx-auto px-4 space-y-4 animate-pulse">
        <div className="h-2.5 w-40 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="space-y-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
      <p className="text-sm text-slate-400 animate-pulse">
        Génération du quiz par l&apos;IA…
      </p>
    </div>
  );
}
