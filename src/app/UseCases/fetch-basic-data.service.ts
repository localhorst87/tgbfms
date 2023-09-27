import { Injectable } from '@angular/core';
import { Observable, of, from, range, concat, iif, combineLatest } from 'rxjs';
import { map, switchMap, mergeMap, concatMap, pluck, distinct, filter, first, last, toArray, reduce } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { MatchdataAccessService } from '../Dataaccess/matchdata-access.service';
import { Bet, Match, Team, SeasonBet } from '../Businessrules/basic_datastructures';
import { MatchInfo, TeamStats } from './output_datastructures';
import { TeamRankingImportData } from '../Dataaccess/import_datastructures';
import { RELEVANT_FIRST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT, SEASON } from '../Businessrules/rule_defined_values';

const THRESHOLD_POSTPONED_MATCH: number = 3 * 86400;

@Injectable({
  providedIn: 'root'
})
export class FetchBasicDataService {

  relevantPlaces$: Observable<number>;

  constructor(
    private appData: AppdataAccessService,
    private matchData: MatchdataAccessService) {
    this.relevantPlaces$ = concat(
      range(1, RELEVANT_FIRST_PLACES_COUNT),
      range(-RELEVANT_LAST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT)
    );
  }

  public fetchNumberOfUsers$(): Observable<number> {
    // returns the number of users as Observable

    return this.appData.getActiveUserIds$().pipe(
      toArray(),
      map((userIds: string[]) => userIds.length)
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

  public getMatchdayOfNextMatch$(): Observable<number> {
    // returns -1 if no matches are left in the current season (= season ended)

    return this.appData.getNextMatch$(SEASON).pipe(
      pluck("matchId"),
      switchMap((idNextMatch: number) => this.appData.getMatchdayByMatchId$(idNextMatch))
    );
  }

  public getMatchdayOfLastMatch$(): Observable<number> {
    // return -1 if no matches are completed in the current season (= season not yet started)

    return this.appData.getLastMatch$(SEASON).pipe(
      pluck("matchId"),
      switchMap((idLastMatch: number) => this.appData.getMatchdayByMatchId$(idLastMatch))
    );
  }

  public getFinishedMatchday$(season: number): Observable<number> {
    // returns the highest matchday that is finished

    return this.getCurrentMatchday$(season).pipe(
      concatMap((matchday: number) => this.matchdayIsFinished$(season, matchday).pipe(
        map((isFinished: boolean) => {
          if (isFinished) return matchday;
          else return matchday - 1;
        })
      ))
    );
  }

  public getCurrentMatchday$(season: number): Observable<number> {
    // returns an approximation (based on the last 10 matches) of the current
    // matchday

    return this.appData.getLastMatch$(season, 10).pipe(
      pluck("matchday"),
      reduce((max, val) => val > max ? val : max),
      map((matchday: number) => {
        if (matchday > -1) {
          return matchday;
        }
        else { // no matches available
          return 1;
        }
      })
    );
  }

  public matchdayIsFinished$(season: number, matchday: number): Observable<boolean> {
    // returns true if the last match (that's not postponed) of the matchday is finished

    return this.appData.getMatchesByMatchday$(season, matchday).pipe(
      filter((match: Match) => match.timestamp > -1),
      toArray(),
      map((matches: Match[]) => matches.sort((a, b) => a.timestamp - b.timestamp)), // sort ascending)
      map((matches: Match[]) => {
        const timestampFirst: number = matches[0].timestamp;
        return matches.filter(match => match.timestamp - timestampFirst < THRESHOLD_POSTPONED_MATCH);
      }), // filter out postponed matches
      switchMap((matches: Match[]) => from(matches)),
      last(),
      map((lastMatch: Match) => lastMatch.isFinished)
    );
  }

  public matchdayHasBegun$(season: number, matchday: number, toleranceSeconds: number = 0): Observable<boolean> {
    // returns true if any match of the given matchday has begun or finished

    return combineLatest(
      this.appData.getFirstMatchOfMatchday$(season, matchday),
      this.getCurrentTimestamp$(),
      (firstMatch: Match, currentTimestamp: number) => {
        return firstMatch.timestamp > -1 && (currentTimestamp > (firstMatch.timestamp + toleranceSeconds));
      }
    );
  }

  public isBetCorrect(betGoalsHome: number, betGoalsAway: number, resultGoalsHome: number, resultGoalsAway: number): boolean {
    // returns true if the Bet and Match tendecy correlate

    let bet: any = {
      goalsHome: betGoalsHome,
      goalsAway: betGoalsAway
    };

    let result: any = {
      goalsHome: resultGoalsHome,
      goalsAway: resultGoalsAway
    }

    return this.isTendencyCorrect(bet, result);
  }

  private isTendencyCorrect(subject1: any, subject2: any) {
    return this.getTendency(subject1) == this.getTendency(subject2);
  }

  private getTendency(subject: any) {
    const diff: number = subject.goalsHome - subject.goalsAway;

    if (diff > 0) {
      return 1;
    }
    else if (diff < 0) {
      return 2;
    }
    else {
      return 0;
    }
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
          betGoalsAway: userBet.goalsAway,
          isTopMatch: match.isTopMatch
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
    // returns the timestamp of the first match of the season

    return this.appData.getMatchesByMatchday$(season, 1).pipe(
      toArray(),
      map((matchArray: Match[]) => matchArray.sort((a, b) => a.timestamp - b.timestamp)),
      concatMap((sortedMatchArray: Match[]) => from(sortedMatchArray)),
      map((match: Match) => match.timestamp),
      first()
    );
  }

}
