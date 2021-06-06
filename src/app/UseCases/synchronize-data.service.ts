import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { MatchdataAccessService } from '../Dataaccess/matchdata-access.service';
import { MatchImportData, TeamRankingImportData } from '../Dataaccess/import_datastructures';
import { Bet, Match, Result, Team, SeasonResult } from '../Businessrules/basic_datastructures';

const RELEVANT_FIRST_PLACES_COUNT: number = 2; // indicates number of first places of season bets to evaluate
const RELEVANT_LAST_PLACES_COUNT: number = 3; // indicates number of last places of season bets to evaluate

@Injectable({
  providedIn: 'root'
})
export class SynchronizeDataService {

  constructor(private appDataAccess: AppdataAccessService, private matchDataAccess: MatchdataAccessService) { }

  public syncData(season: number, matchday: number): void {
    // performs synchronization of Match and Result data of the app data
    // with the match data

    this.isSyncNeeded$(season, matchday).subscribe(
      (isNeeded: boolean) => {
        if (isNeeded) {

          this.matchDataAccess.importMatchdata$(season, matchday).subscribe(
            (importedMatch: MatchImportData) => {
              this.syncMatch(season, importedMatch);
              this.syncResult(importedMatch);
            }
          );

          this.matchDataAccess.importCurrentTeamRanking$(season).pipe(toArray()).subscribe(
            (importedRanking: TeamRankingImportData[]) => {
              this.syncSeasonResult(season, importedRanking);
            }
          );

        }
      }
    );
  }

  private isSyncNeeded$(season: number, matchday: number): Observable<boolean> {
    // checks if a synchronization  for the given season and matchday is needed

    return combineLatest(
      this.appDataAccess.getLastUpdateTime$(season, matchday),
      this.matchDataAccess.getLastUpdateTime$(season, matchday),
      (updateTimeAppData: number, updateTimeMatchData: number) => {
        return updateTimeMatchData > updateTimeAppData;
      }
    );
  }

  private syncMatch(season: number, importedData: MatchImportData): void {
    // performs synchronization of Match data

    this.appDataAccess.getMatch$(importedData.matchId).pipe(take(1)).subscribe(
      (appdataMatch: Match) => {

        let importedMatch: Match = this.convertToMatch(season, importedData, appdataMatch.isTopMatch);

        if (appdataMatch.documentId == "") { // match not yet exported to database
          this.appDataAccess.addMatch(importedMatch);
        }
        else if (!this.isMatchEqual(importedMatch, appdataMatch)) { // available, but not up to date
          this.appDataAccess.updateMatch(appdataMatch.documentId, importedMatch);
        }

      }
    );
  }

  private syncResult(importedData: MatchImportData): void {
    // performs synchronization of Result data

    this.appDataAccess.getResult$(importedData.matchId).pipe(take(1)).subscribe(
      (appdataResult: Result) => {

        let importedResult: Result = this.convertToResult(importedData);

        if (importedResult.goalsHome >= 0 && importedResult.goalsAway >= 0) { // result is available

          if (appdataResult.documentId == "") { // result not yet exported to database
            this.appDataAccess.addResult(importedResult);
          }
          else if (!this.isResultEqual(importedResult, appdataResult)) { // available, but not up to date
            this.appDataAccess.updateResult(appdataResult.documentId, importedResult);
          }

        }

      }
    );
  }

  private syncSeasonResult(season: number, importedData: TeamRankingImportData[]): void {
    // synchronizes SeasonResults in app database

    const numRequiredResults: number = RELEVANT_FIRST_PLACES_COUNT + RELEVANT_LAST_PLACES_COUNT;
    const nImports: number = importedData.length;

    if (nImports < numRequiredResults) { // not enough data available?
      return;
    }

    this.appDataAccess.getSeasonResults$(season).pipe(toArray()).subscribe(
      (appdataResults: SeasonResult[]) => {

        // first places
        for (let i = 1; i <= RELEVANT_FIRST_PLACES_COUNT; i++) {

          let importedResult: SeasonResult = this.convertToSeasonResult(season, i, importedData[i - 1]);
          let appdataResult: SeasonResult[] = appdataResults.filter(result => result.place == i);

          if (appdataResult.length == 0) { // SeasonResult not availabe in app database
            this.appDataAccess.addSeasonResult(importedResult);
            continue;
          }

          if (!this.isSeasonResultEqual(appdataResult[0], importedResult)) { // available, but not up to date
            this.appDataAccess.updateSeasonResult(appdataResult[0].documentId, importedResult);
          }
        }

        // last places
        for (let i = -1; i >= -RELEVANT_LAST_PLACES_COUNT; i--) {

          // in case of 18 teams, -1 is the 18th place, -2 is the 17th place, ...
          let importedResult: SeasonResult = this.convertToSeasonResult(season, i, importedData[i + nImports]);
          let appdataResult: SeasonResult[] = appdataResults.filter(result => result.place == i);

          if (appdataResult.length == 0) { // SeasonResult not availabe in app database
            this.appDataAccess.addSeasonResult(importedResult);
            continue;
          }

          if (!this.isSeasonResultEqual(appdataResult[0], importedResult)) { // available, but not up to date
            this.appDataAccess.updateSeasonResult(appdataResult[0].documentId, importedResult);
          }
        }

      }
    );
  }

  private convertToSeasonResult(season: number, place: number, teamRankingRow: TeamRankingImportData) {
    //

    return {
      documentId: "",
      season: season,
      place: place,
      teamId: teamRankingRow.teamId
    };
  }

  private convertToMatch(season: number, importedData: MatchImportData, isTopMatch: boolean = false): Match {
    // creates a new Match structure for writing to the app database

    return {
      documentId: "",
      season: season,
      matchday: importedData.matchday,
      matchId: importedData.matchId,
      timestamp: new Date(importedData.datetime).getTime() / 1000,
      isFinished: importedData.isFinished,
      isTopMatch: isTopMatch,
      teamIdHome: importedData.teamIdHome,
      teamIdAway: importedData.teamIdAway
    };
  }

  private convertToResult(importedData: MatchImportData): Result {
    // creates a new Result structure for writing to the app database

    return {
      documentId: "",
      matchId: importedData.matchId,
      goalsHome: importedData.goalsHome,
      goalsAway: importedData.goalsAway
    };
  }

  private isMatchEqual(match1: Match, match2: Match): boolean {
    // checks if all properties are equal and leaves out the document ID !

    return (match1.season == match2.season &&
      match1.matchday == match2.matchday &&
      match1.matchId == match2.matchId &&
      match1.timestamp == match2.timestamp &&
      match1.isFinished == match2.isFinished &&
      match1.isTopMatch == match2.isTopMatch &&
      match1.teamIdHome == match2.teamIdHome &&
      match1.teamIdAway == match2.teamIdAway);
  }

  private isResultEqual(result1: Result, result2: Result): boolean {
    // checks if all properties are equal and leaves out the document ID !

    return (result1.matchId == result2.matchId &&
      result1.goalsHome == result2.goalsHome &&
      result1.goalsAway == result2.goalsAway);
  }

  private isSeasonResultEqual(result1: SeasonResult, result2: SeasonResult): boolean {
    // checks if all properties are equal, except the document ID

    return (result1.season == result2.season &&
      result1.place == result2.place &&
      result1.teamId == result2.teamId);
  }

}
