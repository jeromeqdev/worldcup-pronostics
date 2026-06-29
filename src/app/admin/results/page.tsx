"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatKickoff } from "@/lib/utils";
import toast from "react-hot-toast";
import { Save, Loader, AlertTriangle } from "lucide-react";

interface MatchRow {
  id: string;
  match_number: number;
  kickoff_time: string;
  status: string;
  phase: string;
  home_score?: number;
  away_score?: number;
  penalty_winner?: string;
  home_team?: { name: string; country_code: string };
  away_team?: { name: string; country_code: string };
}

const KNOCKOUT_PHASES = ["round_of_16", "quarter_final", "semi_final", "third_place", "final"];

export default function AdminResultsPage() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, { home: string; away: string; status: string; penalty_winner: string }>>({});
  const supabase = createClient();

  const fetchMatches = async () => {
    const { data } = await supabase
      .from("matches")
      .select("*, home_team:teams!home_team_id(name, country_code), away_team:teams!away_team_id(name, country_code)")
      .order("kickoff_time", { ascending: true });
    const list = (data ?? []) as MatchRow[];
    setMatches(list);
    const init: typeof editData = {};
    list.forEach((m) => {
      init[m.id] = {
        home: m.home_score?.toString() ?? "",
        away: m.away_score?.toString() ?? "",
        status: m.status,
        penalty_winner: m.penalty_winner ?? "",
      };
    });
    setEditData(init);
    setLoading(false);
  };

  useEffect(() => { fetchMatches(); }, []);

  useEffect(() => {
    if (!loading && matches.length > 0) {
      const el = document.getElementById("a-saisir");
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
      }
    }
  }, [loading, matches.length]);

  const handleSave = async (matchId: string) => {
    const ed = editData[matchId];
    if (!ed) return;
    setSaving(matchId);

    const homeScore = ed.home === "" ? null : parseInt(ed.home);
    const awayScore = ed.away === "" ? null : parseInt(ed.away);

    // TAB uniquement si égalité en phase éliminatoire
    const isKnockout = KNOCKOUT_PHASES.includes(matches.find(m => m.id === matchId)?.phase ?? "");
    const isDrawn = homeScore !== null && awayScore !== null && homeScore === awayScore;
    const penaltyWinner = (isKnockout && isDrawn && ed.penalty_winner) ? ed.penalty_winner : null;

    const { error } = await supabase
      .from("matches")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        penalty_winner: penaltyWinner,
        status: ed.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", matchId);

    setSaving(null);
    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Résultat enregistré !");
      fetchMatches();
    }
  };

  const update = (
    matchId: string,
    field: "home" | "away" | "status" | "penalty_winner",
    value: string
  ) => {
    setEditData((prev) => ({ ...prev, [matchId]: { ...prev[matchId], [field]: value } }));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="animate-spin text-pitch-400" />
      </div>
    );

  const now = new Date();
  const nextToFill = matches.find((m) => m.status !== "finished" && new Date(m.kickoff_time) <= now);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold text-white tracking-wide">RÉSULTATS OFFICIELS</h1>
        <p className="text-gray-500 text-sm mt-1">Le classement se recalcule automatiquement à chaque sauvegarde.</p>
      </div>
      <div className="space-y-3">
        {matches.map((m) => {
          const ed = editData[m.id];
          if (!ed) return null;
          const isSaving = saving === m.id;
          const isNextToFill = nextToFill?.id === m.id;
          const isKnockout = KNOCKOUT_PHASES.includes(m.phase);
          const homeVal = ed.home === "" ? null : parseInt(ed.home);
          const awayVal = ed.away === "" ? null : parseInt(ed.away);
          const showPenalty = isKnockout && homeVal !== null && awayVal !== null && homeVal === awayVal;

          return (
            <div key={m.id} id={isNextToFill ? "a-saisir" : undefined}>
              {isNextToFill && (
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-gold-400 uppercase tracking-widest">
                  <AlertTriangle size={13} />
                  Résultat à saisir
                </div>
              )}
              <div className={`card ${isNextToFill ? "ring-2 ring-gold-500 ring-offset-2 ring-offset-surface-900" : ""}`}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-1">
                      Match #{m.match_number} · {formatKickoff(m.kickoff_time)}
                    </div>
                    <div className="font-semibold text-gray-200">
                      {m.home_team?.name} vs {m.away_team?.name}
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex items-center gap-3">
                    <input
                      type="number" min="0" value={ed.home}
                      onChange={(e) => update(m.id, "home", e.target.value)}
                      className="score-input w-12" placeholder="–"
                    />
                    <span className="text-gray-500 font-bold">–</span>
                    <input
                      type="number" min="0" value={ed.away}
                      onChange={(e) => update(m.id, "away", e.target.value)}
                      className="score-input w-12" placeholder="–"
                    />
                  </div>

                  {/* Tirs au but — visible uniquement si égalité en phase éliminatoire */}
                  {showPenalty && (
                    <div className="flex items-center gap-2 bg-surface-800 border border-yellow-500/40 rounded-lg px-3 py-1.5">
                      <span className="text-xs text-yellow-400 font-bold uppercase tracking-wide whitespace-nowrap">TAB</span>
                      <button
                        type="button"
                        onClick={() => update(m.id, "penalty_winner", "home")}
                        className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                          ed.penalty_winner === "home"
                            ? "bg-blue-600 text-white"
                            : "bg-surface-700 text-gray-400 hover:bg-surface-600"
                        }`}
                      >
                        {m.home_team?.name ?? "Dom."}
                      </button>
                      <button
                        type="button"
                        onClick={() => update(m.id, "penalty_winner", "away")}
                        className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                          ed.penalty_winner === "away"
                            ? "bg-blue-600 text-white"
                            : "bg-surface-700 text-gray-400 hover:bg-surface-600"
                        }`}
                      >
                        {m.away_team?.name ?? "Ext."}
                      </button>
                    </div>
                  )}

                  <select
                    value={ed.status}
                    onChange={(e) => update(m.id, "status", e.target.value)}
                    className="input w-auto text-sm"
                  >
                    <option value="upcoming">À venir</option>
                    <option value="live">En cours</option>
                    <option value="finished">Terminé</option>
                  </select>

                  <button
                    onClick={() => handleSave(m.id)}
                    disabled={isSaving}
                    className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-sm"
                  >
                    {isSaving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                    <span className="hidden sm:inline">Sauvegarder</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
