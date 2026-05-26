"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Link2, Type, PenLine, UploadCloud, X, FileCheck2, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GenerationSettings } from "@/components/deck/GenerationSettings";
import { useApiClient } from "@/hooks/useApiClient";
import { cn } from "@/lib/utils";
import type { GenerationOptions } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type ImportMode = "text" | "pdf" | "url" | "manual";

interface CreateDeckPayload {
  title:        string;
  description?: string;
  subject?:     string;
  sourceType:   ImportMode;
  content?:     string;
}

interface Deck { id: string }

const MODES = [
  { id: "text"   as const, icon: Type,        label: "Texte"   },
  { id: "pdf"    as const, icon: UploadCloud,  label: "PDF"     },
  { id: "url"    as const, icon: Link2,        label: "URL"     },
  { id: "manual" as const, icon: PenLine,      label: "Manuel"  },
];

// ─── Composant principal ──────────────────────────────────────────────────────

export function NewDeckForm() {
  const router = useRouter();
  const api    = useApiClient();

  const [mode, setMode]                 = useState<ImportMode>("text");
  const [title, setTitle]               = useState("");
  const [description, setDescription]   = useState("");
  const [subject, setSubject]           = useState("");
  const [content, setContent]           = useState("");
  const [urlValue, setUrlValue]         = useState("");
  const [pdfFile, setPdfFile]           = useState<File | null>(null);
  const [isDragging, setIsDragging]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [genOptions, setGenOptions]     = useState<GenerationOptions>({
    cardCount:          "auto",
    difficulty:         "intermediate",
    cardTypePreference: "mixed",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Création du deck ─────────────────────────────────────────────────────────
  const createDeck = useMutation<Deck, Error, CreateDeckPayload>({
    mutationFn: (payload) => api.post<Deck>("/decks", payload),
    onSuccess: (deck) => router.push(`/decks/${deck.id}`),
  });

  // ── Import PDF ───────────────────────────────────────────────────────────────
  const importPDF = useMutation<void, Error, { deckId: string; file: File }>({
    mutationFn: async ({ deckId, file }) => {
      const form = new FormData();
      form.append("file", file);
      // Inclure les options de génération dans le multipart
      form.append("options", JSON.stringify(genOptions));
      return api.upload<void>(`/decks/${deckId}/import/pdf`, form);
    },
  });

  // ── Import URL ───────────────────────────────────────────────────────────────
  const importURL = useMutation<void, Error, { deckId: string; url: string }>({
    mutationFn: ({ deckId, url }) =>
      api.post<void>(`/decks/${deckId}/import/url`, { url, subject, options: genOptions }),
  });

  // ─── Validation ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Le titre est requis.";

    if (mode === "text" && !content.trim()) e.content = "Colle ton contenu ici.";
    if (mode === "pdf" && !pdfFile)         e.pdf = "Sélectionne un fichier PDF.";
    if (mode === "url") {
      if (!urlValue.trim()) e.url = "Saisis l'URL de la page.";
      else {
        try { new URL(urlValue); }
        catch { e.url = "URL invalide. Ex: https://exemple.com/article"; }
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ─── Soumission ──────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const deck = await createDeck.mutateAsync({
      title,
      description,
      subject,
      sourceType: mode,
      ...(mode === "text" ? { content } : {}),
    });

    if (mode === "pdf" && pdfFile) {
      await importPDF.mutateAsync({ deckId: deck.id, file: pdfFile });
    }
    if (mode === "url") {
      await importURL.mutateAsync({ deckId: deck.id, url: urlValue });
    }

    router.push(`/decks/${deck.id}`);
  }

  // ─── Drag & drop PDF ─────────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      setPdfFile(file);
      setErrors((prev) => ({ ...prev, pdf: "" }));
    } else {
      setErrors((prev) => ({ ...prev, pdf: "Seuls les fichiers PDF sont acceptés." }));
    }
  }, []);

  const isSubmitting  = createDeck.isPending || importPDF.isPending || importURL.isPending;
  const submitError   = createDeck.error?.message ?? importPDF.error?.message ?? importURL.error?.message;
  const hasAiContent  =
    (mode === "text" && content.length > 100) ||
    (mode === "pdf"  && pdfFile !== null)      ||
    (mode === "url"  && urlValue.length > 10);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Mode selector ── */}
      <div className="grid grid-cols-4 gap-2">
        {MODES.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => { setMode(id); setErrors({}); }}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all",
              mode === id
                ? "border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400"
                : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Champs communs ── */}
      <Input
        label="Titre du deck *"
        placeholder="Ex : Biologie Terminale — Chapitre 3"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Matière (optionnel)"
          placeholder="Ex : Biologie"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <Input
          label="Description (optionnel)"
          placeholder="Courte description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* ── Zone de contenu selon le mode ── */}

      {mode === "text" && (
        <Textarea
          label="Contenu à transformer *"
          placeholder="Colle ici ton cours, tes notes, un article…"
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={errors.content}
          hint={`${content.length} caractères — recommandé : 200 à 10 000`}
        />
      )}

      {mode === "pdf" && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Fichier PDF *
          </label>

          {pdfFile ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <FileCheck2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 truncate">
                  {pdfFile.name}
                </p>
                <p className="text-xs text-emerald-500">
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} Mo
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPdfFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
              >
                <X className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed",
                "cursor-pointer transition-all",
                isDragging
                  ? "border-brand-400 bg-brand-50 dark:bg-brand-950/30"
                  : "border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50 dark:hover:bg-slate-900/50"
              )}
            >
              <UploadCloud
                className={cn(
                  "w-10 h-10 transition-colors",
                  isDragging ? "text-brand-500" : "text-slate-300 dark:text-slate-600"
                )}
              />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Glisse ton PDF ici ou{" "}
                  <span className="text-brand-500 underline underline-offset-2">
                    clique pour parcourir
                  </span>
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF uniquement — max 10 Mo</p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPdfFile(file);
                setErrors((prev) => ({ ...prev, pdf: "" }));
              }
            }}
          />
          {errors.pdf && <p className="text-xs text-rose-500">{errors.pdf}</p>}
        </div>
      )}

      {mode === "url" && (
        <Input
          label="URL de la page *"
          placeholder="https://fr.wikipedia.org/wiki/Photosynthèse"
          value={urlValue}
          onChange={(e) => setUrlValue(e.target.value)}
          error={errors.url}
          hint="La page sera scrapée automatiquement. Fonctionne mieux sur les articles et pages textuelles."
        />
      )}

      {mode === "manual" && (
        <Card className="border-dashed border-2">
          <CardContent className="py-8 text-center space-y-1">
            <PenLine className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Saisie manuelle
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Tu ajouteras les cartes une à une depuis la page du deck.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Paramètres IA (accordéon) ── */}
      {mode !== "manual" && (
        <div>
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            {showSettings ? "Masquer les paramètres IA" : "Personnaliser la génération"}
          </button>
          {showSettings && (
            <div className="mt-3">
              <GenerationSettings value={genOptions} onChange={setGenOptions} />
            </div>
          )}
        </div>
      )}

      {/* ── Bandeau info IA ── */}
      {hasAiContent && (
        <div className="flex items-start gap-3 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-xl p-4">
          <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0 animate-pulse" />
          <p className="text-sm text-brand-700 dark:text-brand-300">
            L&apos;IA générera les flashcards en arrière-plan (10–60 s selon la quantité).
            Tu seras redirigé vers le deck immédiatement.
          </p>
        </div>
      )}

      {/* ── Bouton de soumission ── */}
      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        {mode === "manual" ? "Créer le deck" : "Créer et importer"}
      </Button>

      {submitError && (
        <p className="text-sm text-rose-500 text-center">{submitError}</p>
      )}
    </form>
  );
}
