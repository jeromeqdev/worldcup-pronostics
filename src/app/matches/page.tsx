
import { createClient } from "@/lib/supabase/server";
import type { Match, MatchPhase } from "@/types";
import { PHASE_LABELS } from "@/types";
import Link from "next/link";
import { formatTimeFr, formatDateFr, canPredict } from "@/lib/utils";
import { MapPin, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Countdown } from "@/components/ui/Countdown";

export const revalidate = 30;

const PHASE_ORDER: MatchPhase[] = ["group","round_of_16","quarter_final","semi_final","third_place","final"];

function FlagImg({ code }: { code?: string }) {
  if (!code) return null;
  return <img src={`https://flagcdn.com/24x18/${code.toLowerCase().replace("gb-eng","gb").replace("gb-sct","gb")}.png`} alt={code} width={24} height={18} className="rounded-sm" />;
}

function MatchCard({ match: m, hasPrediction }: { match: Match; hasPrediction: boolean }) {
  const isFinished = m.status === "finished";
  const isLive = m.status === "live";
  const predictable = canPredict(m);

  return (
    <Link href={`/matches/${m.id}`} className="card-hover block relative">
      {!isFinished && (
        <div className="absolute -top-1.5 -right-1.5">
          {hasPrediction ? (
            <div className="bg-pitch-600 rounded-full p-0.5 shadow-lg" title="Pronostic soumis">
              <CheckCircle2 size={16} className="text-white" />
            </div>
          ) : predictable ? (
            <div className="bg-gold-500 rounded-full p-0.5 shadow-lg animate-pulse" title="Pronostic manquant">
              <AlertCircle size={16} className="text-surface-900" />
            </div>
          ) : null}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-24 shrink-0 text-center">
          {isFinished ? (
            <div className="font-display font-bold text-xl text-white">{m.home_score} - {m.away_score}</div>
          ) : isLive ? (
            <span className="badge-live flex items-center gap-1 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-dot" />Live
            </span>
          ) : (
            <div className="font-bold text-pitch-400 text-sm">{formatTimeFr(m.kickoff_time)}</div>
          )}
          {!isFinished && !isLive && predictable && (
            <div className="mt-1 flex justify-center">
              <Countdown kickoffTime={m.kickoff_time} />
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center gap-2 justify-center">
          <div className="flex items-center gap-2 flex-row-reverse">
            {m.home_team?.country_code && <FlagImg code={m.home_team.country_code} />}
            <span className="text-sm font-semibold text-gray-200 truncate max-w-[80px]">{m.home_team?.name ?? "—"}</span>
          </div>
          <span className="text-gray-600 text-xs font-bold">VS</span>
          <div className="flex items-center gap-2">
            {m.away_team?.country_code && <FlagImg code={m.away_team.country_code} />}
            <span className="text-sm font-semibold text-gray-200 truncate max-w-[80px]">{m.away_team?.name ?? "—"}</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 w-24 shrink-0 justify-end">
          <MapPin size={11} />
          <span className="truncate">{m.stadium?.city}</span>
        </div>
        <ChevronRight size={14} className="text-gray-600 shrink-0" />
      </div>
    </Link>
  );
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  const { vue = "chrono" } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("matches")
    .select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*), stadium:stadiums(*), group:groups(*)")
    .order("kickoff_time", { ascending: true });
  const matches = (data ?? []) as Match[];

  let predictedMatchIds = new Set<string>();
  if (user) {
    const { data: predictions } = await supabase
      .from("predictions")
      .select("match_id")
      .eq("user_id", user.id);
    predictedMatchIds = new Set((predictions ?? []).map((p) => p.match_id));
  }

  const upcomingMatches = matches.filter((m) => m.status === "upcoming");
  const predictedCount = upcomingMatches.filter((m) => predictedMatchIds.has(m.id)).length;
  const missingCount = upcomingMatches.filter((m) => canPredict(m) && !predictedMatchIds.has(m.id)).length;

  const byDate = matches.reduce((acc, m) => {
    const date = formatDateFr(m.kickoff_time);
    if (!acc[date]) acc[date] = [];
    acc[date].push(m);
    return acc;
  }, {} as Record<string, Match[]>);

  const byPhase = PHASE_ORDER.reduce((acc, phase) => {
    const phaseMatches = matches.filter((m) => m.phase === phase);
    if (phaseMatches.length > 0) acc[phase] = phaseMatches;
    return acc;
  }, {} as Record<MatchPhase, Match[]>);

  const byGroup = (byPhase.group ?? []).reduce((acc, m) => {
    const key = m.group?.name ?? "?";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold text-white tracking-wide">MATCHS</h1>
          <p className="text-gray-500 text-sm mt-1">{matches.length} matchs · heures françaises</p>
        </div>
        <div className="flex gap-2 bg-surface-800 border border-surface-600 rounded-lg p-1">
          <Link href="?vue=chrono" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${vue === "chrono" ? "bg-pitch-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>
            📅 Par date
          </Link>
          <Link href="?vue=groupe" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${vue === "groupe" ? "bg-pitch-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>
            🏆 Par groupe
          </Link>
        </div>
      </div>

      {user && (
        <div className="card flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-pitch-400" />
            <span className="text-sm text-gray-300">
              <strong className="text-pitch-400">{predictedCount}</strong> pronostic{predictedCount !== 1 ? "s" : ""} soumis
            </span>
          </div>
          {missingCount > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-gold-400" />
              <span className="text-sm text-gray-300">
                <strong className="text-gold-400">{missingCount}</strong> match{missingCount !== 1 ? "s" : ""} en attente de pronostic
              </span>
            </div>
          )}
          {missingCount === 0 && upcomingMatches.length > 0 && (
            <span className="text-sm text-pitch-400 font-medium">🎉 Tu es à jour sur tous tes pronostics !</span>
          )}
        </div>
      )}

      {vue === "chrono" && (
        <div className="space-y-6">
          {Object.entries(byDate).map(([date, dayMatches]) => (
            <section key={date}>
              <h2 className="font-display text-lg font-bold text-pitch-400 mb-3 border-b border-surface-600 pb-2 capitalize">
                {date}
              </h2>
              <div className="space-y-2">
                {dayMatches.map((m) => <MatchCard key={m.id} match={m} hasPrediction={predictedMatchIds.has(m.id)} />)}
              </div>
            </section>
          ))}
        </div>
      )}

      {vue === "groupe" && (
        <div className="space-y-8">
          {Object.keys(byGroup).length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold text-pitch-400 mb-4 border-b border-surface-600 pb-2">PHASE DE GROUPES</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(byGroup).sort(([a],[b]) => a.localeCompare(b)).map(([groupName, groupMatches]) => (
                  <div key={groupName}>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">Groupe {groupName}</h3>
                    <div className="space-y-2">{groupMatches.map((m) => <MatchCard key={m.id} match={m} hasPrediction={predictedMatchIds.has(m.id)} />)}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {PHASE_ORDER.filter((p) => p !== "group").map((phase) => {
            const phaseMatches = byPhase[phase];
            if (!phaseMatches) return null;
            return (
              <section key={phase}>
                <h2 className="font-display text-2xl font-bold text-gold-400 mb-4 border-b border-surface-600 pb-2">{PHASE_LABELS[phase].toUpperCase()}</h2>
                <div className="space-y-2 max-w-xl">{phaseMatches.map((m) => <MatchCard key={m.id} match={m} hasPrediction={predictedMatchIds.has(m.id)} />)}</div>
              </section>
            );
          })}
        </div>
      )}

      {matches.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">📅</div>
          <p>Aucun match programmé pour le moment.</p>
        </div>
      )}
    </div>
  );
}