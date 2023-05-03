import { Match, Bet, Score } from "../../../src/app/Businessrules/basic_datastructures";

export interface PointCalculator {
    score: Score;
    addSingleMatchScore(betsAllUsers: Bet[], match: Match): void
  }