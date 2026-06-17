import { format, formatDistanceToNow, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import type { Match, MatchPhase, PredictedWinner } from "@/types";

export function cn(...inputs: string[]) {
  return inputs.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

// Heure française (UTC+2 en été)
export function formatKickoff(dateStr: string): string {
  const date = new Date(dateStr);
  const formatted = date.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return formatted.replace(", ", " • ");
}

export function formatKickoffShort(dateStr: string): string {
  const date = new Date(dateStr);
  const formatted = date.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return formatted.replace(", ", " • ");
}

export function formatKickoffFr(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateFr(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatTimeFr(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeFromNow(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { locale: fr, addSuffix: true });
}

export function canPredict(match: Match): boolean {
  return match.status === "upcoming" && !isPast(new Date(match.kickoff_time));
}

export function getPredictedWinner(homeScore: number, awayScore: number): PredictedWinner {
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "draw";
}

export function calculatePoints(predHome: number, predAway: number, actualHome: number, actualAway: number): number {
  if (predHome === actualHome && predAway === actualAway) return 5;
  const predWinner = getPredictedWinner(predHome, predAway);
  const actualWinner = getPredictedWinner(actualHome, actualAway);
  if (actualWinner === "draw" && predWinner === "draw") return 2;
  if (predWinner === actualWinner) return 3;
  return 0;
}

export const PHASE_SHORT: Record<MatchPhase, string> = {
  group: "Poules",
  round_of_16: "8e",
  quarter_final: "QF",
  semi_final: "SF",
  third_place: "3e",
  final: "Finale",
};

export function flagUrl(countryCode: string): string {
  return `https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png`;
}

export function rankLabel(rank: number): string {
  return rank === 1 ? "1er" : `${rank}e`;
}