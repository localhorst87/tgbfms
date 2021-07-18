import { Observable } from 'rxjs';

export interface BetWriteData {
  matchId: number;
  matchDate: Date;
  isTopMatch: boolean;
  teamIdHome: number;
  teamIdAway: number;
  teamNameHome: string;
  teamNameAway: string;
  teamNameShortHome: string;
  teamNameShortAway: string;
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

export interface SeasonBetOverviewFrameData {
  place: number;
  resultTeamName: string;
  isBetFixed: boolean;
}

export interface BetOverviewUserData {
  matchId: number;
  userName: string;
  betGoalsHome: number;
  betGoalsAway: number;
}

export interface SeasonBetOverviewUserData {
  place: number;
  userName: string;
  teamName: string;
}

export interface SeasonBetWriteData {
  season: number;
  place: number;
  teamName: string;
  isBetFixed: boolean;
  betDocumentId: string;
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
