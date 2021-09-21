import { Observable } from 'rxjs';

export interface MatchInfo {
  matchDate: Date;
  matchday: number;
  teamNameHome: string;
  teamNameAway: string;
  teamNameShortHome: string;
  teamNameShortAway: string;
  placeHome: number;
  placeAway: number;
  pointsHome: number;
  pointsAway: number;
  betGoalsHome: number;
  betGoalsAway: number;
}

export interface TeamStats {
  place: number;
  points: number;
}

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
  matchDate: Date;
  isTopMatch: boolean;
  teamNameHome: string;
  teamNameAway: string;
  teamNameShortHome: string;
  teamNameShortAway: string;
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
  userId: string;
  userName: string;
  betGoalsHome: number;
  betGoalsAway: number;
  isBetFixed: boolean;
  possibleOutsiderPoints: number;
}

export interface SeasonBetOverviewUserData {
  place: number;
  userId: string;
  userName: string;
  teamName: string;
  isBetFixed: boolean;
}

export interface SeasonBetWriteData {
  betDocumentId: string;
  season: number;
  place: number;
  teamId: number;
  teamName: string;
  isBetFixed: boolean;
  dueDate: Date;
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
