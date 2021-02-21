import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bet, Match, Result } from './datastructures';

@Injectable({
  providedIn: 'root'
})
export abstract class AppdataAccessService {
  public abstract getBet(matchId: number, userId: number): Observable<Bet | null>;
  public abstract getResult(matchId: number): Observable<Result | null>
  public abstract getMatch(matchId: number): Observable<Match | null>;
  public abstract getMatchesByMatchday(matchday: number): Observable<Match[] | null>;
  public abstract getMatchdayByMatchId(matchId: number): Observable<number | null>;
  public abstract getNextMatch(): Observable<Match | null>;
  public abstract getLastMatch(): Observable<Match | null>;
  public abstract getTeamNameByTeamId(teamId: number, shortName?: boolean): Observable<string | null>;
}
