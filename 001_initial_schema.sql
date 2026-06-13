"use client";
// src/app/admin/results/page.tsx — Saisie des résultats officiels

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Match } from "@/types";
import { formatKickoff } from "@/lib/utils";
import toast from "react-hot-toast";
import { Save, CheckCircle, Loader } from "lucide-react";

interface MatchRow extends Match {
  home_team?: { name: string; country_code: string };
  away_team?: { name: string; country_code: string };
}

export default function AdminResultsPage() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, { home: string; away: string; status: string }>>({});
  const supabase = createClient();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    const { data } = await supabase
      .from("matches")
      .select("*, home_team:teams!home_team_id(name, country_code), away_team:teams!away_team_id(name, country_code)")
      .order("kickoff_time", { ascending: true });

    const list = (data ?? []) as MatchRow[];
    setMatches(list);

    // Initialiser les valeurs d'édition
    const init: typeof editData = {};
    list.forEach((m) => {
      init[m.id] = {
        home: m.home_score?.toString() ?? "",
        away: m.away_score?.toString() ?? "",
        status: m.status,
      };
    });
    setEditData(init);
    setLoading(false);
  };

  const handleSave = async (matchId: string) => {
    const ed = editData[matchId];
    if (!ed) return;

    setSaving(matchId);

    const homeScore = ed.home === "" ? null : parseInt(ed.home);
    const awayScore = ed.away === "" ? null : parseInt(ed.away);

    const { error } = await supabase
      .from("matches")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: ed.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", matchId);

    setSaving(null);

    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Résultat enregistré — classement recalculé !");
      fetchMatches();
    }
  };

  const update = (matchId: string, field: "home" | "away" | "status", value: string) => {
    setEditData((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [field]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="animate-spin text-pitch-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold text-white tracking-wide">
          RÉSULTATS OFFICIELS
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Le classement se recalcule automatiquement à chaque sauvegarde.
        </p>
      </div>

      <div className="space-y-3">
        {matches.map((m) => {
          const ed = editData[m.id];
          if (!ed) return null;
          const isSaving = saving === m.id;
          const hasScore = ed.home !== "" && ed.away !== "";

          return (
            <div key={m.id} className="card">
              <div className="flex flex-wrap items-center gap-4">
                {/* Infos match */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">
                    Match #{m.match_number} · {formatKickoff(m.kickoff_time)}
                  </div>
                  <div className="font-semibold text-gray-200 flex items-center gap-2">
                    <FlagImg code={m.home_team?.country_code} />
                    {m.home_team?.name}
                    <span className="text-gray-600">vs</span>
                    {m.away_team?.name}
                    <FlagImg code={m.away_team?.country_code} />
                  </div>
                </div>

                {/* Saisie scores */}
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    value={ed.home}
                    onChange={(e) => update(m.id, "home", e.target.value)}
                    className="score-input w-12"
                    placeholder="–"
                  />
                  <span className="text-gray-500 font-bold">–</span>
                  <input
                    type="number"
                    min="0"
                    value={ed.away}
                    onChange={(e) => update(m.id, "away", e.target.value)}
                    className="score-input w-12"
                    placeholder="–"
                  />
                </div>

                {/* Statut */}
                <select
                  value={ed.status}
                  onChange={(e) => update(m.id, "status", e.target.value)}
                  className="input w-auto text-sm"
                >
                  <option value="upcoming">À venir</option>
                  <option value="live">En cours</option>
                  <option value="finished">Terminé</option>
                </select>

                {/* Bouton sauvegarder */}
                <button
                  onClick={() => handleSave(m.id)}
                  disabled={isSaving}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    m.status === "finished" && m.home_score !== null
                      ? "bg-pitch-900/30 text-pitch-400 border border-pitch-700/40 hover:bg-pitch-800/40"
                      : "btn-primary"
                  }`}
                >
                  {isSaving ? (
                    <Loader size={14} className="animate-spin" />
                  ) : m.status === "finished" && hasScore ? (
                    <CheckCircle size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  <span className="hidden sm:inline">
                    {isSaving ? "..." : "Sauvegarder"}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FlagImg({ code }: { code?: string }) {
  if (!code) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/20x15/${code.toLowerCase().replace("gb-eng", "gb")}.png`}
      alt={code}
      width={20}
      height={15}
      className="rounded-sm inline"
    />
  );
}
