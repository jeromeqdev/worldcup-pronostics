import { createClient } from "@/lib/supabase/server";
import { formatKickoffShort } from "@/lib/utils";
import type { Match, Ranking, Profile } from "@/types";
import Link from "next/link";
import { Trophy, Users, Target, ChevronRight, Flame, Clock } from "lucide-react";

export const revalidate = 60;

async function getHomeData() {
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: predictionsCount },
    { data: topRankings },
    { data: upcomingMatches },
    { data: recentMatches },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("predictions").select("*", { count: "exact", head: true }),
    supabase.from("rankings").select("*, profile:profiles(*)").order("total_points", { ascending: false }).order("exact_scores", { ascending: false }).limit(5),
    supabase.from("matches").select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)").eq("status", "upcoming").order("kickoff_time", { ascending: true }).limit(3),
    supabase.from("matches").select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)").eq("status", "finished").order("kickoff_time", { ascending: false }).limit(3),
  ]);

  return {
    usersCount: usersCount ?? 0,
    predictionsCount: predictionsCount ?? 0,
    topRankings: (topRankings ?? []) as (Ranking & { profile: Profile })[],
    upcomingMatches: (upcomingMatches ?? []) as Match[],
    recentMatches: (recentMatches ?? []) as Match[],
  };
}

function FlagImg({ code }: { code?: string }) {
  if (!code) return <span className="w-5 h-4 bg-surface-600 rounded inline-block" />;
  return (
    <img
      src={`https://flagcdn.com/20x15/${code.toLowerCase().replace("gb-eng", "gb")}.png`}
      alt={code}
      width={20}
      height={15}
      className="rounded-sm object-cover"
    />
  );
}

export default async function HomePage() {
  const { usersCount, predictionsCount, topRankings, upcomingMatches, recentMatches } = await getHomeData();

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="relative rounded-2xl overflow-hidden bg-surface-800 border border-surface-600 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-pitch-900/40 via-transparent to-gold-500/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-pitch-400 text-sm font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-pitch-400" />
            CONCOURS OFFICIEL
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-2 tracking-wide">
            PRONOSTICS<br />
            <span className="text-pitch-400">COUPE DU MONDE</span>{" "}
            <span className="text-gold-400">2026</span>
          </h1>
          <p className="text-gray-400 max-w-md mt-3">
            Pronostique chaque match, accumule des points et grimpe dans le classement !
          </p>
          <div className="flex gap-3 mt-6">
            <Link href="/matches" className="btn-primary flex items-center gap-2">
              Voir les matchs <ChevronRight size={16} />
            </Link>
            <Link href="/ranking" className="btn-secondary flex items-center gap-2">
              Classement <Trophy size={16} />
            </Link>
          </div>
        </div>
        <div className="absolute right-6 top-6 text-7xl opacity-10 select-none">🏆</div>
      </section>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Participants", value: usersCount, icon: Users, color: "text-pitch-400" },
          { label: "Pronostics", value: predictionsCount, icon: Target, color: "text-gold-400" },
          { label: "Points max", value: topRankings[0]?.total_points ?? 0, icon: Trophy, color: "text-purple-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <div className="font-display text-3xl font-bold text-white">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl tracking-wide flex items-center gap-2">
              <Trophy size={18} className="text-gold-400" />
              TOP 5
            </h2>
            <Link href="/ranking" className="text-xs text-pitch-400 hover:text-pitch-300 transition-colors">
              Voir tout →
            </Link>
          </div>
          {topRankings.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Aucun pronostic encore soumis</p>
          ) : (
            <ol className="space-y-2">
              {topRankings.map((r, i) => (
                <li key={r.id} className="flex items-center gap-3 py-2 border-b border-surface-700 last:border-0">
                  <span className={`font-display font-bold text-lg w-6 text-center ${i === 0 ? "text-gold-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-gray-500"}`}>
                    {i + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-pitch-700 flex items-center justify-center text-xs font-bold text-pitch-300">
                    {r.profile?.pseudo?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-200 truncate">{r.profile?.pseudo ?? "—"}</div>
                    <div className="text-xs text-gray-500">{r.exact_scores} exact · {r.correct_results} bons</div>
                  </div>
                  <div className="font-display font-bold text-pitch-400 text-lg">{r.total_points} pts</div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="font-display font-bold text-xl tracking-wide flex items-center gap-2 mb-3">
              <Clock size={18} className="text-blue-400" />
              À VENIR
            </h2>
            {upcomingMatches.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun match à venir</p>
            ) : (
              <div className="space-y-2">
                {upcomingMatches.map((m) => (
                  <Link key={m.id} href={`/matches/${m.id}`} className="flex items-center justify-between py-2 border-b border-surface-700 last:border-0 hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <FlagImg code={m.home_team?.country_code} />
                      <span className="font-medium">{m.home_team?.name}</span>
                      <span className="text-gray-500 text-xs">vs</span>
                      <span className="font-medium">{m.away_team?.name}</span>
                      <FlagImg code={m.away_team?.country_code} />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{formatKickoffShort(m.kickoff_time)}</span>
                  </Link>
                ))}
                <Link href="/matches" className="block text-xs text-center text-pitch-400 hover:text-pitch-300 pt-1">
                  Voir tous les matchs →
                </Link>
              </div>
            )}
          </div>

          {recentMatches.length > 0 && (
            <div className="card">
              <h2 className="font-display font-bold text-xl tracking-wide flex items-center gap-2 mb-3">
                <Flame size={18} className="text-orange-400" />
                RÉSULTATS
              </h2>
              <div className="space-y-2">
                {recentMatches.map((m) => (
                  <Link key={m.id} href={`/matches/${m.id}`} className="flex items-center justify-between py-2 border-b border-surface-700 last:border-0 hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <FlagImg code={m.home_team?.country_code} />
                      <span>{m.home_team?.name}</span>
                    </div>
                    <div className="font-display font-bold text-white text-lg mx-3">
                      {m.home_score} - {m.away_score}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span>{m.away_team?.name}</span>
                      <FlagImg code={m.away_team?.country_code} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
