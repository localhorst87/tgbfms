import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { MatchdataAccessService } from '../Dataaccess/matchdata-access.service';
import { MatchImportData } from '../Dataaccess/matchdata_datastructures';
import { Bet, Match, Result, Team } from '../Businessrules/basic_datastructures';

@Injectable({
  providedIn: 'root'
})
export class SynchronizeDataService {

  constructor(private appDataAccess: AppdataAccessService, private matchDataAccess: MatchdataAccessService) { }

  public syncData(season: number, matchday: number): void {
    // performs synchronization of Match and Result data of the app data
    // with the match data

    this.matchDataAccess.importMatchdata$(season, matchday).subscribe(
      (importedData: MatchImportData) => {

        this.syncMatch(season, importedData);
        this.syncResult(importedData);
      }
    );
  }

  private syncMatch(season: number, importedData: MatchImportData): void {
    // performs synchronization of Match data

    this.appDataAccess.getMatch$(importedData.matchId).pipe(take(1)).subscribe(
      (appdataMatch: Match) => {

        let importedMatch: Match = this.createMatch(season, importedData, appdataMatch.isTopMatch);

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

        let importedResult: Result = this.createResult(importedData);

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

  private createMatch(season: number, importedData: MatchImportData, isTopMatch: boolean = false): Match {
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

  private createResult(importedData: MatchImportData): Result {
    // creates a new Result structure for writing to the app database

    return {
      documentId: "",
      matchId: importedData.matchId,
      goalsHome: importedData.goalsHome,
      goalsAway: importedData.goalsAway
    };
  }

  private isMatchEqual(match: Match, matchExt: Match): boolean {
    // checks if all properties are equal and leaves out the document ID !

    return (match.season == matchExt.season &&
      match.matchday == matchExt.matchday &&
      match.matchId == matchExt.matchId &&
      match.timestamp == matchExt.timestamp &&
      match.isFinished == matchExt.isFinished &&
      match.isTopMatch == matchExt.isTopMatch &&
      match.teamIdHome == matchExt.teamIdHome &&
      match.teamIdAway == matchExt.teamIdAway);
  }

  private isResultEqual(result: Result, resultExt: Result): boolean {
    // checks if all properties are equal and leaves out the document ID !

    return (result.matchId == resultExt.matchId &&
      result.goalsHome == resultExt.goalsHome &&
      result.goalsAway == resultExt.goalsAway);
  }

}
