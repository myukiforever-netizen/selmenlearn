import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not defined");
}

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface GeneratedCard {
  front: string;
  back: string;
  cardType: "definition" | "application" | "comparison" | "example";
}

export interface GenerationOptions {
  cardCount?:          5 | 10 | 15 | 20 | "auto";
  difficulty?:         "beginner" | "intermediate" | "advanced";
  cardTypePreference?: "mixed" | "definition" | "application" | "example" | "comparison";
}

// ─── Prompt de base (mis en cache côté Anthropic) ─────────────────────────────

const BASE_SYSTEM_PROMPT = `Tu es un expert en pédagogie et en sciences cognitives. Tu génères des flashcards optimisées pour la mémorisation à long terme, en appliquant le principe du rappel actif.
Règles absolues :
- La question (front) force l'apprenant à PRODUIRE une réponse, jamais à la reconnaître
- La réponse (back) est complète, précise, et compréhensible sans contexte
- Chaque carte couvre UN SEUL concept
- Réponds UNIQUEMENT avec du JSON valide, aucun texte avant ou après`;

const DIFFICULTY_INSTRUCTIONS: Record<string, string> = {
  beginner:     "Langage simple, concepts de base, réponses courtes (1-2 phrases). Évite le jargon technique.",
  intermediate: "Langage standard, concepts intermédiaires, réponses en 2-3 phrases. Peut inclure du vocabulaire spécialisé.",
  advanced:     "Langage technique précis, concepts avancés avec nuances. Réponses riches incluant le contexte et les cas particuliers.",
};

// ─── Génération de flashcards ─────────────────────────────────────────────────

export async function generateFlashcards(
  chunk:    string,
  subject?: string,
  options:  GenerationOptions = {}
): Promise<GeneratedCard[]> {
  const {
    difficulty          = "intermediate",
    cardTypePreference  = "mixed",
    cardCount           = "auto",
  } = options;

  const subjectCtx = subject ? ` (sujet : ${subject})` : "";

  const cardCountInstruction =
    cardCount === "auto"
      ? "Entre 3 et 8 flashcards selon la densité du contenu"
      : `Exactement ${cardCount} flashcards si le contenu le permet, sinon adapte`;

  const typeInstruction =
    cardTypePreference === "mixed"
      ? `Varie les types : "definition" (qu'est-ce que X ?), "application" (comment fait-on X ?), "example" (donne un exemple de X), "comparison" (quelle est la différence entre X et Y ?)`
      : `Génère principalement des cartes de type "${cardTypePreference}"`;

  const message = await claude.messages.create({
    model:      "claude-sonnet-4-6",
    max_tokens: 2048,
    system: [
      {
        type:          "text",
        text:          BASE_SYSTEM_PROMPT,
        // Le système prompt est mis en cache : économise des tokens sur les appels répétés
        cache_control: { type: "ephemeral" },
      } as Anthropic.TextBlockParam & { cache_control: { type: "ephemeral" } },
    ],
    messages: [
      {
        role:    "user",
        content: `Génère des flashcards pertinentes à partir de ce contenu${subjectCtx}.

Niveau : ${difficulty} — ${DIFFICULTY_INSTRUCTIONS[difficulty]}

Contenu :
${chunk}

Règles de génération :
- ${cardCountInstruction}
- ${typeInstruction}
- Questions courtes (< 15 mots), réponses en 1-3 phrases maximum

Format JSON requis :
[
  {
    "front": "Question courte et précise ?",
    "back": "Réponse complète et mémorisable.",
    "cardType": "definition"
  }
]`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected Claude response type");

  // Extraire le JSON même si Claude ajoute du texte autour
  const jsonMatch = content.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("No JSON array found in Claude response");

  const cards = JSON.parse(jsonMatch[0]) as GeneratedCard[];

  return cards.filter(
    (c) =>
      typeof c.front === "string" &&
      typeof c.back  === "string" &&
      c.front.length > 0 &&
      c.back.length  > 0
  );
}

// ─── Découpage du texte en chunks ─────────────────────────────────────────────

export function splitIntoChunks(text: string, maxTokens: number): string[] {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30);

  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const combined = current ? `${current}\n\n${para}` : para;
    // Approximation : 1 token ≈ 4 caractères
    if (combined.length / 4 > maxTokens && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = combined;
    }
  }

  if (current.trim().length > 0) chunks.push(current.trim());

  return chunks.length > 0 ? chunks : [text.trim()];
}
