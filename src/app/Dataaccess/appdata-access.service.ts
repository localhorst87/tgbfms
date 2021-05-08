import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bet, Match, Result, Team, User } from '../Businessrules/basic_datastructures';

@Injectable()
export abstract class AppdataAccessService {
  public abstract getBet$(matchId: number, userId: string): Observable<Bet>;
  public abstract getResult$(matchId: number): Observable<Result>
  public abstract getMatch$(matchId: number): Observable<Match>;
  public abstract getMatchesByMatchday$(season: number, matchday: number): Observable<Match>;
  public abstract getNextMatchesByTime$(nextDays: number): Observable<Match>;
  public abstract getMatchdayByMatchId$(matchId: number): Observable<number>;
  public abstract getNextMatch$(): Observable<Match>;
  public abstract getLastMatch$(): Observable<Match>;
  public abstract getTeamNameByTeamId$(teamId: number, shortName?: boolean): Observable<string>;
  public abstract getActiveUserIds$(): Observable<string>;
  public abstract getUserDataById$(userId: string): Observable<User>;
  public abstract addBet(bet: Bet): void;
  public abstract addMatch(match: Match): void;
  public abstract addResult(result: Result): void;
  public abstract updateBet(documentId: string, bet: Bet): void;
  public abstract updateMatch(documentId: string, match: Match): void;
  public abstract updateResult(documentId: string, result: Result): void;
}
