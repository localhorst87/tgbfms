import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bet, Match, Result, Team, User, SeasonBet, SeasonResult } from '../Businessrules/basic_datastructures';
import { MatchdayScoreSnapshot, SyncTime } from './import_datastructures';

@Injectable()
export abstract class AppdataAccessService {
  public abstract getBet$(matchId: number, userId: string): Observable<Bet>;
  public abstract getResult$(matchId: number): Observable<Result>
  public abstract getMatch$(matchId: number): Observable<Match>;
  public abstract getSeasonBet$(season: number, place: number, userId: string): Observable<SeasonBet>;
  public abstract getSeasonResult$(season: number, place: number): Observable<SeasonResult>;
  public abstract getMatchesByMatchday$(season: number, matchday: number): Observable<Match>;
  public abstract getNextMatchesByTime$(nextDays: number): Observable<Match>;
  public abstract getMatchdayByMatchId$(matchId: number): Observable<number>;
  public abstract getNextMatch$(): Observable<Match>;
  public abstract getLastMatch$(): Observable<Match>;
  public abstract getTeamNameByTeamId$(teamId: number, shortName?: boolean): Observable<string>;
  public abstract getActiveUserIds$(): Observable<string>;
  public abstract getUserDataById$(userId: string): Observable<User>;
  public abstract getMatchdayScoreSnapshot$(season: number, matchday: number): Observable<MatchdayScoreSnapshot>;
  public abstract getLastUpdateTime$(season: number, matchday: number): Observable<number>;
  public abstract setBet(documentId: string, bet: Bet): void;
  public abstract addMatch(match: Match): void;
  public abstract addResult(result: Result): void;
  public abstract addSeasonBet(bet: SeasonBet): void;
  public abstract addSeasonResult(result: SeasonResult): void;
  public abstract addMatchdayScoreSnapshot(snapshot: MatchdayScoreSnapshot): void;
  public abstract addLastUpdateTime(syncTime: SyncTime): void;
  public abstract updateMatch(documentId: string, match: Match): void;
  public abstract updateResult(documentId: string, result: Result): void;
  public abstract updateSeasonBet(documentId: string, bet: SeasonBet): void;
  public abstract updateSeasonResult(documentId: string, result: SeasonResult): void;
  public abstract updateMatchdayScoreSnapshot(documentId: string, snapshot: MatchdayScoreSnapshot): void;
  public abstract updateLastUpdateTime(documentId: string, syncTime: SyncTime): void;
  public abstract createDocumentId(): string;
}
