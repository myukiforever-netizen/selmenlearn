import Anthropic from "@anthropic-ai/sdk";

// Clé optionnelle — sans elle, les jobs de génération IA échouent proprement
// mais le serveur démarre et toutes les autres routes fonctionnent normalement.
const claude = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

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

  if (!claude) throw new Error("Génération IA désactivée — ANTHROPIC_API_KEY non configurée.");

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

// ─── Génération de quiz ───────────────────────────────────────────────────────

export interface QuizQuestion {
  id:          string;
  type:        "mcq" | "true_false";
  question:    string;
  options:     { text: string; isCorrect: boolean }[];
  explanation: string;
}

const QUIZ_SYSTEM_PROMPT = `Tu es un expert en pédagogie. Tu génères des questions de quiz à partir de flashcards pour tester la compréhension en profondeur.
Règles absolues :
- Varie les types : environ 65% QCM ("mcq"), 35% vrai/faux ("true_false")
- Pour QCM : exactement 4 options, 1 seule correcte, 3 distracteurs plausibles et de longueur similaire
- Pour vrai/faux : affirmation directe (pas une question), exactement 2 options dans cet ordre : [{"text":"Vrai","isCorrect":true_ou_false},{"text":"Faux","isCorrect":true_ou_false}]
- Reformule la question — ne copie pas le recto mot pour mot
- L'explication est courte (1 phrase max), en français
- Réponds UNIQUEMENT avec du JSON valide, aucun texte avant ou après`;

export async function generateQuiz(
  cards:    { front: string; back: string }[],
  subject?: string
): Promise<QuizQuestion[]> {
  const subjectCtx = subject ? ` (sujet : ${subject})` : "";

  const cardsText = cards
    .map((c, i) => `Carte ${i + 1} — Question: "${c.front}" | Réponse: "${c.back}"`)
    .join("\n");

  if (!claude) throw new Error("Génération IA désactivée — ANTHROPIC_API_KEY non configurée.");

  const message = await claude.messages.create({
    model:      "claude-sonnet-4-6",
    max_tokens: 4096,
    system: [
      {
        type:          "text",
        text:          QUIZ_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      } as Anthropic.TextBlockParam & { cache_control: { type: "ephemeral" } },
    ],
    messages: [
      {
        role:    "user",
        content: `Génère 1 question de quiz par flashcard${subjectCtx}.

Flashcards :
${cardsText}

Format JSON requis (1 objet par carte) :
[
  {
    "id": "q1",
    "type": "mcq",
    "question": "Question reformulée ?",
    "options": [
      { "text": "Bonne réponse", "isCorrect": true },
      { "text": "Distractor 1",  "isCorrect": false },
      { "text": "Distractor 2",  "isCorrect": false },
      { "text": "Distractor 3",  "isCorrect": false }
    ],
    "explanation": "Courte explication de la bonne réponse."
  }
]`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected Claude response type");

  const jsonMatch = content.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("No JSON array found in Claude response");

  const raw = JSON.parse(jsonMatch[0]) as QuizQuestion[];

  return raw
    .filter((q) => q.question && q.options?.length >= 2)
    .map((q, i) => ({
      ...q,
      id:      `q${i + 1}`,
      options: q.type === "mcq" ? shuffleArray(q.options) : q.options,
    }));
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
