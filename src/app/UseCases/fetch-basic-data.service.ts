import { Injectable } from '@angular/core';
import { Observable, of, from, range, concat, iif, combineLatest } from 'rxjs';
import { tap, map, mergeMap, concatMap, pluck, distinct, filter, first, toArray } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { MatchdataAccessService } from '../Dataaccess/matchdata-access.service';
import { Bet, Match, Team, SeasonBet } from '../Businessrules/basic_datastructures';
import { MatchInfo, TeamStats } from './output_datastructures';
import { TeamRankingImportData } from '../Dataaccess/import_datastructures';
import { RELEVANT_FIRST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT, SEASON } from '../Businessrules/rule_defined_values';

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

  public fetchNextMatchInfos$(season: number, userId: string, amount: number = 1): Observable<MatchInfo> {
    // returns information about the next match as Observable

    return this.appData.getNextMatch$(SEASON, amount).pipe(
      concatMap((nextMatch: Match) => this.makeMatchInfo$(nextMatch, userId))
    );
  }

  public fetchTopMatchInfos$(season: number, userId: string, matchday: number): Observable<MatchInfo> {
    // returns information about the top match of the given matchday as Observable

    return this.appData.getTopMatch$(SEASON, matchday).pipe(
      mergeMap((topMatch: Match) => this.makeMatchInfo$(topMatch, userId))
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

  public getClosestMatchday$(): Observable<number> {
    // returns the closest matchday in terms of time difference

    return combineLatest(
      this.appData.getNextMatch$(SEASON),
      this.appData.getLastMatch$(SEASON),
      this.getCurrentTimestamp$(),
      (nextMatch: Match, lastMatch: Match, timestampNow: number) => {
        let diffNextMatch: number = Math.abs(nextMatch.timestamp - timestampNow);
        let diffLastMatch: number = Math.abs(lastMatch.timestamp - timestampNow);
        return (diffNextMatch <= diffLastMatch ? nextMatch.matchday : lastMatch.matchday);
      }
    );
  }

  private makeMatchInfo$(match: Match, userId: string): Observable<MatchInfo> {
    // converts to MatchInfo Observable

    return combineLatest(
      this.appData.getTeamByTeamId$(match.teamIdHome),
      this.appData.getTeamByTeamId$(match.teamIdAway),
      this.getTeamStats$(match.teamIdHome),
      this.getTeamStats$(match.teamIdAway),
      this.appData.getBet$(match.matchId, userId),

      (teamHome: Team, teamAway: Team, statsHome: TeamStats, statsAway: TeamStats, userBet: Bet) => {
        return {
          matchDate: new Date(match.timestamp * 1000),
          matchday: match.matchday,
          teamNameHome: teamHome.nameLong,
          teamNameAway: teamAway.nameLong,
          teamNameShortHome: teamHome.nameShort,
          teamNameShortAway: teamAway.nameShort,
          placeHome: statsHome.place,
          placeAway: statsAway.place,
          pointsHome: statsHome.points,
          pointsAway: statsAway.points,
          betGoalsHome: userBet.goalsHome,
          betGoalsAway: userBet.goalsAway
        };
      }
    );
  }

  private getTeamStats$(teamId: number): Observable<TeamStats> {
    // returns the stats of the team with the given team ID as Observable

    return this.matchData.importCurrentTeamRanking$(SEASON).pipe(
      toArray(),
      map((teamRankingArray: TeamRankingImportData[]) => {
        let arrIdx: number = teamRankingArray.findIndex(rankingRow => rankingRow.teamId == teamId);
        return {
          place: arrIdx + 1,
          points: teamRankingArray[arrIdx].points
        };
      }
      ),
    );
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
