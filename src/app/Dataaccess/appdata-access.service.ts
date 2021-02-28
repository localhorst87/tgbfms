import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bet, Match, Result } from './datastructures';

@Injectable()
export abstract class AppdataAccessService {
  public abstract getBet(matchId: number, userId: number): Observable<Bet>;
  public abstract getResult(matchId: number): Observable<Result>
  public abstract getMatch(matchId: number): Observable<Match>;
  public abstract getMatchesByMatchday(matchday: number): Observable<Match>;
  public abstract getMatchdayByMatchId(matchId: number): Observable<number>;
  public abstract getNextMatch(): Observable<Match>;
  public abstract getLastMatch(): Observable<Match>;
  public abstract getTeamNameByTeamId(teamId: number, shortName?: boolean): Observable<string>;
}
