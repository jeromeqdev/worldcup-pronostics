"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Match, Team, Stadium, Group } from "@/types";
import { PHASE_LABELS } from "@/types";
import { formatKickoff } from "@/lib/utils";
import toast from "react-hot-toast";
import { Plus, Loader, Edit2, Trash2, X, Save, AlertTriangle } from "lucide-react";

interface MatchForm {
  match_number: string; phase: string; group_id: string; home_team_id: string;
  away_team_id: string; stadium_id: string; kickoff_time: string; status: string;
  home_score: string; away_score: string;
}

const EMPTY_FORM: MatchForm = { match_number: "", phase: "group", group_id: "", home_team_id: "", away_team_id: "", stadium_id: "", kickoff_time: "", status: "upcoming", home_score: "", away_score: "" };

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MatchForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const fetchAll = async () => {
    const [{ data: matchData },{ data: teamData },{ data: stadiumData },{ data: groupData }] = await Promise.all([
      supabase.from("matches").select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*), stadium:stadiums(*), group:groups(*)").order("kickoff_time"),
      supabase.from("teams").select("*").order("name"),
      supabase.from("stadiums").select("*").order("name"),
      supabase.from("groups").select("*").order("name"),
    ]);
    setMatches((matchData ?? []) as Match[]);
    setTeams((teamData ?? []) as Team[]);
    setStadiums((stadiumData ?? []) as Stadium[]);
    setGroups((groupData ?? []) as Group[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Scroll automatique vers le premier match à saisir au chargement
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      match_number: parseInt(form.match_number),
      phase: form.phase,
      group_id: form.group_id || null,
      home_team_id: form.home_team_id,
      away_team_id: form.away_team_id,
      stadium_id: form.stadium_id,
      kickoff_time: new Date(form.kickoff_time).toISOString(),
      status: form.status,
      home_score: form.home_score === "" ? null : parseInt(form.home_score),
      away_score: form.away_score === "" ? null : parseInt(form.away_score),
    };
    let error;
    if (editingId) { ({ error } = await supabase.from("matches").update(payload).eq("id", editingId)); }
    else { ({ error } = await supabase.from("matches").insert(payload)); }
    setSaving(false);
    if (error) { toast.error("Erreur : " + error.message); } else { toast.success(editingId ? "Match modifié" : "Match créé"); setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); fetchAll(); }
  };

  const startEdit = (m: Match) => {
    setEditingId(m.id);
    setForm({
      match_number: m.match_number.toString(),
      phase: m.phase,
      group_id: m.group_id ?? "",
      home_team_id: m.home_team_id,
      away_team_id: m.away_team_id,
      stadium_id: m.stadium_id,
      kickoff_time: new Date(m.kickoff_time).toISOString().slice(0,16),
      status: m.status,
      home_score: m.home_score?.toString() ?? "",
      away_score: m.away_score?.toString() ?? "",
    });
    setShowForm(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  const handleDelete = async (id: string, num: number) => {
    if (!confirm(`Supprimer le match #${num} ?`)) return;
    const { error } = await supabase.from("matches").delete().eq("id", id);
    if (error) { toast.error("Erreur : " + error.message); } else { toast.success("Match supprimé"); fetchAll(); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader size={24} className="animate-spin text-pitch-400" /></div>;

  // Le premier match dont l'heure est passée mais qui n'est pas encore "finished"
  const now = new Date();
  const nextToFill = matches.find((m) => m.status !== "finished" && new Date(m.kickoff_time) <= now) 
  ?? matches.find((m) => m.status === "upcoming" && (m.home_team as Team)?.country_code === "tbd");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-white tracking-wide">MATCHS</h1>
          <p className="text-gray-500 text-sm">{matches.length} matchs au programme</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="card border-pitch-700/50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-white">{editingId ? "Modifier le match" : "Nouveau match"}</h3>
            <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Numéro", name: "match_number", type: "number" },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                <input type={type} required value={form[name as keyof MatchForm]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="input" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Phase</label>
              <select value={form.phase} onChange={(e) => setForm({ ...form, phase: e.target.value })} className="input">
                {Object.entries(PHASE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Groupe</label>
              <select value={form.group_id} onChange={(e) => setForm({ ...form, group_id: e.target.value })} className="input">
                <option value="">— Aucun —</option>
                {groups.map((g) => <option key={g.id} value={g.id}>Groupe {g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Équipe domicile</label>
              <select required value={form.home_team_id} onChange={(e) => setForm({ ...form, home_team_id: e.target.value })} className="input">
                <option value="">Sélectionner...</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Équipe extérieur</label>
              <select required value={form.away_team_id} onChange={(e) => setForm({ ...form, away_team_id: e.target.value })} className="input">
                <option value="">Sélectionner...</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Stade</label>
              <select required value={form.stadium_id} onChange={(e) => setForm({ ...form, stadium_id: e.target.value })} className="input">
                <option value="">Sélectionner...</option>
                {stadiums.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.city})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date et heure</label>
              <input type="datetime-local" required value={form.kickoff_time} onChange={(e) => setForm({ ...form, kickoff_time: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Statut</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                <option value="upcoming">À venir</option>
                <option value="live">En cours</option>
                <option value="finished">Terminé</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Score domicile</label>
              <input type="number" min="0" value={form.home_score} onChange={(e) => setForm({ ...form, home_score: e.target.value })} className="input" placeholder="—" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Score extérieur</label>
              <input type="number" min="0" value={form.away_score} onChange={(e) => setForm({ ...form, away_score: e.target.value })} className="input" placeholder="—" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader size={15} className="animate-spin" /> : <Save size={15} />}
                {editingId ? "Enregistrer" : "Créer le match"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {matches.map((m) => {
          const isNextToFill = nextToFill?.id === m.id;
          return (
            <div key={m.id} id={isNextToFill ? "a-saisir" : undefined}>
              {isNextToFill && (
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-gold-400 uppercase tracking-widest">
                  <AlertTriangle size={13} />
                  Résultat à saisir
                </div>
              )}
              <div className={`card flex items-center gap-4 ${isNextToFill ? "ring-2 ring-gold-500 ring-offset-2 ring-offset-surface-900" : ""}`}>
                <div className="w-10 text-center text-gray-500 font-display font-bold">#{m.match_number}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-200">
                    {(m.home_team as Team)?.name ?? "?"} vs {(m.away_team as Team)?.name ?? "?"}
                    {m.status === "finished" && (
                      <span className="ml-2 text-gray-400">({m.home_score} - {m.away_score})</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{formatKickoff(m.kickoff_time)} · {(m.stadium as Stadium)?.city}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === "finished" ? "badge-finished" : m.status === "live" ? "badge-live" : "badge-upcoming"}`}>
                  {m.status === "finished" ? "Terminé" : m.status === "live" ? "Live" : "À venir"}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(m)} className="btn-ghost p-1.5"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(m.id, m.match_number)} className="btn-ghost p-1.5 text-red-400 hover:text-red-300"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}