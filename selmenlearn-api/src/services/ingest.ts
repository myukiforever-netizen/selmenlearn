import { createRequire } from "module";

// pdf-parse est un module CJS — import via createRequire pour la compatibilité ESM
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse") as (
  buffer: Buffer,
  options?: object
) => Promise<{ text: string; numpages: number; info: Record<string, unknown> }>;

// ─── Types ────────────────────────────────────────────────────────────────────

export type SourceType = "text" | "pdf" | "url" | "manual";

export interface IngestResult {
  rawText: string;
  cleanText: string;
  metadata: {
    source: SourceType;
    charCount: number;
    estimatedTokens: number;
    pageCount?: number;
    title?: string;
    url?: string;
  };
}

// ─── Texte brut ───────────────────────────────────────────────────────────────

export function ingestText(raw: string): IngestResult {
  const cleanText = cleanAndNormalize(raw);
  return {
    rawText: raw,
    cleanText,
    metadata: {
      source: "text",
      charCount: cleanText.length,
      estimatedTokens: Math.ceil(cleanText.length / 4),
    },
  };
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

export async function ingestPDF(buffer: Buffer): Promise<IngestResult> {
  const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 Mo
  if (buffer.length > MAX_PDF_SIZE) {
    throw new Error("Le fichier PDF dépasse la limite de 10 Mo.");
  }

  let parsed: { text: string; numpages: number; info: Record<string, unknown> };
  try {
    parsed = await pdfParse(buffer, { max: 50 }); // max 50 pages
  } catch (err) {
    throw new Error(
      `Impossible de lire le PDF : ${err instanceof Error ? err.message : "format non supporté"}`
    );
  }

  if (!parsed.text || parsed.text.trim().length < 50) {
    throw new Error(
      "Le PDF semble ne contenir aucun texte extractible (PDF scanné ou protégé)."
    );
  }

  const cleanText = cleanAndNormalize(parsed.text);
  const title =
    typeof parsed.info?.Title === "string" && parsed.info.Title.trim()
      ? parsed.info.Title.trim()
      : undefined;

  return {
    rawText: parsed.text,
    cleanText,
    metadata: {
      source: "pdf",
      charCount: cleanText.length,
      estimatedTokens: Math.ceil(cleanText.length / 4),
      pageCount: parsed.numpages,
      title,
    },
  };
}

// ─── URL ──────────────────────────────────────────────────────────────────────

const BLOCKED_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "169.254.",
  "10.",
  "192.168.",
];

export async function ingestURL(rawUrl: string): Promise<IngestResult> {
  // Validation de l'URL
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("URL invalide. Assure-toi qu'elle commence par https://");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Seules les URL http:// et https:// sont autorisées.");
  }

  // Blocage des adresses internes (SSRF protection)
  const host = url.hostname.toLowerCase();
  if (BLOCKED_DOMAINS.some((b) => host.startsWith(b) || host === b.replace(".", ""))) {
    throw new Error("Cette URL n'est pas accessible.");
  }

  let html: string;
  try {
    const res = await fetch(rawUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SelmenLearnBot/1.0; +https://selmenlearn.com/bot)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10_000), // 10s timeout
    });

    if (!res.ok) {
      throw new Error(`Le serveur a répondu avec le code ${res.status}.`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      throw new Error("Seules les pages HTML ou texte brut sont supportées.");
    }

    html = await res.text();
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error("La page met trop de temps à répondre (> 10s).");
    }
    throw err;
  }

  const extracted = extractTextFromHTML(html);
  const pageTitle = extractPageTitle(html);
  const cleanText = cleanAndNormalize(extracted);

  if (cleanText.length < 100) {
    throw new Error(
      "Impossible d'extraire suffisamment de texte de cette page. Essaie de coller le contenu directement."
    );
  }

  return {
    rawText: html,
    cleanText,
    metadata: {
      source: "url",
      charCount: cleanText.length,
      estimatedTokens: Math.ceil(cleanText.length / 4),
      title: pageTitle,
      url: rawUrl,
    },
  };
}

// ─── Helpers internes ─────────────────────────────────────────────────────────

function cleanAndNormalize(text: string): string {
  return text
    // Supprimer les caractères de contrôle (sauf \n \t)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Normaliser les fins de ligne
    .replace(/\r\n?/g, "\n")
    // Réduire plus de 3 sauts de ligne consécutifs à 2
    .replace(/\n{3,}/g, "\n\n")
    // Réduire les espaces multiples sur une même ligne
    .replace(/[^\S\n]{2,}/g, " ")
    // Supprimer les espaces en début/fin de chaque ligne
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .trim();
}

function extractTextFromHTML(html: string): string {
  return (
    html
      // Supprimer les blocs invisibles (scripts, styles, nav, footer, etc.)
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<aside[\s\S]*?<\/aside>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      // Remplacer les balises de bloc par des sauts de ligne
      .replace(/<(br|p|div|h[1-6]|li|tr|blockquote)[^>]*>/gi, "\n")
      .replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, "\n")
      // Supprimer toutes les balises restantes
      .replace(/<[^>]+>/g, "")
      // Décoder les entités HTML courantes
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  );
}

function extractPageTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (!match) return undefined;
  const raw = match[1]
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
  return raw.length > 0 ? raw : undefined;
}
