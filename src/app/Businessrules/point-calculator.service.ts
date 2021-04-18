import { Injectable } from '@angular/core';
import { BetExtended, ResultExtended } from '../Dataaccess/database_datastructures';

@Injectable()
export abstract class PointCalculatorService {
  public abstract getMatchPoints(userId: string, betArray: BetExtended[], result: ResultExtended, isTopMatch: boolean): number;
}
