import { Injectable } from '@angular/core';
import { TableData, BetExtended, ResultExtended, MatchExtended, Score } from './basic_datastructures';

@Injectable()
export abstract class StatisticsCalculatorService {
  public abstract getBetTable(matchArray: MatchExtended[], betArray: BetExtended[], resultArray: ResultExtended[], offset?: TableData[]): TableData[];
  public abstract compareTableData(firstEl: TableData, secondEl: TableData): number;
}
