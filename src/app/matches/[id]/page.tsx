import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Match, Prediction, Profile } from "@/types";
import { PHASE_LABELS } from "@/types";
import { formatKickoff, canPredict } from "@/lib/utils";
import { MapPin, Calendar, Users } from "lucide-react";
import { PredictionForm } from "@/components/predictions/PredictionForm";
import { PredictionsList } from "@/components/predictions/PredictionsList";

export const revalidate = 30;

interface PageProps {
  params: Promise<{ id: string }>;
}

function TeamBig({ name, code }: { name?: string; code?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      {code && <img src={`https://flagcdn.com/64x48/${code.toLowerCase().replace("gb-eng","gb")}.png`} alt={code} width={64} height={48} className="rounded object-cover shadow-lg" />}
      <span className="font-display font-bold text-lg text-white text-center leading-tight">{name ?? "—"}</span>
    </div>
  );
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: matchData } = await supabase.from("matches").select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*), stadium:stadiums(*), group:groups(*)").eq("id", id).single();
  if (!matchData) notFound();
  const match = matchData as Match;

  let userPrediction: Prediction | null = null;
  if (user) {
    const { data } = await supabase.from("predictions").select("*").eq("match_id", id).eq("user_id", user.id).single();
    userPrediction = data;
  }

  const { data: allPredictions } = await supabase.from("predictions").select("*, profile:profiles(*)").eq("match_id", id).order("created_at", { ascending: false });
  const predictions = (allPredictions ?? []) as (Prediction & { profile: Profile })[];
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";
  const allowPredict = canPredict(match);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-500 uppercase tracking-widest">
            {PHASE_LABELS[match.phase]}{match.group ? ` · Groupe ${match.group.name}` : ""}
          </span>
          {isLive ? (
            <span className="badge-live flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 live-dot" />En cours</span>
          ) : isFinished ? (
            <span className="badge-finished">Terminé</span>
          ) : (
            <span className="badge-upcoming">À venir</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 py-4">
          <TeamBig name={match.home_team?.name} code={match.home_team?.country_code} />
          <div className="text-center shrink-0">
            {isFinished || isLive ? (
              <div className="font-display font-bold text-5xl text-white tracking-wider">
                {match.home_score ?? "–"} <span className="text-gray-500">–</span> {match.away_score ?? "–"}
              </div>
            ) : (
              <div className="font-display text-3xl text-gray-500 font-bold tracking-widest">VS</div>
            )}
          </div>
          <TeamBig name={match.away_team?.name} code={match.away_team?.country_code} />
        </div>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1"><Calendar size={12} />{formatKickoff(match.kickoff_time)}</span>
          {match.stadium && <span className="flex items-center gap-1"><MapPin size={12} />{match.stadium.name}, {match.stadium.city}</span>}
          <span className="flex items-center gap-1"><Users size={12} />{predictions.length} pronostic{predictions.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {user ? (
        (allowPredict || userPrediction) ? (
          <PredictionForm match={match} userId={user.id} existingPrediction={userPrediction} allowPredict={allowPredict} />
        ) : null
      ) : (
        <div className="card text-center py-6">
          <p className="text-gray-400 mb-3">Connecte-toi pour soumettre ton pronostic</p>
          <a href="/auth/login" className="btn-primary inline-block">Se connecter</a>
        </div>
      )}

      <PredictionsList predictions={predictions} match={match} currentUserId={user?.id} />
    </div>
  );
}
