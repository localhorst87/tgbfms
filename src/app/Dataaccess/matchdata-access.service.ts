import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatchImportData, TeamRankingImportData } from './import_datastructures';

@Injectable()
export abstract class MatchdataAccessService {
  public abstract importMatchdata$(season: number, matchday: number): Observable<MatchImportData>;
  public abstract importCurrentTeamRanking$(season: number): Observable<TeamRankingImportData>;
  public abstract getLastUpdateTime$(season: number, matchday: number): Observable<number>;
}
