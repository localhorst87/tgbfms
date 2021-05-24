import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MatchImportData, TeamRankingImportData } from './import_datastructures';
import { MatchdataAccessService } from './matchdata-access.service';

const URL_TRUNK_MATCHES: string = "https://www.openligadb.de/api/getmatchdata/bl1";
const URL_TRUNK_RANKING: string = "https://www.openligadb.de/api/getbltable/bl1";

@Injectable()
export class MatchdataAccessOpenligaService implements MatchdataAccessService {
  constructor(private http: HttpClient) { }

  importMatchdata$(season: number, matchday: number): Observable<MatchImportData> {
    // imports the data of the given season and matchday
    // and extracts the required information to MatchImportData

    let fullUrl: string = URL_TRUNK_MATCHES + "/" + String(season) + "/" + String(matchday);
    return this.http.get(fullUrl, { responseType: 'json' }).pipe(
      switchMap(matchdayData => this.convertMatchdayJson$(matchdayData))
    );
  }

  importCurrentTeamRanking$(season: number): Observable<TeamRankingImportData> {
    // returns the table of the current campaign

    let fullUrl: string = URL_TRUNK_RANKING + "/" + String(season);
    return this.http.get(fullUrl, { responseType: 'json' }).pipe(
      switchMap(rankingData => this.convertRankingJson$(rankingData))
    );
  }

  private convertMatchdayJson$(matchdayJson: any): Observable<MatchImportData> {
    // converts the openligadb structure to MatchImportData structure

    let matchArray: MatchImportData[] = [];

    if (!("error" in matchdayJson)) {
      // http error throws object with error property
      // error response will result in empty matchArray

      for (let match of matchdayJson) { // no conversion if no match available
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

    }

    return from(matchArray);
  }

  private convertRankingJson$(rankingJson: any): Observable<TeamRankingImportData> {
    // converts the openligadb structure to TeamRankingImportData structure

    let rankingArray: TeamRankingImportData[] = [];

    if (!("error" in rankingJson)) {
      // http error throws object with error property
      // error response will result in empty matchArray

      for (let team of rankingJson) {
        let rankingElement: TeamRankingImportData = {
          teamId: team.TeamInfoId,
          matches: team.Matches,
          points: team.Points,
          won: team.Won,
          draw: team.Draw,
          lost: team.Lost,
          goals: team.Goals,
          goalsAgainst: team.OpponentGoals
        };
        rankingArray.push(rankingElement);
      }

    }

    return from(rankingArray);
  }

  private extractResult(matchJson: any): number[] {
    // searches for the final result in the result structure of a specific
    // match structure of openligadb

    let extractedResult: number[] = [-1, -1]; // default value

    if (this.isMatchStarted(matchJson)) {

      if (matchJson.MatchResults.length == 2) { // final result available?
        for (let result of matchJson.MatchResults) {
          if (result.ResultTypeID == 2) { // ResultTypeID == 2 -> final result
            extractedResult = [result.PointsTeam1, result.PointsTeam2];
            break;
          }
        }
      }
      else { // if final result not available, extract live score instead
        extractedResult = [0, 0]; // basic value if no goals scored, yet
        for (let goal of matchJson.Goals) {
          extractedResult = [goal.ScoreTeam1, goal.ScoreTeam2]; // last goal will be stored on variable
        }
      }
    }

    return extractedResult;
  }

  private isMatchStarted(matchJson: any): boolean {
    let matchTimestamp: number = new Date(matchJson.MatchDateTime).getTime();

    if (matchTimestamp == null) { // corrupt format
      return false;
    }
    else {
      let currentTimestamp: number = Date.now();
      return currentTimestamp >= matchTimestamp;
    }
  }
}
