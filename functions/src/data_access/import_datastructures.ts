import { Score } from "../business_rules/basic_datastructures";

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
  scores: Score[];
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
  timestampMatches: number;
  timestampStats: number;
}

export interface SyncPhase {
  documentId: string;
  start: number;
  matchIds: number[];
}

export interface Email {
  documentId: string;
  to: string;
  message: EmailMessage;
  delivery?: EmailDeliveryInfo;
}

export interface EmailMessage {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailDeliveryInfo {
  state: string;
  attempts: number;
  startTime: Date;
  endTime: Date;
  leaseExpireTime: Date | null;
  error: string | null;
  info: any;
}

export interface ResultFrequency {
  result: string;
  fraction: number;
}

export interface UserStats {
  documentId: string;
  season: number;
  matchday: number;
  userId: string;
  currentForm?: number;
  formHistory?: number[];
  meanPoints?: number;
  stddev?: number;
  stddevRel?: number;
  positionHistory?: number[];
  mostFrequentBets?: ResultFrequency[];
  boxPlot?: BoxPlot;
}

export interface BoxPlot {
  minimum: number;
  lowerQuartile: number;
  median: number;
  upperQuartile: number;
  maximum: number;
}