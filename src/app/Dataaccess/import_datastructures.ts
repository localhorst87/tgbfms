export interface MatchImportData {
  matchday: number;
  matchId: number;
  datetime: string;
  isFinished: boolean;
  teamIdHome: number;
  teamIdAway: number;
  goalsHome: number;
  goalsAway: number;
}

export interface MatchdayScoreSnapshot {
  documentId: string;
  season: number;
  matchday: number;
  userId: string[];
  points: number[];
  matches: number[];
  results: number[];
  extraTop: number[];
  extraOutsider: number[];
  extraSeason: number[];
}

export interface TeamRankingImportData {
  teamId: number;
  matches: number;
  points: number;
  won: number;
  draw: number;
  lost: number;
  goals: number;
  goalsAgainst: number;
}
