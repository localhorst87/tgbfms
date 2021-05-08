import { Injectable } from '@angular/core';
import { Bet, Result, Match, Score } from './basic_datastructures';

@Injectable()
export abstract class StatisticsCalculatorService {
  public abstract getScoreArray(matchArray: Match[], betArray: Bet[], resultArray: Result[], offset?: Score[]): Score[];
  public abstract compareScores(firstEl: Score, secondEl: Score): number;
}