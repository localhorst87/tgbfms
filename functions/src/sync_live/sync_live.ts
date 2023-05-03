import { NUMBER_OF_TEAMS } from "../business_rules/rule_defined_values";
import { Match, Bet, User, SeasonResult, Score } from "../business_rules/basic_datastructures";
import { MatchImportData, TeamRankingImportData, MatchdayScoreSnapshot } from "../data_access/import_datastructures";
import * as appdata from "../data_access/appdata_access";
import * as matchdata from "../data_access/matchdata_access";
import { PointCalculatorTrendbased } from "../business_rules/point_calculator_trendbased";
import * as helper from "./sync_live_helpers";

declare global {
  interface Array<T> {
    unique(): Array<T>;
  }
}

/**
 * deletes double entries from an array
 */
 Array.prototype.unique = function() {
  let arr = this.concat();
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j])
        arr.splice(j--, 1);
    }
  }

  return arr;
};

/**
 * Synchronizes all relevant matches in the DB, that means, all matches that 
 * are due, according to the SyncPhases in the DB. 
 * Deletes a SyncPhase if all matches have been finished.
 */
export async function syncLive(): Promise<void> {
  let matchesToSync: Match[] = await helper.getRelevantMatchesToSync();

  if (matchesToSync.length == 0) // nothing to sync...
    return;

  // sync matches
  const matchesSynced: Match[] = await syncMatches(matchesToSync);

  // sync team ranking 
  const season = matchesToSync[0].season;
  await syncTeamRanking(season);

  // sync user scores
  const matchdaysSynced = matchesSynced.map((match: Match) => match.matchday).unique();
  for (let matchday of matchdaysSynced)
    await updateScoreSnapshot(season, matchday);

  return;
}

/**
 * Synchronizes all given Match items in the App DB with reference data
 * 
 * @param matchesToSync matches to synchronize
 * @returns all synchronized Matches
 */
export async function syncMatches(matchesToSync: Match[]): Promise<Match[]> {
  let syncedMatches = [];

  const importedData: MatchImportData[] = await helper.getReferenceMatchData(matchesToSync.unique());
  
  for (let match of matchesToSync) {
    // select corresponding reference data
    let relevantImportedMatch: MatchImportData = importedData.filter((el: MatchImportData) => el.matchId == match.matchId)[0];
    if (relevantImportedMatch === undefined)
      continue;
    
    match = helper.addLiveData(match, relevantImportedMatch); // adds goals and if match is finished

    // set new data of Match
    if (await appdata.setMatch(match))
      syncedMatches.push(match);
  }

  // refresh update times for matchdays of synced matches
  if (syncedMatches.length > 0) {
    const season: number = syncedMatches[0].season;
    const matchdaysSynced: number[] = syncedMatches.map((match: Match) => match.matchday).unique();

    await helper.setNewUpdateTimes(season, matchdaysSynced);
  }

  // return matchIds of synced matches
  return syncedMatches;
}

/**
 * Synchronizes the season results (places of the teams)
 * 
 * @param season the season where season results should be synchronized
 * @returns information if sync was successful or not
 */
export async function syncTeamRanking(season: number): Promise<boolean> {
  const rankingAppData: SeasonResult[] = await appdata.getSeasonResults(season);
  const rankingRefData: TeamRankingImportData[] = await matchdata.importCurrentTeamRanking(season);

  if (rankingAppData.length == 0 || rankingRefData.length == 0)
    return false;

  let snycSuccessful: boolean = true;

  for (let seasonResult of rankingAppData) {
    // transform 1,2,-3,-2,-1 to indices of league table, so that reference data can be selected by index
    let idx: number = seasonResult.place > 0 ? seasonResult.place - 1 : NUMBER_OF_TEAMS + seasonResult.place;

    // check if team of specific place (e.g., 1, 2, 16, 17, 18) has changed. If yes, reassign teamId in Appdata
    if (rankingRefData[idx] === undefined) {
      snycSuccessful = false;
      break;
    }

    if (seasonResult.teamId != rankingRefData[idx].teamId) {
      seasonResult.teamId = rankingRefData[idx].teamId
      snycSuccessful = await appdata.setSeasonResult(seasonResult);
    }

    if (snycSuccessful == false)
      break;
  }

  return snycSuccessful;
}

export async function updateScoreSnapshot(season: number, matchday:number): Promise<boolean> {
  const activeUsers: User[] = await appdata.getActiveUsers();
  const matches: Match[] = await appdata.getMatchesByMatchday(season, matchday);
  const allBets: Bet[] = await helper.getAllBetsOfMatches(matches, activeUsers);

  if (activeUsers.length == 0 || matches.length == 0 || allBets.length == 0)
    return false;

  let scores: Score[] = [];
  for (let user of activeUsers) {
    // one PointCalculator per user
    let pointCalculator = new PointCalculatorTrendbased(user.id);

    // add points from all matches
    for (let match of matches) {
      let betsMatch: Bet[] = allBets.filter(bet => bet.matchId == match.matchId);
      pointCalculator.addSingleMatchScore(betsMatch, match);
    }

    scores.push(pointCalculator.score);
  }

  let snapshot: MatchdayScoreSnapshot = helper.convertToScoreSnapshot(season, matchday, scores);
  const currentSnapshot: MatchdayScoreSnapshot = await appdata.getMatchdayScoreSnapshot(season, matchday);
  snapshot.documentId = currentSnapshot.documentId; // will be "" in case document is not yet existing

  return await appdata.setMatchdayScoreSnapshot(snapshot);
}