import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { map, mergeMap, concatMap, distinct, switchMap } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { BetExtended, MatchExtended, ResultExtended, UserExtended } from '../Dataaccess/database_datastructures';
import { BetOverviewFrameData, BetOverviewUserData } from './output_datastructures';

@Injectable({
  providedIn: 'root'
})
export class FetchBetOverviewService {

  constructor(private appData: AppdataAccessService) { }

  public fetchFrameDataByMatchday$(season: number, matchday: number, userId: string): Observable<BetOverviewFrameData> {
    // returns the requested frame data (data without user bets) as Observable

    return this.appData.getMatchesByMatchday$(season, matchday).pipe(
      mergeMap((match: MatchExtended) => this.makeFrameData$(match, userId)),
    );
  }

  public fetchUserBetDataByMatchday$(matchId: number): Observable<BetOverviewUserData> {
    // returns the requested bet data of all users as Observable

    return this.getAllUserBets$(matchId).pipe(
      mergeMap((bet: BetExtended) => this.makeBetData$(bet))
    );
  }

  private makeFrameData$(match: MatchExtended, userId: string): Observable<BetOverviewFrameData> {
    // converts the BetOverviewFrameData request for the required match into a data structure

    return combineLatest(
      this.appData.getTeamNameByTeamId$(match.teamIdHome),
      this.appData.getTeamNameByTeamId$(match.teamIdAway),
      this.appData.getBet$(match.matchId, userId),
      this.appData.getResult$(match.matchId),

      (teamHome, teamAway, betUser, result) => {
        return {
          matchId: match.matchId,
          isTopMatch: match.isTopMatch,
          teamNameHome: teamHome,
          teamNameAway: teamAway,
          resultGoalsHome: result.goalsHome,
          resultGoalsAway: result.goalsAway,
          isBetFixed: betUser.isFixed
        };
      });
  }

  private getAllUserBets$(matchId: number): Observable<BetExtended> {
    // returns the bet of all active users

    return this.appData.getActiveUserIds$().pipe(
      concatMap((userId: string) => this.appData.getBet$(matchId, userId))
    );
  }

  private makeBetData$(bet: BetExtended): Observable<BetOverviewUserData> {
    // creates BetOverviewUserData from a user bet

    return this.appData.getUserDataById$(bet.userId).pipe(
      map((userData: UserExtended) => {
        return {
          matchId: bet.matchId,
          userName: userData.displayName,
          betGoalsHome: bet.goalsHome,
          betGoalsAway: bet.goalsAway
        };
      })
    )
  }
}
