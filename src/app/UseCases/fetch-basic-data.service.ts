import { Injectable } from '@angular/core';
import { Observable, of, from, range, concat, iif, combineLatest } from 'rxjs';
import { tap, map, mergeMap, concatMap, pluck, distinct, filter, first, toArray } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { MatchdataAccessService } from '../Dataaccess/matchdata-access.service';
import { Bet, Match, Team, SeasonBet } from '../Businessrules/basic_datastructures';
import { RELEVANT_FIRST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT } from '../Businessrules/rule_defined_values';

@Injectable({
  providedIn: 'root'
})
export class FetchBasicDataService {

  relevantPlaces$: Observable<number>;

  constructor(private appData: AppdataAccessService, private matchData: MatchdataAccessService) {
    this.relevantPlaces$ = concat(
      range(1, RELEVANT_FIRST_PLACES_COUNT),
      range(-RELEVANT_LAST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT)
    );
  }

  public fetchActiveTeams$(season: number): Observable<Team> {
    // returns the requested frame data (data without user bets) as Observable

    return this.matchData.getActiveTeams$(season).pipe(
      mergeMap((teamId: number) => this.appData.getTeamByTeamId$(teamId)),
      distinct()
    );
  }

  public fetchNextFixTime$(season: number): Observable<number> {
    // returns the timestamp when open Bets need to be fixed the next time
    // returns -1 if no next Match is known to the app data

    return this.appData.getNextMatch$(season).pipe(
      map((match: Match) => match.timestamp)
    );
  }

  public fetchOpenOverdueBets$(season: number, matchday: number): Observable<Bet> {
    // returns all open bets of the given season and matchday whose associated
    // Match has begun

    let timestampNow: number = Math.floor((new Date()).getTime() / 1000);

    return this.appData.getMatchesByMatchday$(season, matchday).pipe(
      filter((match: Match) => timestampNow >= match.timestamp),
      pluck("matchId"),
      concatMap((matchId: number) => this.appData.getOpenBets$(matchId)),
    );
  }

  public fetchOpenOverdueSeasonBets$(season: number): Observable<SeasonBet> {
    // returns all open season bets of the given season

    let openSeasonBets$: Observable<SeasonBet> = this.appData.getActiveUserIds$().pipe(
      concatMap((userId: string) => this.relevantPlaces$.pipe(
        concatMap((place: number) => this.appData.getSeasonBet$(season, place, userId)))),
      filter((seasonBet: SeasonBet) => seasonBet.isFixed == false && seasonBet.documentId != "")
    );

    return combineLatest(this.getCurrentTimestamp$(), this.getFirstMatchTimestamp$(season)).pipe(
      mergeMap(([currentTimestamp, firstMatchTimestamp]) =>
        iif(() => currentTimestamp >= firstMatchTimestamp, openSeasonBets$))
    );
  }

  public getCurrentTimestamp$(): Observable<number> {
    // returns the current time as Observable

    let timestampNow: number = Math.floor((new Date()).getTime() / 1000);
    return of(timestampNow);
  }

  private getFirstMatchTimestamp$(season: number): Observable<number> {
    // returns the timestamp of the

    return this.appData.getMatchesByMatchday$(season, 1).pipe(
      toArray(),
      map((matchArray: Match[]) => matchArray.sort((a, b) => a.timestamp - b.timestamp)),
      concatMap((sortedMatchArray: Match[]) => from(sortedMatchArray)),
      map((match: Match) => match.timestamp),
      first()
    );
  }

}
