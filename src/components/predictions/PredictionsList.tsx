"use client";

import type { Match, Prediction, Profile } from "@/types";
import { Users, Trophy } from "lucide-react";

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

  // Trier par points décroissants si match terminé, sinon par date
  const sorted = isFinished
    ? [...predictions].sort((a, b) => (b.points ?? -1) - (a.points ?? -1))
    : predictions;

  return (
    <div className="card">
      <h3 className="font-display font-bold text-lg text-white tracking-wide mb-4 flex items-center gap-2">
        {isFinished ? <Trophy size={16} className="text-gold-400" /> : <Users size={16} className="text-gray-400" />}
        PRONOSTICS ({predictions.length})
      </h3>

      <div className="space-y-2">
        {sorted.map((p, index) => {
          const isCurrentUser = p.user_id === currentUserId;
          const points = p.points;
          const isWinner = isFinished && points === 5;

          return (
            <div
              key={p.id}
              className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors ${
                isWinner
                  ? "bg-gold-500/10 border border-gold-500/30"
                  : isCurrentUser
                  ? "bg-pitch-900/30 border border-pitch-700/40"
                  : "bg-surface-700/50"
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isFinished && (
                  <span className="text-xs text-gray-500 w-5 text-center shrink-0">
                    {isWinner ? "🏆" : index + 1}
                  </span>
                )}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isCurrentUser ? "bg-pitch-600 text-white" : "bg-surface-500 text-gray-300"
                }`}>
                  {p.profile?.pseudo?.[0]?.toUpperCase() ?? "?"}
                </div>
                <span className={`text-sm font-medium truncate ${
                  isCurrentUser ? "text-pitch-300" : "text-gray-300"
                }`}>
                  {p.profile?.pseudo ?? "Inconnu"}
                  {isCurrentUser && <span className="ml-1.5 text-xs text-gray-500">(toi)</span>}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center">
                  <div className="font-display font-bold text-white text-base">
                    {p.home_score} – {p.away_score}
                  </div>
                </div>

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

                {isFinished && points !== null && points !== undefined && (
                  <div className={`points-badge points-${points}`}>
                    {points}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isFinished && (
        <div className="mt-4 pt-3 border-t border-surface-700 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gold-400" />Score exact (5pts)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pitch-500" />Bon vainqueur (3pts)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />Bon nul (2pts)</span>
        </div>
      )}
    </div>
  );
}