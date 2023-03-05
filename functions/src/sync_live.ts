import { Match, SeasonResult } from "../../src/app/Businessrules/basic_datastructures";
import { MatchImportData, SyncPhase, TeamRankingImportData, UpdateTime } from "./data_access/import_datastructures";
import * as appdata from "./data_access/appdata_access";
import * as matchdata from "./data_access/matchdata_access";
import { NUMBER_OF_TEAMS } from "../../src/app/Businessrules/rule_defined_values";
import { getCurrentTimestamp } from "./util";

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
export async function sync(): Promise<void> {
  let matchesToSync: Match[] = await getRelevantMatchesToSync();

  if (matchesToSync.length == 0) // nothing to sync...
    return;
  
  const matchIdsSynced: number[] = await syncMatches(matchesToSync);
  const isSeasonResultSynced: boolean = await syncTeamRanking(matchesToSync);

  return;
}

/**
 * Synchronizes all given Match items in the App DB with reference data
 * 
 * @param matchesToSync matches to synchronize
 * @returns the number of synchronized Match items
 */
export async function syncMatches(matchesToSync: Match[]): Promise<number[]> {
  let syncedMatches = [];

  const importedData: MatchImportData[] = await getReferenceMatchData(matchesToSync.unique());

  for (let match of matchesToSync) {
    // select corresponding reference data
    let relevantImportedMatch: MatchImportData = importedData.filter((el: MatchImportData) => el.matchId == match.matchId)[0];
    match = addLiveData(match, relevantImportedMatch); // adds goals and if match is finished

    // set new data of Match
    if (await appdata.setMatch(match))
      syncedMatches.push(match);
  }

  // refresh update times for matchdays of synced matches
  if (syncedMatches.length > 0) {
    const season: number = syncedMatches[0].season;
    const matchdaysSynced: number[] = syncedMatches.map((match: Match) => match.matchday).unique();
    await setNewUpdateTimes(season, matchdaysSynced);
  }

  // return matchIds of synced matches
  return syncedMatches.map((match: Match) => match.matchId);
}

export async function syncTeamRanking(matchesToSync: Match[]): Promise<boolean> {
  const season: number = matchesToSync[0].season; // matchesToSync.length > 0 is guaranteed
  let rankingAppData: SeasonResult[] = await appdata.getSeasonResults(season);
  const rankingRefData: TeamRankingImportData[] = await matchdata.importCurrentTeamRanking(season);

  let snycSuccessful: boolean = true;

  for (let rankingEl of rankingAppData) {
    let idx: number = rankingEl.place > 0 ? rankingEl.place - 1 : NUMBER_OF_TEAMS - rankingEl.place; // transform 1,2,-3,-2,-1 to valid indices
    if (rankingEl.teamId != rankingRefData[idx].teamId) {
      rankingEl.teamId = rankingRefData[idx].teamId
      snycSuccessful = await appdata.setSeasonResult(rankingEl);
    }
    if (snycSuccessful == false)
      break;
  }

  return snycSuccessful;
}

// async function updateScoreSnapshot(season: number, matchday:number): Promise<boolean> {

// }

/**
 * Returns all relevant matches that potentially need to be synchronized,
 * by reading all relevant SyncPhase items
 * 
 * @returns matches from all relevant SyncPhase items
 */
export async function getRelevantMatchesToSync(): Promise<Match[]> {
  const syncPhases: SyncPhase[] = await getRelevantSyncPhases();

  let allMatchesToSync: Match[] = [];

  for (let syncPhase of syncPhases) {
    let matchesToSync = await getMatchesFromSyncPhase(syncPhase);
    if (matchesToSync.length > 0)
      allMatchesToSync.push(...matchesToSync);
    else
      await appdata.deleteSyncPhases("==", syncPhase.start); // all matches of SyncPhase finished
  }

  return allMatchesToSync;
}

/**
 * Get all relevant SyncPhases from the DB. That is, all sync phases that 
 * exist with a starting time in the past
 * 
 * @returns the relevant SyncPhases
 */
export async function getRelevantSyncPhases(): Promise<SyncPhase[]> {
    const timestampNow: number = getCurrentTimestamp();
    return appdata.getSyncPhases("<=", timestampNow);
}

/**
 * Returns all Matches of a SyncPhase that have not yet finished
 * 
 * @private
 * @param syncPhase The SyncPhase to extract the matches from
 * @returns all matches that have not finished yet
 */
export async function getMatchesFromSyncPhase(syncPhase: SyncPhase): Promise<Match[]> {
  let matchesToSync: Match[] = [];
  for (let id of syncPhase.matchIds) {
    matchesToSync.push(await appdata.getMatch(id));
  }

  return matchesToSync.filter((match: Match) => match.isFinished == false);
}

/**
 * Yields fresh data from the reference data (openligadb) for all the given matches
 * 
 * @private
 * @param matches all matches that need a sync
 * @returns Live match data for the given matches
 */
export async function getReferenceMatchData(matches: Match[]): Promise<MatchImportData[]> {
  const season: number = matches[0].season; // two seasons never overlap, so take it as representative for all

  let matchdaysToSync: number[] = matches.map((match: Match) => match.matchday).unique();
  let matchImportData: MatchImportData[][] = [];
  for (let matchday of matchdaysToSync) {
    matchImportData.push(await matchdata.importMatchdata(season, matchday));
  }

  // filters out only those matches from the complete matchday that are needed 
  const filterFcn = (match: MatchImportData) => matches.map((el: Match) => el.matchId).includes(match.matchId);

  return matchImportData.flat().filter(filterFcn);
}

/**
 * Set update time of the given matchdays to the current timestamp
 * @param season the corresponding season
 * @param matchdays the matchday to set the new update time
 * @returns the list of matchdays where update time was set
 */
export async function setNewUpdateTimes(season: number, matchdays: number[]): Promise<number[]> {
  let matchdayTimeSet: number[] = [];

  for (let matchday of matchdays) {
    let updateTime: UpdateTime = await appdata.getLastUpdateTime(season, matchday);
    updateTime.timestamp = getCurrentTimestamp();

    if (await appdata.setUpdateTime(updateTime))
      matchdayTimeSet.push(matchday);
  }

  return matchdayTimeSet;
}

/**
 * Enriches the given Match with live data from the MatchImportData
 * 
 * @param match The match to enrich with live data
 * @param imported The imported live data of the given match
 * @returns The given Match, enriched with live data
 */
function addLiveData(match: Match, imported: MatchImportData): Match {
  match.isFinished = imported.isFinished;
  match.goalsHome = imported.goalsHome;
  match.goalsAway = imported.goalsAway;

  return match;
}