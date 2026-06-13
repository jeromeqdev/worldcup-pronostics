"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Match, Prediction } from "@/types";
import { getPredictedWinner } from "@/lib/utils";
import toast from "react-hot-toast";
import { Lock, Save, Edit3 } from "lucide-react";

interface Props {
  match: Match;
  userId: string;
  existingPrediction: Prediction | null;
  allowPredict: boolean;
}

export function PredictionForm({ match, userId, existingPrediction, allowPredict }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [homeScore, setHomeScore] = useState<string>(existingPrediction?.home_score?.toString() ?? "");
  const [awayScore, setAwayScore] = useState<string>(existingPrediction?.away_score?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(!existingPrediction);

  const isElimination = match.phase !== "group";
  const homeNum = parseInt(homeScore);
  const awayNum = parseInt(awayScore);
  const validScores = !isNaN(homeNum) && !isNaN(awayNum) && homeNum >= 0 && awayNum >= 0;
  const eliminationDrawError = isElimination && validScores && homeNum === awayNum;
  const predictedWinner = validScores ? getPredictedWinner(homeNum, awayNum) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validScores || eliminationDrawError) return;
    setLoading(true);
    const payload = { user_id: userId, match_id: match.id, home_score: homeNum, away_score: awayNum };
    let error;
    if (existingPrediction) {
      ({ error } = await supabase.from("predictions").update(payload).eq("id", existingPrediction.id));
    } else {
      ({ error } = await supabase.from("predictions").insert(payload));
    }
    setLoading(false);
    if (error) {
      toast.error("Erreur lors de la sauvegarde");
      return;
    }
    toast.success(existingPrediction ? "Pronostic modifié !" : "Pronostic enregistré !");
    setEditing(false);
    router.refresh();
  };

  if (!allowPredict && !existingPrediction) return null;

  return (
    <div className="card border-pitch-700/50">
      <h3 className="font-display font-bold text-lg text-white tracking-wide mb-4 flex items-center gap-2">
        {allowPredict ? <><Edit3 size={16} className="text-pitch-400" />MON PRONOSTIC</> : <><Lock size={16} className="text-gray-500" />MON PRONOSTIC <span className="text-xs font-body text-gray-500 font-normal">(verrouillé)</span></>}
      </h3>
      {!editing && existingPrediction ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-sm text-gray-400">{match.home_team?.name}</span>
            <div className="font-display font-bold text-3xl text-white">{existingPrediction.home_score} – {existingPrediction.away_score}</div>
            <span className="text-sm text-gray-400">{match.away_team?.name}</span>
          </div>
          {existingPrediction.points !== null && existingPrediction.points !== undefined ? (
            <div className={`points-badge points-${existingPrediction.points}`}>{existingPrediction.points}</div>
          ) : allowPredict ? (
            <button onClick={() => setEditing(true)} className="btn-ghost text-sm">Modifier</button>
          ) : null}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center flex-1">
              <div className="text-sm text-gray-400 mb-2">{match.home_team?.name}</div>
              <input type="number" min="0" max="99" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} className="score-input" placeholder="0" required />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-display font-bold text-2xl text-gray-500">–</span>
              {validScores && !eliminationDrawError && (
                <span className="text-xs text-gray-400 font-medium">
                  {predictedWinner === "home" ? `→ ${match.home_team?.name}` : predictedWinner === "away" ? `→ ${match.away_team?.name}` : "Match nul"}
                </span>
              )}
              {eliminationDrawError && <span className="text-xs text-red-400 text-center">Nul interdit<br />en éliminatoire</span>}
            </div>
            <div className="text-center flex-1">
              <div className="text-sm text-gray-400 mb-2">{match.away_team?.name}</div>
              <input type="number" min="0" max="99" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} className="score-input" placeholder="0" required />
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 bg-surface-700 rounded-lg p-2">
            🏆 Score exact : <strong className="text-gold-400">5 pts</strong> · Bon vainqueur : <strong className="text-pitch-400">3 pts</strong> · Bon nul : <strong className="text-blue-400">2 pts</strong>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading || !validScores || eliminationDrawError} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
              {existingPrediction ? "Modifier" : "Valider"}
            </button>
            {existingPrediction && <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Annuler</button>}
          </div>
        </form>
      )}
    </div>
  );
}
