import { Badge } from "@/components/ui/badge";
import type { Card } from "@/types";

const cardTypeLabelMap: Record<string, { label: string; variant: "brand" | "success" | "warning" | "default" }> = {
  definition:  { label: "Définition", variant: "brand" },
  application: { label: "Application", variant: "success" },
  comparison:  { label: "Comparaison", variant: "warning" },
  example:     { label: "Exemple", variant: "default" },
};

interface CardListProps {
  cards: Card[];
}

export function CardList({ cards }: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        Les flashcards apparaîtront ici une fois la génération terminée.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        Flashcards ({cards.length})
      </h2>
      <div className="space-y-2">
        {cards.map((card) => {
          const typeInfo = cardTypeLabelMap[card.cardType] ?? { label: card.cardType, variant: "default" as const };
          return (
            <div
              key={card.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                         rounded-xl p-4 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{card.front}</p>
                <Badge variant={typeInfo.variant} className="shrink-0">
                  {typeInfo.label}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{card.back}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
