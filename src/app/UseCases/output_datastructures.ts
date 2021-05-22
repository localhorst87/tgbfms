import { Observable } from 'rxjs';

export interface BetWriteData {
  matchId: number;
  matchTimestamp: number;
  isTopMatch: boolean;
  teamNameHome: string;
  teamNameAway: string;
  betGoalsHome: number;
  betGoalsAway: number;
  isBetFixed: boolean;
  betDocumentId: string;
}

export interface BetOverviewFrameData {
  matchId: number;
  isTopMatch: boolean;
  teamNameHome: string;
  teamNameAway: string;
  resultGoalsHome: number;
  resultGoalsAway: number;
  isBetFixed: boolean;
}

export interface BetOverviewUserData {
  matchId: number;
  userName: string;
  betGoalsHome: number;
  betGoalsAway: number;
}

export interface TableData {
  position: number;
  userName: string;
  points: number;
  matches: number;
  results: number;
  extraTop: number;
  extraOutsider: number;
  extraSeason: number;
}
