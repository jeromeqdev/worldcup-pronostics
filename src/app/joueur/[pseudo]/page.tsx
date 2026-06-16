import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Prediction, Match, Profile, Ranking } from "@/types";
import { formatKickoffFr } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Trophy, Target, Star, TrendingUp } from "lucide-react";

export const revalidate = 30;

interface PageProps {
  params: Promise<{ pseudo: string }>;
}

export default async function PlayerPage({ params }: PageProps) {
  const { pseudo } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("pseudo", pseudo)
    .single();

  if (!profile) notFound();

  const { data: ranking } = await supabase
    .from("rankings")
    .select("*")
    .eq("user_id", profile.id)
    .single();

  const { data: predictionsData } = await supabase
    .from("predictions")
    .select("*, match:matches(*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*))")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const predictions = (predictionsData ?? []) as (Prediction & { match: Match })[];
  const r = ranking as Ranking | null;

  const finishedPredictions = predictions.filter((p) => p.match?.status === "finished");
  const pendingPredictions = predictions.filter((p) => p.match?.status !== "finished");

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Link href="/ranking" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors text-sm">
        <ArrowLeft size={16} />
        Retour au classement
      </Link>

      {/* En-tête joueur */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-pitch-700 flex items-center justify-center text-2xl font-bold text-pitch-300">
          {profile.pseudo[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-white tracking-wide">{profile.pseudo}</h1>
          <p className="text-gray-500 text-sm">{profile.first_name} {profile.last_name}</p>
        </div>
        {r && (
          <div className="text-right">
            <div className="font-display text-4xl font-bold text-pitch-400">{r.total_points}</div>
            <div className="text-xs text-gray-500">points · rang #{r.rank}</div>
          </div>
        )}
      </div>

      {/* Stats résumé */}
      {r && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <Star size={16} className="text-gold-400 mx-auto mb-1" />
            <div className="font-display text-2xl font-bold text-gold-400">{r.exact_scores}</div>
            <div className="text-xs text-gray-500">Score exact</div>
          </div>
          <div className="card text-center">
            <TrendingUp size={16} className="text-pitch-400 mx-auto mb-1" />
            <div className="font-display text-2xl font-bold text-pitch-400">{r.correct_results}</div>
            <div className="text-xs text-gray-500">Bon vainqueur</div>
          </div>
          <div className="card text-center">
            <Target size={16} className="text-blue-400 mx-auto mb-1" />
            <div className="font-display text-2xl font-bold text-blue-400">{r.correct_draws}</div>
            <div className="text-xs text-gray-500">Bon nul</div>
          </div>
        </div>
      )}

      {/* Pronostics avec résultat */}
      {finishedPredictions.length > 0 && (
        <div className="card">
          <h2 className="font-display font-bold text-lg text-white tracking-wide mb-4 flex items-center gap-2">
            <Trophy size={16} className="text-gold-400" />
            HISTORIQUE DES POINTS
          </h2>
          <div className="space-y-2">
            {finishedPredictions.map((p) => {
              const m = p.match;
              const points = p.points ?? 0;
              return (
                <Link
                  key={p.id}
                  href={`/matches/${m.id}`}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors hover:opacity-80 ${
                    points === 5 ? "bg-gold-500/10 border border-gold-500/30" :
                    points === 3 ? "bg-pitch-900/20 border border-pitch-700/30" :
                    points === 2 ? "bg-blue-900/15 border border-blue-700/25" :
                    "bg-surface-700/50"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-200">
                      {m.home_team?.name} <span className="text-gray-500">vs</span> {m.away_team?.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Pronostic: {p.home_score}-{p.away_score} · Résultat: {m.home_score}-{m.away_score}
                    </div>
                  </div>
                  <div className={`points-badge points-${points} shrink-0`}>
                    {points}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Pronostics en attente */}
      {pendingPredictions.length > 0 && (
        <div className="card">
          <h2 className="font-display font-bold text-lg text-white tracking-wide mb-4">
            EN ATTENTE DE RÉSULTAT ({pendingPredictions.length})
          </h2>
          <div className="space-y-2">
            {pendingPredictions.map((p) => {
              const m = p.match;
              return (
                <Link key={p.id} href={`/matches/${m.id}`} className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-700/50 hover:opacity-80 transition-opacity">
                  <div className="text-sm text-gray-300">
                    {m.home_team?.name} <span className="text-gray-500">vs</span> {m.away_team?.name}
                  </div>
                  <div className="font-display font-bold text-white">
                    {p.home_score}-{p.away_score}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {predictions.length === 0 && (
        <div className="card text-center py-8 text-gray-500">
          <p>Aucun pronostic soumis pour le moment.</p>
        </div>
      )}
    </div>
  );
}