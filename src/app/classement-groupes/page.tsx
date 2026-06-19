import { createClient } from "@/lib/supabase/server";
import { calculateGroupStandings } from "@/lib/standings";
import { GroupStandingsTable } from "@/components/groups/GroupStandingsTable";
import type { Match } from "@/types";
import { Trophy } from "lucide-react";

export const revalidate = 30;

export default async function GroupStandingsPage() {
  const supabase = await createClient();

  const { data: matchesData } = await supabase
    .from("matches")
    .select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*), group:groups(*)")
    .eq("phase", "group")
    .order("kickoff_time", { ascending: true });
  const matches = (matchesData ?? []) as Match[];

  const { data: teamsData } = await supabase.from("teams").select("*, group:groups(*)");
  const allTeams = teamsData ?? [];

  const byGroup = matches.reduce((acc, m) => {
    const key = m.group?.name ?? "?";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<string, Match[]>);

  const groupNames = Object.keys(byGroup).sort();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-4xl font-bold text-white tracking-wide flex items-center gap-3">
          <Trophy size={28} className="text-gold-400" />
          CLASSEMENT DES GROUPES
        </h1>
        <p className="text-gray-500 text-sm mt-1">Phase de groupes · {groupNames.length} groupes</p>
      </div>

      {groupNames.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          <Trophy size={32} className="mx-auto mb-3 opacity-20" />
          <p>Aucune donnée de groupe disponible.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupNames.map((groupName) => {
            const groupTeams = allTeams.filter((t: any) => t.group?.name === groupName);
            const groupMatches = byGroup[groupName];
            const standings = calculateGroupStandings(groupTeams as any, groupMatches);
            const allPlayed = groupMatches.every((m) => m.status === "finished");
return <GroupStandingsTable key={groupName} standings={standings} groupName={groupName} allMatchesPlayed={allPlayed} />;
          })}
        </div>
      )}

      <div className="card">
        <h3 className="font-display font-bold text-sm text-gray-400 mb-2 tracking-wider">RÈGLES DE CLASSEMENT</h3>
        <p className="text-xs text-gray-500">
          Victoire = 3 points · Match nul = 1 point · Défaite = 0 point.
          En cas d'égalité : différence de buts, puis buts marqués.
          Les 2 premiers de chaque groupe sont qualifiés pour les 16es de finale.
        </p>
      </div>
    </div>
  );
}
