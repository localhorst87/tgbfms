import { Injectable } from '@angular/core';
import { BetExtended, ResultExtended, MatchExtended, SeasonBetExtended, SeasonResultExtended, Score } from './basic_datastructures';

@Injectable()
export abstract class PointCalculatorService {
  public abstract getMatchPoints(userId: string, betsAllUsers: BetExtended[], result: ResultExtended, match: MatchExtended): Score;
  public abstract isTendencyCorrect(bet: BetExtended, result: ResultExtended): boolean;
  public abstract isResultCorrect(bet: BetExtended, result: ResultExtended): boolean;
  public abstract countTendencies(betArray: BetExtended[]): number[];
  public abstract getSeasonPoints(seasonBets: SeasonBetExtended[], seasonResults: SeasonResultExtended[]): number;
}
