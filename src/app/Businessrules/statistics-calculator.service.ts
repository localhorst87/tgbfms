import { Injectable } from '@angular/core';
import { Bet, Match, Score, SeasonBet, SeasonResult } from './basic_datastructures';

@Injectable()
export abstract class StatisticsCalculatorService {
  public abstract compareScores(firstEl: any, secondEl: any): number;
}
