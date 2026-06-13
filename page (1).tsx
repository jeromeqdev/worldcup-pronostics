"use client";
// components/predictions/PredictionsList.tsx

import type { Match, Prediction, Profile } from "@/types";
import { Users } from "lucide-react";

interface Props {
  predictions: (Prediction & { profile: Profile })[];
  match: Match;
  currentUserId?: string;
}

export function PredictionsList({ predictions, match, currentUserId }: Props) {
  if (predictions.length === 0) {
    return (
      <div className="card text-center py-8 text-gray-500">
        <Users size={24} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">Aucun pronostic encore soumis pour ce match.</p>
      </div>
    );
  }

  const isFinished = match.status === "finished";

  return (
    <div className="card">
      <h3 className="font-display font-bold text-lg text-white tracking-wide mb-4 flex items-center gap-2">
        <Users size={16} className="text-gray-400" />
        PRONOSTICS ({predictions.length})
      </h3>

      <div className="space-y-2">
        {predictions.map((p) => {
          const isCurrentUser = p.user_id === currentUserId;
          const correctResult =
            isFinished &&
            match.home_score !== null &&
            match.away_score !== null &&
            p.predicted_winner ===
              (match.home_score! > match.away_score!
                ? "home"
                : match.away_score! > match.home_score!
                ? "away"
                : "draw");

          return (
            <div
              key={p.id}
              className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors ${
                isCurrentUser
                  ? "bg-pitch-900/30 border border-pitch-700/40"
                  : "bg-surface-700/50"
              }`}
            >
              {/* Pseudo */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isCurrentUser ? "bg-pitch-600 text-white" : "bg-surface-500 text-gray-300"
                }`}>
                  {p.profile?.pseudo?.[0]?.toUpperCase() ?? "?"}
                </div>
                <span className={`text-sm font-medium truncate ${
                  isCurrentUser ? "text-pitch-300" : "text-gray-300"
                }`}>
                  {p.profile?.pseudo ?? "Inconnu"}
                  {isCurrentUser && (
                    <span className="ml-1.5 text-xs text-gray-500">(toi)</span>
                  )}
                </span>
              </div>

              {/* Score pronostiqué */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center">
                  <span className="text-xs text-gray-500">
                    {match.home_team?.country_code}
                  </span>
                  <div className="font-display font-bold text-white text-base">
                    {p.home_score} – {p.away_score}
                  </div>
                  <span className="text-xs text-gray-500">
                    {match.away_team?.country_code}
                  </span>
                </div>

                {/* Résultat prédit */}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  p.predicted_winner === "home"
                    ? "bg-blue-500/15 text-blue-400"
                    : p.predicted_winner === "away"
                    ? "bg-orange-500/15 text-orange-400"
                    : "bg-gray-500/15 text-gray-400"
                }`}>
                  {p.predicted_winner === "home"
                    ? match.home_team?.name
                    : p.predicted_winner === "away"
                    ? match.away_team?.name
                    : "Nul"}
                </span>

                {/* Points si match terminé */}
                {isFinished && p.points !== null && p.points !== undefined && (
                  <div className={`points-badge points-${p.points}`}>
                    {p.points}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
