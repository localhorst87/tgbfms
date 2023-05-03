export interface MatchImportData {
  season: number;
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

export interface UpdateTime {
  documentId: string;
  season: number;
  matchday: number;
  timestamp: number;
}

export interface SyncPhase {
  documentId: string;
  start: number;
  matchIds: number[];
}