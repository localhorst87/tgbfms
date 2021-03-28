export interface Match {
  season: number;
  matchday: number;
  matchId: number;
  timestamp: number;
  isFinished: boolean;
  isTopMatch: boolean;
  teamIdHome: number;
  teamIdAway: number;
}

export interface MatchExtended extends Match {
  documentId: string;
}

export interface Bet {
  matchId: number;
  userId: string;
  isFixed: boolean;
  goalsHome: number;
  goalsAway: number;
}

export interface BetExtended extends Bet {
  documentId: string;
}

export interface Result {
  matchId: number;
  goalsHome: number;
  goalsAway: number;
}

export interface ResultExtended extends Result {
  documentId: string;
}

export interface Team {
  id: number;
  nameLong: string;
  nameShort: string;
}

export interface TeamExtended extends Team {
  documentId: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  isActive: boolean;
}

export interface UserExtended extends User {
  documentId: string;
}
