import { Match, Bet, Score } from "./basic_datastructures";

export interface PointCalculator {
    score: Score;
    addSingleMatchScore(betsAllUsers: Bet[], match: Match): void
  }