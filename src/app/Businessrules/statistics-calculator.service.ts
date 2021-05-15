import { Injectable } from '@angular/core';
import { Bet, Result, Match, Score, SeasonBet, SeasonResult } from './basic_datastructures';

@Injectable()
export abstract class StatisticsCalculatorService {
  public abstract getScoreArray(matchArray: Match[], betArray: Bet[], resultArray: Result[]): Score[];
  public abstract getSeasonScoreArray(betArray: SeasonBet[], resultArray: SeasonResult[]): Score[];
  public abstract addScores(score1: Score, score2: Score): Score;
  public abstract addScoreArrays(scoreArray1: Score[], ...scoreArray2: Score[][]): Score[];
  public abstract compareScores(firstEl: Score, secondEl: Score): number;
  public abstract makePositions(scores: Score[], compareFcn: (arg0: Score, arg1: Score) => number): number[];
}
