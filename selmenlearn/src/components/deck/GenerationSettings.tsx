"use client";

import { cn } from "@/lib/utils";
import type { GenerationOptions } from "@/types";

interface Props {
  value:    GenerationOptions;
  onChange: (opts: GenerationOptions) => void;
}

// ─── Options disponibles ──────────────────────────────────────────────────────

const CARD_COUNT_OPTIONS: Array<{ value: GenerationOptions["cardCount"]; label: string }> = [
  { value: "auto", label: "Auto"  },
  { value: 5,      label: "5"     },
  { value: 10,     label: "10"    },
  { value: 15,     label: "15"    },
  { value: 20,     label: "20"    },
];

const DIFFICULTY_OPTIONS: Array<{ value: NonNullable<GenerationOptions["difficulty"]>; label: string; hint: string }> = [
  { value: "beginner",     label: "Débutant",       hint: "Langage simple, concepts de base"          },
  { value: "intermediate", label: "Intermédiaire",   hint: "Niveau standard, vocabulaire spécialisé"  },
  { value: "advanced",     label: "Avancé",          hint: "Technique, nuances et cas particuliers"   },
];

const TYPE_OPTIONS: Array<{ value: NonNullable<GenerationOptions["cardTypePreference"]>; label: string }> = [
  { value: "mixed",       label: "Mélangé"      },
  { value: "definition",  label: "Définitions"  },
  { value: "application", label: "Applications" },
  { value: "example",     label: "Exemples"     },
  { value: "comparison",  label: "Comparaisons" },
];

// ─── Composant ────────────────────────────────────────────────────────────────

export function GenerationSettings({ value, onChange }: Props) {
  const cardCount          = value.cardCount          ?? "auto";
  const difficulty         = value.difficulty         ?? "intermediate";
  const cardTypePreference = value.cardTypePreference ?? "mixed";

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        Paramètres de génération IA
      </p>

      {/* ── Nombre de cartes ── */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Nombre de cartes
        </label>
        <div className="flex gap-2 flex-wrap">
          {CARD_COUNT_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange({ ...value, cardCount: opt.value })}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                cardCount === opt.value
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-700"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {cardCount === "auto" && (
          <p className="text-xs text-slate-400">
            L&apos;IA choisit entre 3 et 8 cartes selon la densité du contenu.
          </p>
        )}
      </div>

      {/* ── Niveau de difficulté ── */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Niveau
        </label>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...value, difficulty: opt.value })}
              className={cn(
                "flex flex-col gap-0.5 p-2.5 rounded-lg border text-left transition-all",
                difficulty === opt.value
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
              )}
            >
              <span className="text-sm font-medium">{opt.label}</span>
              <span className="text-xs opacity-70 leading-tight">{opt.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Type de cartes ── */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Type de cartes
        </label>
        <div className="flex gap-2 flex-wrap">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...value, cardTypePreference: opt.value })}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                cardTypePreference === opt.value
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-700"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
