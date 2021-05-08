import { Injectable } from '@angular/core';
import { BetExtended, ResultExtended, MatchExtended, Score } from './basic_datastructures';

@Injectable()
export abstract class StatisticsCalculatorService {
  public abstract getBetTable(matchArray: MatchExtended[], betArray: BetExtended[], resultArray: ResultExtended[], offset?: Score[]): Score[];
  public abstract compareScores(firstEl: Score, secondEl: Score): number;
}
