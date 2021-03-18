import { Injectable } from '@angular/core';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { Observable, combineLatest } from 'rxjs';
import { mergeMap, distinct } from 'rxjs/operators';
import { Bet, Match, Result, BetExtended, MatchExtended, ResultExtended } from '../Dataaccess/database_datastructures';
import { BetWriteData } from './output_datastructures';

@Injectable({
  providedIn: 'root'
})
export class FetchBetWriteDataService {

  constructor(private appData: AppdataAccessService) { }

  public fetchDataByMatchday$(season: number, matchday: number, userId: number): Observable<BetWriteData> {
    return this.appData.getMatchesByMatchday$(season, matchday).pipe(
      mergeMap(match => this.makeBetWriteData$(match, userId)),
      distinct(betWriteData => betWriteData.matchId) // prevents adding new form on changing a bet
    );
  }

  public fetchDataByTime$(nextDays: number, userId: number): Observable<BetWriteData> {
    return this.appData.getNextMatchesByTime$(nextDays).pipe(
      mergeMap(match => this.makeBetWriteData$(match, userId)),
      distinct(betWriteData => betWriteData.matchId) // prevents adding new form on changing a bet
    );
  }

  private makeBetWriteData$(match: Match, userId: number): Observable<BetWriteData> {
    return combineLatest(
      this.appData.getTeamNameByTeamId$(match.teamIdHome),
      this.appData.getTeamNameByTeamId$(match.teamIdAway),
      this.appData.getBet$(match.matchId, userId),
      (teamHome, teamAway, bet) => {
        return {
          matchId: match.matchId,
          matchTimestamp: match.timestamp,
          isTopMatch: match.isTopMatch,
          teamNameHome: teamHome,
          teamNameAway: teamAway,
          betGoalsHome: bet.goalsHome,
          betGoalsAway: bet.goalsAway,
          isBetFixed: bet.isFixed,
          betDocumentId: bet.documentId
        };
      });
  }

}
