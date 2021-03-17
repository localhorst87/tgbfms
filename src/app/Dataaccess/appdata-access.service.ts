import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bet, Match, Result, Team, BetExtended, MatchExtended, ResultExtended, TeamExtended } from './database_datastructures';

@Injectable()
export abstract class AppdataAccessService {
  public abstract getBet(matchId: number, userId: number): Observable<BetExtended>;
  public abstract getResult(matchId: number): Observable<ResultExtended>
  public abstract getMatch(matchId: number): Observable<MatchExtended>;
  public abstract getMatchesByMatchday(matchday: number): Observable<MatchExtended>;
  public abstract getNextMatchesByTime(nextDays: number): Observable<MatchExtended>;
  public abstract getMatchdayByMatchId(matchId: number): Observable<number>;
  public abstract getNextMatch(): Observable<MatchExtended>;
  public abstract getLastMatch(): Observable<MatchExtended>;
  public abstract getTeamNameByTeamId(teamId: number, shortName?: boolean): Observable<string>;
  public abstract addBet(bet: Bet): void;
  public abstract addMatch(match: Match): void;
  public abstract addResult(result: Result): void;
  public abstract updateBet(documentId: string, bet: Bet): void;
  public abstract updateMatch(documentId: string, match: Match): void;
  public abstract updateResult(documentId: string, result: Result): void;
}
