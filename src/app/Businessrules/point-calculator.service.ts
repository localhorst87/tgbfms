import { Injectable } from '@angular/core';
import { BetExtended, ResultExtended, MatchExtended, SeasonBetExtended, SeasonResultExtended, Score } from './basic_datastructures';

@Injectable()
export abstract class PointCalculatorService {
  public abstract calcSingleMatchScore(userId: string, betsAllUsers: BetExtended[], result: ResultExtended, match: MatchExtended): Score;
  public abstract countTendencies(betArray: BetExtended[]): number[];
  public abstract calcSingleSeasonScore(seasonBets: SeasonBetExtended[], seasonResults: SeasonResultExtended[]): Score;
}
