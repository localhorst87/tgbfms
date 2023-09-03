import { Match, Bet, Score, SeasonBet, SeasonResult } from "./basic_datastructures";

export interface PointCalculator {
    userId: string;
    getScore(ingestSeasonScore: boolean): Score;
    addSingleMatchScore(betsAllUsers: Bet[], match: Match): void;
    addSeasonScore(bets: SeasonBet[], results: SeasonResult[]): void;
    addScore(score: Score): void;
}