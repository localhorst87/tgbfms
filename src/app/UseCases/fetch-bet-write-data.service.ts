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

  public fetchDataByMatchday$(season: number, matchday: number, userId: string): Observable<BetWriteData> {
    // returns the required BetWriteData of the given matchday as Observable

    return this.appData.getMatchesByMatchday$(season, matchday).pipe(
      mergeMap(match => this.makeBetWriteData$(match, userId)),
      distinct(betWriteData => betWriteData.matchId) // prevents adding new form on changing a bet if real-time reading is activatet
    );
  }

  public fetchDataByTime$(nextDays: number, userId: string): Observable<BetWriteData> {
    // returns the required BetWriteData of the given timespan as Observable

    return this.appData.getNextMatchesByTime$(nextDays).pipe(
      mergeMap(match => this.makeBetWriteData$(match, userId)),
      distinct(betWriteData => betWriteData.matchId) // prevents adding new form on changing a bet if real-time reading is activatet
    );
  }

  private makeBetWriteData$(match: Match, userId: string): Observable<BetWriteData> {
    // converts the BetWriteData request for the required match into a data structure

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
