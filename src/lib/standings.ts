import type { Match, Team } from "@/types";

export interface GroupStanding {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  remainingMatches: number;
  maxPossiblePoints: number;
  isQualified: boolean;
}

export function calculateGroupStandings(teams: Team[], matches: Match[]): GroupStanding[] {
  const standings = new Map<string, GroupStanding>();
  const totalMatchesPerTeam = teams.length - 1; // ex: 3 pour un groupe de 4

  teams.forEach((team) => {
    standings.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
      remainingMatches: totalMatchesPerTeam,
      maxPossiblePoints: totalMatchesPerTeam * 3,
      isQualified: false,
    });
  });

  const finishedMatches = matches.filter((m) => m.status === "finished" && m.home_score !== null && m.away_score !== null);

  finishedMatches.forEach((m) => {
    const home = standings.get(m.home_team_id);
    const away = standings.get(m.away_team_id);
    if (!home || !away) return;

    const hs = m.home_score!;
    const as = m.away_score!;

    home.played += 1;
    away.played += 1;
    home.goalsFor += hs;
    home.goalsAgainst += as;
    away.goalsFor += as;
    away.goalsAgainst += hs;

    if (hs > as) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (hs < as) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  });

  standings.forEach((s) => {
    s.goalDiff = s.goalsFor - s.goalsAgainst;
    s.remainingMatches = totalMatchesPerTeam - s.played;
    s.maxPossiblePoints = s.points + s.remainingMatches * 3;
  });

  const sorted = Array.from(standings.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.name.localeCompare(b.team.name);
  });

  // Qualification mathématique : l'équipe est qualifiée si son nombre de points
  // actuel est strictement supérieur au maximum atteignable par la 3e équipe (et suivantes)
  if (sorted.length >= 3) {
    const thirdPlaceMaxPoints = sorted[2].maxPossiblePoints;
    sorted.forEach((s, i) => {
      if (i < 2 && s.points > thirdPlaceMaxPoints) {
        s.isQualified = true;
      }
    });
  }

  return sorted;
}
