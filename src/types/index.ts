export type MatchPhase =
  | "group"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final";
export type MatchStatus = "upcoming" | "live" | "finished";
export type PredictedWinner = "home" | "away" | "draw";
export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  pseudo: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}
export interface Group {
  id: string;
  name: string;
}
export interface Team {
  id: string;
  name: string;
  country_code: string;
  flag_url?: string;
  group_id?: string;
}
export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity?: number;
}
export interface Match {
  id: string;
  match_number: number;
  phase: MatchPhase;
  group_id?: string;
  home_team_id: string;
  away_team_id: string;
  stadium_id: string;
  kickoff_time: string;
  status: MatchStatus;
  home_score?: number;
  away_score?: number;
  home_score_extra?: number;
  away_score_extra?: number;
  penalty_winner?: string | null;
  created_at: string;
  updated_at: string;
  home_team?: Team;
  away_team?: Team;
  stadium?: Stadium;
  group?: Group;
  user_prediction?: Prediction | null;
}
export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  predicted_winner?: PredictedWinner;
  penalty_pick?: string | null;
  points?: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}
export interface Ranking {
  id: string;
  user_id: string;
  total_points: number;
  exact_scores: number;
  correct_results: number;
  correct_draws: number;
  predictions_count: number;
  rank?: number;
  updated_at: string;
  profile?: Profile;
}
export const PHASE_LABELS: Record<MatchPhase, string> = {
  group: "Phase de groupes",
  round_of_16: "Seizièmes de finale",
  quarter_final: "Quarts de finale",
  semi_final: "Demi-finales",
  third_place: "3e place",
  final: "Finale",
};
export const STATUS_LABELS: Record<MatchStatus, string> = {
  upcoming: "À venir",
  live: "En cours",
  finished: "Terminé",
};
export const POINTS = {
  EXACT_SCORE: 5,
  CORRECT_WINNER: 3,
  CORRECT_DRAW: 2,
  WRONG: 0,
} as const;
