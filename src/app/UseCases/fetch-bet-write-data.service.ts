import { Injectable } from '@angular/core';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { Observable, merge, combineLatest } from 'rxjs';
import { switchMap, mergeMap } from 'rxjs/operators';
import { Bet, Match, Result } from '../Dataaccess/datastructures';
import { BetWriteData } from './output_datastructures';

@Injectable({
  providedIn: 'root'
})
export class FetchBetWriteDataService {

  constructor(private appData: AppdataAccessService) { }

  public fetchDataByMatchday(matchday: number, userId: number): Observable<BetWriteData> {
    return this.appData.getMatchesByMatchday(matchday).pipe(
      mergeMap(match => this.makeBetWriteData(match, userId))
    );
  }

  public fetchDataByTime(nextDays: number, userId: number): Observable<BetWriteData> {
    return this.appData.getNextMatchesByTime(nextDays).pipe(
      mergeMap(match => this.makeBetWriteData(match, userId))
    );
  }

  private makeBetWriteData(match: Match, userId: number): Observable<BetWriteData> {
    return combineLatest(
      this.appData.getTeamNameByTeamId(match.teamIdHome),
      this.appData.getTeamNameByTeamId(match.teamIdAway),
      this.appData.getBet(match.matchId, userId),
      (teamHome, teamAway, bet) => {
        return {
          matchId: match.matchId,
          teamNameHome: teamHome,
          teamNameAway: teamAway,
          betGoalsHome: bet.goalsHome,
          betGoalsAway: bet.goalsAway,
          isBetFixed: bet.isFixed
        };
      });
  }

}
