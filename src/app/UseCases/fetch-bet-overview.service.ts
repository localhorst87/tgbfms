import { Injectable } from '@angular/core';
import { Observable, combineLatest, range, concat, from, of } from 'rxjs';
import { map, mergeMap, concatMap, distinct, toArray } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { PointCalculatorService } from '../Businessrules/point-calculator.service';
import { Bet, Match, SeasonBet, SeasonResult, User, Team } from '../Businessrules/basic_datastructures';
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
      concatMap((match: Match) => this.makeFrameData$(match, userId)),
      distinct()
    );
  }

  public fetchUserBetDataByMatchday$(matchId: number, dummyExceptUserId?: string): Observable<BetOverviewUserData> {
    // returns the requested bet data of all users as Observable
    // if a user ID in dummyExceptUserId is given, a dummy Bet will be returned
    // for all user Bets, except the given ID in dummyExceptUserId

    return this.getAllUserBets$(matchId, dummyExceptUserId).pipe(
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

  public fetchUserSeasonBetData$(season: number, place: number, dummyExceptUserId?: string): Observable<SeasonBetOverviewUserData> {
    // returns the request season bet data of all users for the bet overview

    return this.getAllUserSeasonBets$(season, place, dummyExceptUserId).pipe(
      mergeMap((bet: SeasonBet) => this.makeSeasonBetData$(bet)),
      distinct()
    );
  }

  private makeFrameData$(match: Match, userId: string): Observable<BetOverviewFrameData> {
    // processes the BetOverviewFrameData request for the required match into an output data structure

    return combineLatest(
      this.appData.getTeamByTeamId$(match.teamIdHome),
      this.appData.getTeamByTeamId$(match.teamIdAway),
      this.appData.getBet$(match.matchId, userId),

      (teamHome: Team, teamAway: Team, betUser: Bet) => {
        return {
          matchId: match.matchId,
          matchDate: new Date(match.timestamp * 1000),
          isTopMatch: match.isTopMatch,
          teamNameHome: teamHome.nameLong,
          teamNameAway: teamAway.nameLong,
          teamNameShortHome: teamHome.nameShort,
          teamNameShortAway: teamAway.nameShort,
          resultGoalsHome: match.goalsHome,
          resultGoalsAway: match.goalsAway,
          isMatchFinished: match.isFinished,
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

  private getAllUserBets$(matchId: number, dummyExceptUserId?: string): Observable<Bet> {
    // returns the bet of all active users. If dummyExceptUserId is given, only
    // the Bet with this user ID will be retrieved, for the other users, a dummy
    // Bet (secret bet) will be returned --> saves database volume, in case the
    // Bet is not accessible for the user

    return this.appData.getActiveUserIds$().pipe(
      concatMap((userId: string) => {
        if (dummyExceptUserId && userId != dummyExceptUserId) {
          return this.makeDummyBet$(matchId, userId);
        }
        else {
          return this.appData.getBet$(matchId, userId);
        }
      }),
      distinct()
    );
  }

  private getAllUserSeasonBets$(season: number, place: number, dummyExceptUserId?: string): Observable<SeasonBet> {
    // returns the SeasonBet of all active users for the given place

    return this.appData.getActiveUserIds$().pipe(
      concatMap((userId: string) => {
        if (dummyExceptUserId && userId != dummyExceptUserId) {
          return this.makeDummySeasonBet$(season, place, userId);
        }
        else {
          return this.appData.getSeasonBet$(season, place, userId);
        }
      }),
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
            userId: userData.id,
            userName: userData.displayName,
            betGoalsHome: bet.goalsHome,
            betGoalsAway: bet.goalsAway,
            isBetFixed: bet.isFixed,
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
          userId: userData.id,
          userName: userData.displayName,
          teamName: teamName,
          isBetFixed: bet.isFixed
        };
      }
    );
  }

  private makeDummyBet$(matchId: number, userId: string): Observable<Bet> {
    // creates a dummy Bet with the given match und user ID

    return of({
      documentId: "",
      matchId: matchId,
      userId: userId,
      isFixed: false,
      goalsHome: -1,
      goalsAway: -1
    });
  }

  private makeDummySeasonBet$(season: number, place: number, userId: string): Observable<SeasonBet> {
    // creates a ummy SeasonBet with the given data

    return of({
      documentId: "",
      season: season,
      userId: userId,
      isFixed: false,
      place: place,
      teamId: -1
    });
  }
}
