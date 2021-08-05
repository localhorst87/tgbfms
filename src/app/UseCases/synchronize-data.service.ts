import { Injectable } from '@angular/core';
import { Observable, combineLatest, range, concat } from 'rxjs';
import { take, toArray, concatMap } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { MatchdataAccessService } from '../Dataaccess/matchdata-access.service';
import { MatchImportData, TeamRankingImportData, SyncTime } from '../Dataaccess/import_datastructures';
import { Bet, Match, Result, Team, SeasonResult } from '../Businessrules/basic_datastructures';
import { RELEVANT_FIRST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT } from '../Businessrules/rule_defined_values';

@Injectable({
  providedIn: 'root'
})
export class SynchronizeDataService {

  relevantPlaces$: Observable<number>;

  constructor(private appDataAccess: AppdataAccessService, private matchDataAccess: MatchdataAccessService) {
    this.relevantPlaces$ = concat(
      range(1, RELEVANT_FIRST_PLACES_COUNT),
      range(-RELEVANT_LAST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT)
    );
  }

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

          this.refreshUpdateTime(season, matchday);
        }
      }
    );
  }

  private isSyncNeeded$(season: number, matchday: number): Observable<boolean> {
    // checks if a synchronization  for the given season and matchday is needed

    return combineLatest(
      this.appDataAccess.getSyncTime$(season, matchday),
      this.matchDataAccess.getLastUpdateTime$(season, matchday),
      (updateTimeAppData: SyncTime, updateTimeMatchData: number) => {
        return updateTimeMatchData > updateTimeAppData.timestamp;
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

    this.relevantPlaces$.pipe(
      concatMap((place: number) => this.appDataAccess.getSeasonResult$(season, place))
    ).subscribe(
      (appdataResult: SeasonResult) => {
        let place: number = appdataResult.place; // place > 0 -> first places, place < 0 -> last places
        let elImportData = (place > 0) ? place - 1 : place + nImports; // instruction which element to take from the imported data (from front or end)

        let importedResult: SeasonResult = this.convertToSeasonResult(season, place, importedData[elImportData]);

        if (appdataResult.teamId == -1) { // SeasonResult not availabe in app database
          this.appDataAccess.addSeasonResult(importedResult);
          return;
        }

        if (!this.isSeasonResultEqual(appdataResult, importedResult)) { // available, but not up to date
          this.appDataAccess.updateSeasonResult(appdataResult.documentId, importedResult);
        }
      }
    );
  }

  private refreshUpdateTime(season: number, matchday: number): void {
    // updates the new snyc time in the app database

    this.appDataAccess.getSyncTime$(season, matchday).subscribe(
      (syncTime: SyncTime) => {
        if (syncTime.documentId == "") {
          syncTime.documentId = this.appDataAccess.createDocumentId();
        }
        syncTime.timestamp = Math.floor((new Date()).getTime() / 1000); // new timestamp
        this.appDataAccess.setSyncTime(syncTime);
      }
    );
  }

  private convertToSeasonResult(season: number, place: number, teamRankingRow: TeamRankingImportData): SeasonResult {
    // creates a new SeasonResult object from the given import data

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
