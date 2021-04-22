import { Injectable } from '@angular/core';
import { BetExtended, ResultExtended, SeasonBetExtended, SeasonResultExtended } from '../Dataaccess/database_datastructures';

@Injectable()
export abstract class PointCalculatorService {
  public abstract getMatchPoints(userId: string, betsAllUsers: BetExtended[], result: ResultExtended, isTopMatch: boolean): number;
  public abstract countTendencies(betArray: BetExtended[]): number[];
  public abstract getSeasonPoints(seasonBets: SeasonBetExtended[], seasonResults: SeasonResultExtended[]): number;
}
