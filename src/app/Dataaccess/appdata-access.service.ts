import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bet, Match, Team, User, SeasonBet, SeasonResult, TopMatchVote } from '../Businessrules/basic_datastructures';
import { MatchdayScoreSnapshot, UserStats } from './import_datastructures';
import { Table } from '../UseCases/output_datastructures';

@Injectable()
export abstract class AppdataAccessService {
  public abstract getBet$(matchId: number, userId: string): Observable<Bet>;
  public abstract getMatch$(matchId: number): Observable<Match>;
  public abstract getSeasonBet$(season: number, place: number, userId: string): Observable<SeasonBet>;
  public abstract getSeasonResult$(season: number, place: number): Observable<SeasonResult>;
  public abstract getMatchesByMatchday$(season: number, matchday: number): Observable<Match>;
  public abstract getFirstMatchOfMatchday$(season: number, matchday: number): Observable<Match>;
  public abstract getNextMatchesByTime$(nextDays: number): Observable<Match>;
  public abstract getMatchdayByMatchId$(matchId: number): Observable<number>;
  public abstract getNextMatch$(season: number, amount?: number): Observable<Match>;
  public abstract getLastMatch$(season: number, amount?: number): Observable<Match>;
  public abstract getTopMatch$(season: number, matchday: number): Observable<Match>;
  public abstract getTeamNameByTeamId$(teamId: number, shortName?: boolean): Observable<string>;
  public abstract getTeamByTeamId$(teamId: number): Observable<Team>;
  public abstract getActiveUserIds$(): Observable<string>;
  public abstract getActiveUsers$(): Observable<User>;
  public abstract getUserDataById$(userId: string): Observable<User>;
  public abstract getMatchdayScoreSnapshot$(season: number, matchday: number): Observable<MatchdayScoreSnapshot>;
  public abstract getOpenBets$(matchId: number): Observable<Bet>;
  public abstract getTopMatchVotes$(season: number, matchday: number, userId?: string): Observable<TopMatchVote>;
  public abstract getTableView$(id: string, season: number, matchday: number): Observable<Table>;
  public abstract getUserStats$(season: number, matchday: number, userId?: string): Observable<UserStats>;
  public abstract setBet(bet: Bet): Promise<void>;
  public abstract setSeasonBet(bet: SeasonBet): void;
  public abstract setUser(user: User): void;
  public abstract setTopMatchVote(vote: TopMatchVote): Promise<void>;
  public abstract addMatch(match: Match): void;
  public abstract addSeasonResult(result: SeasonResult): void;
  public abstract updateMatch(documentId: string, match: Match): void;
  public abstract updateSeasonResult(documentId: string, result: SeasonResult): void;
  public abstract setMatchdayScoreSnapshot(snapshot: MatchdayScoreSnapshot): void;
  public abstract createDocumentId(): string;
}
