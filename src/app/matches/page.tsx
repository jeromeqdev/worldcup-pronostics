import { createClient } from "@/lib/supabase/server";
import type { Match, MatchPhase } from "@/types";
import { PHASE_LABELS } from "@/types";
import Link from "next/link";
import { formatKickoff } from "@/lib/utils";
import { MapPin, ChevronRight } from "lucide-react";

export const revalidate = 30;

const PHASE_ORDER: MatchPhase[] = ["group","round_of_16","quarter_final","semi_final","third_place","final"];

function FlagImg({ code }: { code?: string }) {
  if (!code) return null;
  return <img src={`https://flagcdn.com/24x18/${code.toLowerCase().replace("gb-eng","gb")}.png`} alt={code} width={24} height={18} className="rounded-sm" />;
}

function TeamDisplay({ name, code, align }: { name?: string; code?: string; align: "left" | "right" }) {
  return (
    <div className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}>
      {code && <FlagImg code={code} />}
      <span className="text-sm font-semibold text-gray-200 truncate max-w-[80px]">{name ?? "—"}</span>
    </div>
  );
}

function MatchCard({ match: m }: { match: Match }) {
  const isFinished = m.status === "finished";
  const isLive = m.status === "live";
  return (
    <Link href={`/matches/${m.id}`} className="card-hover block">
      <div className="flex items-center gap-3">
        <div className="w-20 shrink-0 text-center">
          {isFinished ? (
            <div className="font-display font-bold text-xl text-white">{m.home_score} - {m.away_score}</div>
          ) : isLive ? (
            <span className="badge-live flex items-center gap-1 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-dot" />Live
            </span>
          ) : (
            <div className="text-xs text-gray-400">{formatKickoff(m.kickoff_time).split("•")[1]?.trim()}</div>
          )}
          <div className="text-xs text-gray-600 mt-0.5">{formatKickoff(m.kickoff_time).split("•")[0]?.trim()}</div>
        </div>
        <div className="flex-1 flex items-center gap-2 justify-center">
          <TeamDisplay name={m.home_team?.name} code={m.home_team?.country_code} align="right" />
          <span className="text-gray-600 text-xs font-bold">VS</span>
          <TeamDisplay name={m.away_team?.name} code={m.away_team?.country_code} align="left" />
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

export default async function MatchesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("matches").select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*), stadium:stadiums(*), group:groups(*)").order("kickoff_time", { ascending: true });
  const matches = (data ?? []) as Match[];
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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-4xl font-bold text-white tracking-wide">MATCHS</h1>
        <p className="text-gray-500 text-sm mt-1">{matches.length} matchs au programme</p>
      </div>
      {Object.keys(byGroup).length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold text-pitch-400 mb-4 border-b border-surface-600 pb-2">PHASE DE GROUPES</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(byGroup).sort(([a],[b]) => a.localeCompare(b)).map(([groupName, groupMatches]) => (
              <div key={groupName}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">Groupe {groupName}</h3>
                <div className="space-y-2">{groupMatches.map((m) => <MatchCard key={m.id} match={m} />)}</div>
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
            <div className="space-y-2 max-w-xl">{phaseMatches.map((m) => <MatchCard key={m.id} match={m} />)}</div>
          </section>
        );
      })}
      {matches.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">📅</div>
          <p>Aucun match programmé pour le moment.</p>
        </div>
      )}
    </div>
  );
}
