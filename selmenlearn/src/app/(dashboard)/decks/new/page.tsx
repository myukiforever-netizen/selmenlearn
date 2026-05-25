import { NewDeckForm } from "@/components/deck/NewDeckForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Nouveau Deck" };

export default function NewDeckPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/decks"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100
                     dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Nouveau Deck
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Colle ton contenu ou importe un fichier — l&apos;IA génère les flashcards
          </p>
        </div>
      </div>

      <NewDeckForm />
    </div>
  );
}
