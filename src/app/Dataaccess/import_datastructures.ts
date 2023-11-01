import { Score } from "../Businessrules/basic_datastructures";

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

export interface ResultFrequency {
  result: string;
  fraction: number;
}

export interface BoxPlot {
  minimum: number;
  lowerQuartile: number;
  median: number;
  upperQuartile: number;
  maximum: number;
}

export interface CurrentMatchdays {
  matchdayClosest: number;
  matchdayNextMatch: number;
  matchdayLastMatch: number;
  matchdayRecent: number;
  matchdayCompleted: number;
}

export interface SimpleResult {
  operationSuccessful: boolean;
}