export interface Match {
  documentId: string;
  season: number;
  matchday: number;
  matchId: number;
  timestamp: number;
  isFinished: boolean;
  isTopMatch: boolean;
  teamIdHome: number;
  teamIdAway: number;
  goalsHome: number;
  goalsAway: number;
}

export interface Bet {
  documentId: string;
  matchId: number;
  userId: string;
  isFixed: boolean;
  goalsHome: number;
  goalsAway: number;
}

export interface SeasonBet {
  documentId: string;
  season: number;
  userId: string;
  isFixed: boolean;
  place: number;
  teamId: number;
}

export interface SeasonResult {
  documentId: string;
  season: number;
  place: number;
  teamId: number;
}

export interface Team {
  documentId: string;
  id: number;
  nameLong: string;
  nameShort: string;
}

export interface User {
  documentId: string;
  id: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  isActive: boolean;
}

export interface Score {
  userId: string;
  points: number;
  matches: number;
  results: number;
  extraTop: number;
  extraOutsider: number;
  extraSeason: number;
}

export interface TopMatchVote {
  documentId: string;
  season: number;
  matchday: number;
  matchId: number;
  userId: string;
  timestamp: number;
}

export interface VoteCount {
  matchId: number;
  nVotes: number;
  lastVoteTime: number;
}
