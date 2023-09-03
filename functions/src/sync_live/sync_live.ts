import { SEASON, NUMBER_OF_TEAMS, MATCHDAYS_PER_SEASON } from "../business_rules/rule_defined_values";
import { Match, Bet, User, SeasonResult } from "../business_rules/basic_datastructures";
import { MatchImportData, TeamRankingImportData, MatchdayScoreSnapshot } from "../data_access/import_datastructures";
import { Table } from "../data_access/export_datastructures";
import * as appdata from "../data_access/appdata_access";
import * as matchdata from "../data_access/matchdata_access";
import { ScoreAdderTrendbased } from "../business_rules/score_adder_trendbased";
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

  if (matchesToSync.length == 0) {
    console.log("no need to synchronize");
    return;
  }

  // sync matches
  const matchesSynced: Match[] = await syncMatches(matchesToSync);
  console.log("matches synchronized: \n" + JSON.stringify(matchesSynced));

  // sync team ranking 
  await syncTeamRanking(SEASON);

  // get synchronized matchdays
  const matchdaysSynced = matchesSynced.map((match: Match) => match.matchday).unique();

  // sync user scores
  for (let matchday of matchdaysSynced)
    await updateScoreSnapshot(SEASON, matchday);
  
  // refresh tables
  for (let matchday of matchdaysSynced)
    await updateTablesView(SEASON, matchday);

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
    const matchdaysSynced: number[] = syncedMatches.map((match: Match) => match.matchday).unique();

    await helper.setNewUpdateTimes(SEASON, matchdaysSynced);
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

/**
 * 
 * @param season 
 * @param matchday 
 * @returns 
 */
export async function updateScoreSnapshot(season: number, matchday: number): Promise<boolean> {
  const activeUsers: User[] = await appdata.getActiveUsers();
  const matches: Match[] = await appdata.getMatchesByMatchday(season, matchday);
  const allBets: Bet[] = await helper.getAllBetsOfMatches(matches, activeUsers);

  if (activeUsers.length == 0 || matches.length == 0 || allBets.length == 0)
    return false;

  let scoreAdder: ScoreAdderTrendbased = new ScoreAdderTrendbased();
  scoreAdder.calcScores(matches, allBets);

  let scoreSnapshot: MatchdayScoreSnapshot = await appdata.getMatchdayScoreSnapshot(season, matchday);
  scoreSnapshot.scores = scoreAdder.getScores();

  return await appdata.setMatchdayScoreSnapshot(scoreSnapshot);
}

/**
 * Updates the view_tables collection of the app database
 * 
 * @param season the corresponding season of the matchday
 * @param matchday the corresponding matchday of the tables
 * @returns true/false upon successful operation
 */
export async function updateTablesView(season: number, matchday: number): Promise<boolean> {
  const activeUsers: User[] = await appdata.getActiveUsers();

  if (activeUsers.length == 0)
    return false;
  
  let allMatchdaySnapshots: MatchdayScoreSnapshot[] = [];
  for (let i = 1; i <= matchday; i++) {
    allMatchdaySnapshots.push(await appdata.getMatchdayScoreSnapshot(season, i));
  }

  const seasonScoreSnapshot: MatchdayScoreSnapshot = await helper.getSeasonScoreSnapshot(season, matchday, activeUsers);

  let isSuccessful: boolean = true;
  
  const matchdayTableApp: Table = await appdata.getTableView("matchday", season, matchday);
  const matchdayTable: Table = await helper.makeMatchdayTable(season, matchday, activeUsers, allMatchdaySnapshots);
  matchdayTable.documentId = matchdayTableApp.documentId;
  isSuccessful = isSuccessful && await appdata.setTableView(matchdayTable);

  const totalTableApp: Table = await appdata.getTableView("total", season, matchday);
  const totalTable: Table = await helper.makeTotalTable(season, matchday, activeUsers, allMatchdaySnapshots);
  totalTable.documentId = totalTableApp.documentId;
  isSuccessful = isSuccessful && await appdata.setTableView(totalTable);

  const finalTableApp: Table = await appdata.getTableView("final", season, matchday);
  const finalTable: Table = await helper.makeFinalTable(season, matchday, activeUsers, allMatchdaySnapshots, seasonScoreSnapshot);
  finalTable.documentId = finalTableApp.documentId;
  isSuccessful = isSuccessful && await appdata.setTableView(finalTable);

  const last5TableApp: Table = await appdata.getTableView("last_5", season, matchday);
  const last5Table: Table = await helper.makeLast5Table(season, matchday, activeUsers, allMatchdaySnapshots);
  last5Table.documentId = last5TableApp.documentId;
  isSuccessful = isSuccessful && await appdata.setTableView(last5Table);

  const last10TableApp: Table = await appdata.getTableView("last_10", season, matchday);
  const last10Table: Table = await helper.makeLast10Table(season, matchday, activeUsers, allMatchdaySnapshots);
  last10Table.documentId = last10TableApp.documentId;
  isSuccessful = isSuccessful && await appdata.setTableView(last10Table);

  if (matchday > MATCHDAYS_PER_SEASON / 2) {
    const secondHalfTableApp: Table = await appdata.getTableView("second_half", season, matchday);
    const secondHalfTable: Table = await helper.makeSecondHalfTable(season, matchday, activeUsers, allMatchdaySnapshots);
    secondHalfTable.documentId = secondHalfTableApp.documentId;
    isSuccessful = isSuccessful && await appdata.setTableView(secondHalfTable);
  }

  return isSuccessful;
}