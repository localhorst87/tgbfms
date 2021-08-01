import { Injectable } from '@angular/core';
import { Bet, Result, Match, SeasonBet, SeasonResult, Score } from './basic_datastructures';

@Injectable()
export abstract class PointCalculatorService {
  public abstract calcSingleMatchScore(userId: string, betsAllUsers: Bet[], result: Result, match: Match): Score;
  public abstract countTendencies(betArray: Bet[]): number[];
  public abstract calcSingleSeasonScore(seasonBets: SeasonBet[], seasonResults: SeasonResult[]): Score;
  public abstract getPotentialOutsiderPoints(betArray: Bet[], betUser: Bet): number
}
