import { DeckCard } from "./DeckCard";
import type { Deck } from "@/types";

interface DeckGridProps {
  decks: Deck[];
}

export function DeckGrid({ decks }: DeckGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} />
      ))}
    </div>
  );
}
