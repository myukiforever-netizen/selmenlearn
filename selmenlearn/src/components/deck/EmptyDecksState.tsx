import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";

export function EmptyDecksState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/40 rounded-2xl flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-brand-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
        Aucun deck pour l&apos;instant
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-6">
        Crée ton premier deck en important du texte, un PDF ou en saisissant ton contenu directement.
      </p>
      <Link
        href="/dashboard/decks/new"
        className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600
                   text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all
                   hover:-translate-y-0.5 shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Créer mon premier deck
      </Link>
    </div>
  );
}
