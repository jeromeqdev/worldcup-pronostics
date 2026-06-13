// ============================================================
// Types globaux de l'application
// ============================================================

export type MatchPhase =
  | "group"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final";

export type MatchStatus = "upcoming" | "live" | "finished";

export type PredictedWinner = "home" | "away" | "draw";

// ---- Profil utilisateur ----
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

// ---- Groupe (phase de poules) ----
export interface Group {
  id: string;
  name: string;
}

// ---- Équipe ----
export interface Team {
  id: string;
  name: string;
  country_code: string;
  flag_url?: string;
  group_id?: string;
}

// ---- Stade ----
export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity?: number;
}

// ---- Match ----
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
  created_at: string;
  updated_at: string;
  // Relations jointes
  home_team?: Team;
  away_team?: Team;
  stadium?: Stadium;
  group?: Group;
  user_prediction?: Prediction | null;
}

// ---- Pronostic ----
export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  predicted_winner?: PredictedWinner;
  points?: number;
  created_at: string;
  updated_at: string;
  // Relations
  profile?: Profile;
}

// ---- Classement ----
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
  // Relations
  profile?: Profile;
}

// ---- Libellés des phases ----
export const PHASE_LABELS: Record<MatchPhase, string> = {
  group: "Phase de groupes",
  round_of_16: "Huitièmes de finale",
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

// ---- Barème de points ----
export const POINTS = {
  EXACT_SCORE: 5,
  CORRECT_WINNER: 3,
  CORRECT_DRAW: 2,
  WRONG: 0,
} as const;
