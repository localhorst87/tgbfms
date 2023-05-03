import { MatchImportData, TeamRankingImportData } from "./import_datastructures";
import { isDstObserved, isDatestringUTC } from "../util";

/**
 * Converts the result of the http request for update time of matchday into
 * a unix timestamp. If the result of the request is empty or has not expected
 * format, it will return -1
 *
 * @param {any} updateTime the result data of the http request (expected: Date string)
 * @return {number} converted unix timestamp in seconds (not milliseconds !)
 */
export function convertUpdateTime(updateTime: any): number {
  let convertedTimestamp: number = -1; // default Date with timestamp -1

  if (typeof updateTime == "string") {
    let dateString: string = String(updateTime).trim();
    if (dateString != "") {
      // openligadb does not provide a UTC Date string, but a Date string for
      // the CET Time. Therefore an additional information for the time zone
      // has to be added to the Date string
      if (!isDatestringUTC(dateString)) {
        if (isDstObserved(dateString))
          dateString = dateString.concat("+02:00");
        else
          dateString = dateString.concat("+01:00");
      }
      let convertedDate: Date = new Date(dateString);

      if (convertedDate.getTime())
        convertedTimestamp = Math.floor(convertedDate.getTime() / 1000);
    }
  }

  return convertedTimestamp;
}

/**
 * Converts the result of the http request for match data into MatchImportData.
 * If the result of the request is empty or has not expected format, it will
 * return an empty array
 *
 * @param {any} matchdayJson the result data of the http request (expected to be an array)
 * @param {number} season the season for that data has been requests (e.g. 2022
 *                        for the 2022/23 campaign)
 * @return {MatchImportData[]} array of converted match data
 */
export function convertMatchdayJson(matchdayJson: any, season: number): MatchImportData[] {
  // converts the openligadb structure to MatchImportData structure

  let matchArray: MatchImportData[] = [];

  if (!Array.isArray(matchdayJson))
    return matchArray;

  for (let match of matchdayJson) { // no conversion if no match available
    let goals: number[] = extractResult(match);
    let matchImport: MatchImportData = {
      season: season,
      matchday: match.group.groupOrderID,
      matchId: match.matchID,
      datetime: match.matchDateTimeUTC,
      isFinished: match.matchIsFinished,
      teamIdHome: match.team1.teamId,
      teamIdAway: match.team2.teamId,
      goalsHome: goals[0],
      goalsAway: goals[1]
    }
    matchArray.push(matchImport);
  }

  return matchArray;
}

/**
 * Extracts the result of an imported match (from the openligadb-RESTful API).
 * In case the match is not yet started, it returns [-1, -1].
 * In case the match has started, but is not finished, it returns the live score.
 *
 * @param {any} matchJson single match structure from the imported array of match structures
 * @return {number[]} match result, in the form [homeGoals, awayGoals]
 */
function extractResult(matchJson: any): number[] {
  // searches for the final result in the result structure of a specific
  // match structure of openligadb

  let extractedResult: number[] = [-1, -1]; // default value

  if (isMatchStarted(matchJson)) {

    if (matchJson.matchResults.length == 2) { // final result available?
      for (let result of matchJson.matchResults) {
        if (result.resultTypeID == 2) { // ResultTypeID == 2 -> final result
          extractedResult = [result.pointsTeam1, result.pointsTeam2];
          break;
        }
      }
    }
    else { // if final result not available, extract live score instead
      if (matchJson.goals.length > 0) {
        let currentResult: any = matchJson.goals[matchJson.goals.length - 1];
        extractedResult = [currentResult.scoreTeam1, currentResult.scoreTeam2];
      }
      else {
        extractedResult = [0, 0];
      }
    }
  }

  return extractedResult;
}

/**
 * Checks if a match is started, by comparing the current datetime with the
 * kickoff datetime. Returns true/false if match is started/not started.
 *
 * @param {any} matchJson single match structure from the imported array of match structures
 * @return {boolean} true if match is started, false if not started
 */
function isMatchStarted(matchJson: any): boolean {
  let matchTimestamp: number = new Date(matchJson.matchDateTimeUTC).getTime();

  if (matchTimestamp == null) { // corrupt format
    return false;
  }
  else {
    let currentTimestamp: number = Date.now();
    return currentTimestamp >= matchTimestamp;
  }
}

export function convertRankingJson(rankingJson: any): TeamRankingImportData[] {
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

  return rankingArray;
}
