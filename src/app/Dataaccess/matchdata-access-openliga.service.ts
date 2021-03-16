import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MatchImportData } from './matchdata_datastructures';
import { MatchdataAccessService } from './matchdata-access.service';

const URL_TRUNK: string = "https://www.openligadb.de/api/getmatchdata/bl1";

@Injectable()
export class MatchdataAccessOpenligaService implements MatchdataAccessService {
  constructor(private http: HttpClient) { }

  importMatchdata(season: number, matchday: number): Observable<MatchImportData> {
    // imports the data of the given season and matchday
    // and extracts the required information to MatchImportData

    let fullUrl: string = URL_TRUNK + "/" + String(season) + "/" + String(matchday);
    return this.http.get(fullUrl, { responseType: 'json' }).pipe(
      switchMap(matchdayData => this.convertMatchdayJson(matchdayData))
    );
  }

  private convertMatchdayJson(matchdayJson: any): Observable<MatchImportData> {
    // converts the openligadb structure to MatchImportData structure

    let matchArray: MatchImportData[] = [];
    for (let match of matchdayJson) {
      let goals: number[] = this.extractResult(match);
      let matchImport: MatchImportData = {
        matchday: match.Group.GroupOrderID,
        matchId: match.MatchID,
        datetime: match.MatchDateTime,
        isFinished: match.MatchIsFinished,
        teamIdHome: match.Team1.TeamId,
        teamIdAway: match.Team2.TeamId,
        goalsHome: goals[0],
        goalsAway: goals[1]
      }
      matchArray.push(matchImport);
    }
    return from(matchArray);
  }

  private extractResult(matchJson: any): number[] {
    // searches for the final result in the result structure of a specific
    // match structure of openligadb

    let extractedResult: number[] = [-1, -1];
    if (matchJson.MatchResults.length > 0) {
      for (let result of matchJson.MatchResults) {
        if (result.ResultTypeID == 2) { // search for final result
          extractedResult = [result.PointsTeam1, result.PointsTeam2];
          break;
        }
      }
    }
    return extractedResult;
  }
}
