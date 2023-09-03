import { Match, Bet, Score, SeasonBet, SeasonResult } from './basic_datastructures';

export interface ScoreAdder {
    getScores(ingestSeasonScore: boolean): Score[];
    calcScores(matches: Match[], bets: Bet[]): void;
    calcSeasonScores(bets: SeasonBet[], results: SeasonResult[]): void;
    addScores(scores: Score[]): void;
}