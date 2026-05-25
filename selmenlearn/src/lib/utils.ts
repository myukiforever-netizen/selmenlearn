import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    const diffMonth = Math.floor(diffDay / 30);
    return `il y a ${diffMonth} mois`;
  }
  if (diffDay >= 1) return `il y a ${diffDay} jour${diffDay > 1 ? "s" : ""}`;
  if (diffHour >= 1) return `il y a ${diffHour}h`;
  if (diffMin >= 1) return `il y a ${diffMin} min`;
  return "à l'instant";
}

export function getLevelFromXP(xp: number): number {
  const thresholds = [0, 2500, 10000, 50000, 200000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) return i + 1;
  }
  return 1;
}

export function getLevelTitle(level: number): string {
  if (level <= 5)  return "Explorateur";
  if (level <= 10) return "Apprenti";
  if (level <= 20) return "Érudit";
  if (level <= 30) return "Expert";
  return "Maître";
}

export function xpToNextLevel(xp: number): { current: number; needed: number; pct: number } {
  const thresholds = [0, 2500, 10000, 50000, 200000, Infinity];
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (xp < thresholds[i + 1]) {
      const current = xp - thresholds[i];
      const needed = thresholds[i + 1] - thresholds[i];
      return { current, needed, pct: Math.round((current / needed) * 100) };
    }
  }
  return { current: xp, needed: xp, pct: 100 };
}

export function pluralize(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}
