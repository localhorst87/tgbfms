import { Injectable } from '@angular/core';
import { Bet, Match, Score, SeasonBet, SeasonResult } from './basic_datastructures';

@Injectable()
export abstract class StatisticsCalculatorService {
  public abstract getScoreArray(matchArray: Match[], betArray: Bet[]): Score[];
  public abstract getSeasonScoreArray(betArray: SeasonBet[], resultArray: SeasonResult[]): Score[];
  public abstract addScores(score1: Score, score2: Score): Score;
  public abstract addScoreArrays(scoreArray1: Score[], ...scoreArray2: Score[][]): Score[];
  public abstract compareScores(firstEl: any, secondEl: any): number;
  public abstract makePositions(scores: Score[], compareFcn: (arg0: Score, arg1: Score) => number): number[];
  public abstract calculateForm(pointsUser: number[], pointsOpponents: number[][], weights: number[]): number;
}
