"use client";

import Link from "next/link";
import { BookOpen, Zap, Clock, PlayCircle } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Deck } from "@/types";
import { formatDistanceToNow } from "@/lib/utils";

interface DeckCardProps {
  deck: Deck;
}

const sourceLabels: Record<string, string> = {
  manual: "Manuel",
  text:   "Texte",
  pdf:    "PDF",
  url:    "URL",
};

export function DeckCard({ deck }: DeckCardProps) {
  const dueCards = deck._count?.dueCards ?? 0;

  return (
    <Card hover className="h-full flex flex-col group">
      {/* ── Header — clickable to detail ── */}
      <Link href={`/dashboard/decks/${deck.id}`} className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {deck.title}
            </h3>
            <Badge variant="default" className="shrink-0">
              {sourceLabels[deck.sourceType ?? "manual"] ?? deck.sourceType}
            </Badge>
          </div>
          {deck.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {deck.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="flex-1">
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              {deck._count?.cards ?? 0} cartes
            </span>
            {dueCards > 0 && (
              <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
                <Zap className="w-4 h-4" />
                {dueCards} à réviser
              </span>
            )}
          </div>
        </CardContent>
      </Link>

      {/* ── Footer ── */}
      <CardFooter className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          {formatDistanceToNow(new Date(deck.updatedAt))}
        </div>

        {dueCards > 0 && (
          <Link
            href={`/study/${deck.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                       bg-brand-500 hover:bg-brand-600 text-white transition-colors
                       shadow-sm shadow-brand-500/25"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Réviser
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
