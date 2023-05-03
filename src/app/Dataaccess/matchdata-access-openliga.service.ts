import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MatchImportData, TeamRankingImportData } from './import_datastructures';
import { MatchdataAccessService } from './matchdata-access.service';

const URL_TRUNK_MATCHES: string = "https://api.openligadb.de/getmatchdata/bl1";
const URL_TRUNK_RANKING: string = "https://api.openligadb.de/getbltable/bl1";
const URL_TRUNK_TEAMS: string = "https://api.openligadb.de/getavailableteams/bl1"
const URL_TRUNK_UPDATETIME: string = "https://api.openligadb.de/getlastchangedate/bl1";
const URL_TRUNK_MATCHDAY: string = "https://api.openligadb.de/getcurrentgroup/bl1";

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

  getActiveTeams$(season: number): Observable<number> {
    // returns all the team IDs of the current campaign

    let fullUrl: string = URL_TRUNK_TEAMS + "/" + String(season);
    return this.http.get(fullUrl, { responseType: 'json' }).pipe(
      switchMap(teamData => this.convertTeamJson$(teamData))
    );
  }

  getLastUpdateTime$(season: number, matchday: number): Observable<number> {
    // returns the time when the data of the season/matchday was changed the last time

    let fullUrl: string = URL_TRUNK_UPDATETIME + "/" + String(season) + "/" + String(matchday);
    return this.http.get(fullUrl, { responseType: 'json' }).pipe(
      switchMap(updateTime => this.convertUpdateTime$(updateTime))
    );
  }

  getCurrentMatchday$(): Observable<number> {
    // returns the current matchday of the campaign

    return this.http.get(URL_TRUNK_MATCHDAY, { responseType: 'json' }).pipe(
      switchMap(currentMatchday => this.convertCurrentMatchdayJson$(currentMatchday))
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
          matchday: match.group.groupOrderID,
          matchId: match.matchID,
          datetime: match.matchDateTime,
          isFinished: match.matchIsFinished,
          teamIdHome: match.team1.teamId,
          teamIdAway: match.team2.teamId,
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
          teamId: team.teamInfoId,
          matches: team.matches,
          points: team.points,
          won: team.won,
          draw: team.draw,
          lost: team.lost,
          goals: team.goals,
          goalsAgainst: team.opponentGoals
        };
        rankingArray.push(rankingElement);
      }

    }

    return from(rankingArray);
  }

  private convertUpdateTime$(updateTime: any): Observable<number> {
    // converts the imported updateTime into unix timestamp in seconds

    let convertedTimestamp: number = -1; // default Date with timestamp -1

    if (typeof updateTime == "string") {
      let timeString: string = String(updateTime).trim();
      if (timeString != "") {
        let convertedDate: Date = new Date(timeString);
        convertedTimestamp = Math.floor(convertedDate.getTime() / 1000);
      }
    }

    return of(convertedTimestamp);
  }

  private convertTeamJson$(teamDataJson: any): Observable<number> {
    // extracts the team ID from the structure

    let teamIds: number[] = [];

    if (!("error" in teamDataJson)) {
      // http error throws object with error property
      // error response will result in empty matchArray

      for (let team of teamDataJson) {
        teamIds.push(team.teamId);
      }
    }

    return from(teamIds);
  }

  private convertCurrentMatchdayJson$(matchdayJson: any): Observable<number> {
    // extracts the matchday from the JSON structure

    if (!("error" in matchdayJson)) {
      // http error throws object with error property
      // error response will result in empty matchArray

      return of(matchdayJson.groupOrderID);
    }
    else {
      return of(-1);
    }
  }

  private extractResult(matchJson: any): number[] {
    // searches for the final result in the result structure of a specific
    // match structure of openligadb

    let extractedResult: number[] = [-1, -1]; // default value

    if (this.isMatchStarted(matchJson)) {

      if (matchJson.matchResults.length == 2) { // final result available?
        for (let result of matchJson.matchResults) {
          if (result.resultTypeID == 2) { // resultTypeID == 2 -> final result
            extractedResult = [result.pointsTeam1, result.pointsTeam2];
            break;
          }
        }
      }
      else { // if final result not available, extract live score instead
        extractedResult = [0, 0]; // basic value if no goals scored, yet
        for (let goal of matchJson.goals) {
          extractedResult = [goal.scoreTeam1, goal.scoreTeam2]; // last goal will be stored on variable
        }
      }
    }

    return extractedResult;
  }

  private isMatchStarted(matchJson: any): boolean {
    let matchTimestamp: number = new Date(matchJson.matchDateTime).getTime();

    if (matchTimestamp == null) { // corrupt format
      return false;
    }
    else {
      let currentTimestamp: number = Date.now();
      return currentTimestamp >= matchTimestamp;
    }
  }
}
