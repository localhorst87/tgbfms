import { Injectable } from '@angular/core';
import { Observable, combineLatest, range, concat, from } from 'rxjs';
import { map, mergeMap, concatMap, distinct, toArray } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { PointCalculatorService } from '../Businessrules/point-calculator.service';
import { Bet, Match, Result, SeasonBet, SeasonResult, User } from '../Businessrules/basic_datastructures';
import { BetOverviewFrameData, BetOverviewUserData, SeasonBetOverviewUserData, SeasonBetOverviewFrameData } from './output_datastructures';
import { RELEVANT_FIRST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT } from '../Businessrules/rule_defined_values';

@Injectable({
  providedIn: 'root'
})
export class FetchBetOverviewService {

  relevantPlaces$: Observable<number>;

  constructor(private appData: AppdataAccessService, private pointCalc: PointCalculatorService) {
    this.relevantPlaces$ = concat(
      range(1, RELEVANT_FIRST_PLACES_COUNT),
      range(-RELEVANT_LAST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT)
    );
  }

  public fetchFrameDataByMatchday$(season: number, matchday: number, userId: string): Observable<BetOverviewFrameData> {
    // returns the requested frame data (data without user bets) as Observable

    return this.appData.getMatchesByMatchday$(season, matchday).pipe(
      mergeMap((match: Match) => this.makeFrameData$(match, userId)),
      distinct()
    );
  }

  public fetchUserBetDataByMatchday$(matchId: number): Observable<BetOverviewUserData> {
    // returns the requested bet data of all users as Observable

    return this.getAllUserBets$(matchId).pipe(
      toArray(),
      mergeMap((betArray: Bet[]) => this.makeBetData$(betArray)),
      distinct()
    );
  }

  public fetchSeasonFrameData$(season: number, userId: string): Observable<SeasonBetOverviewFrameData> {
    // return the requested frame data (data without user bets) as Observable

    return this.relevantPlaces$.pipe(
      concatMap((place: number) => this.makeSeasonFrameData$(season, place, userId)),
      distinct()
    );
  }

  public fetchUserSeasonBetData$(season: number): Observable<SeasonBetOverviewUserData> {
    // returns the request season bet data of all users for the bet overview

    return this.getAllUserSeasonBets$(season).pipe(
      mergeMap((bet: SeasonBet) => this.makeSeasonBetData$(bet)),
      distinct()
    );
  }

  private makeFrameData$(match: Match, userId: string): Observable<BetOverviewFrameData> {
    // processes the BetOverviewFrameData request for the required match into an output data structure

    return combineLatest(
      this.appData.getTeamNameByTeamId$(match.teamIdHome),
      this.appData.getTeamNameByTeamId$(match.teamIdAway),
      this.appData.getBet$(match.matchId, userId),
      this.appData.getResult$(match.matchId),

      (teamHome: string, teamAway: string, betUser: Bet, result: Result) => {
        return {
          matchId: match.matchId,
          matchDate: new Date(match.timestamp * 1000),
          isTopMatch: match.isTopMatch,
          teamNameHome: teamHome,
          teamNameAway: teamAway,
          resultGoalsHome: result.goalsHome,
          resultGoalsAway: result.goalsAway,
          isBetFixed: betUser.isFixed
        };
      });
  }

  private makeSeasonFrameData$(season: number, place: number, userId: string): Observable<SeasonBetOverviewFrameData> {
    // processes the SeasonBetOverviewFrameData request for the required season into an output data structure

    let teamNameResult$: Observable<string> = this.appData.getSeasonResult$(season, place).pipe(
      concatMap((res: SeasonResult) => this.appData.getTeamNameByTeamId$(res.teamId))
    );

    return combineLatest(
      this.appData.getSeasonBet$(season, place, userId),
      teamNameResult$,
      (bet: SeasonBet, teamName: string) => {
        return {
          place: place,
          resultTeamName: teamName,
          isBetFixed: bet.isFixed
        };
      }
    );
  }

  private getAllUserBets$(matchId: number): Observable<Bet> {
    // returns the bet of all active users

    return this.appData.getActiveUserIds$().pipe(
      concatMap((userId: string) => this.appData.getBet$(matchId, userId)),
      distinct()
    );
  }

  private getAllUserSeasonBets$(season: number): Observable<SeasonBet> {
    // returns the SeasonBet of all active users

    return this.appData.getActiveUserIds$().pipe(
      concatMap((userId: string) => this.relevantPlaces$.pipe(
        concatMap((place: number) => this.appData.getSeasonBet$(season, place, userId))
      )),
      distinct()
    );
  }

  private makeBetData$(betArray: Bet[]): Observable<BetOverviewUserData> {
    // creates BetOverviewUserData from a user bet

    return from(betArray).pipe(
      concatMap((bet: Bet) => this.appData.getUserDataById$(bet.userId).pipe(
        map((userData: User) => {
          return {
            matchId: bet.matchId,
            userName: userData.displayName,
            betGoalsHome: bet.goalsHome,
            betGoalsAway: bet.goalsAway,
            possibleOutsiderPoints: this.pointCalc.getPotentialOutsiderPoints(betArray, bet)
          };
        })
      ))
    )
  }

  private makeSeasonBetData$(bet: SeasonBet): Observable<SeasonBetOverviewUserData> {
    // creates SeasonBetOverviewUserData from a SeasonBet

    return combineLatest(
      this.appData.getUserDataById$(bet.userId),
      this.appData.getTeamNameByTeamId$(bet.teamId),

      (userData: User, teamName: string) => {
        return {
          place: bet.place,
          userName: userData.displayName,
          teamName: teamName
        };
      }
    );
  }
}
