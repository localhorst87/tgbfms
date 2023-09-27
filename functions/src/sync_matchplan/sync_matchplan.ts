import {Match} from "../business_rules/basic_datastructures";
import {MatchImportData, UpdateTime, SyncPhase}
  from "../data_access/import_datastructures";
import {SEASON} from "../business_rules/rule_defined_values";
import * as helpers from "./sync_matchplan_helpers";
import {MatchList} from "./sync_matchplan_helpers";
import * as appdata from "../data_access/appdata_access";
import * as matchdata from "../data_access/matchdata_access";
import * as util from "../util";

/**
 * Adds and updates all Matches where new data is available and updates 
 * SyncPhases, based on the available next matches
 */
export async function syncMatchplan(): Promise<void> {
  let matchList = new MatchList(SEASON);
  await matchList.fillMatchList();

  // update Matches
  const matchdaysToUpdate: number[] = await getMatchdaysToUpdate(matchList);
  const updatedMatches: Match[] = await updateMatchdays(SEASON, matchdaysToUpdate);

  // update MatchList
  if (updatedMatches.length > 0) 
    matchList.updateMatches(updatedMatches);

  // update SyncPhases
  const matchesNextDays: Match[] = matchList.getNextMatches(3);
  const syncPhases: SyncPhase[] = createSyncPhases(matchesNextDays);
  await updateSyncPhases(syncPhases);
}

/**
 * Updates all the given matchdays of the season
 *
 * @param season The season of the matches to update (e.g. 2021 for 2021/22)
 * @param matchdays All matchdays that shall be updated
 * @returns all updated matches
 */
export async function updateMatchdays(season: number, matchdays: number[]): Promise<Match[]> {
  let updatedMatches: Match[] = [];

  for (let matchday of matchdays) {
    let updateRequired: boolean = false;
    let updateSuccessful: boolean = true;

    let referenceMatchData: MatchImportData[] = await matchdata.importMatchdata(season, matchday);
    for (let refMatch of referenceMatchData) {
      let matchAppData: Match = await appdata.getMatch(refMatch.matchId);
      let matchImported: Match = helpers.convertToMatch(refMatch, matchAppData);

      // Match unknown to App DB or Match available in App DB, but not up to date
      if (matchAppData.documentId === "" || !helpers.isMatchEqual(matchAppData, matchImported)) {
        updateRequired = true;
        updateSuccessful = await appdata.setMatch(matchImported);
        if (updateSuccessful)
          updatedMatches.push(matchImported);
        else 
          break;
      }        
    }

    // if at least one match has not been updated successfully, don't refresh the
    // update time in the app DB, as it will be used to check if an update is required
    if (updateRequired && updateSuccessful) {
      let updateTime: UpdateTime = await appdata.getLastUpdateTime(season, matchday);
      updateTime.timestampMatches = util.getCurrentTimestamp();
      await appdata.setUpdateTime(updateTime);
    }
  }

  return updatedMatches;
}

/**
 * Gets all the matchdays that need a data update, because either the
 * matchday is not available (or not completey available) in the app database
 * or new data is available
 *
 * @param {MatchList} matchList MatchList of the season to perform sync check
 * @return {Promise<number[]>} a list of matches that require synchronization
 */
export async function getMatchdaysToUpdate(matchList: MatchList): Promise<number[]> {
  if (matchList.matches.length == 0)
    await matchList.fillMatchList();

  // incomplete matchdays will be synced unconditionally - so this list will be
  // used as a starting point. Pending matchdays will be synced only, if new
  // data is available
  let matchdaysToUpdate: number[] = matchList.getIncompleteMatchdays();
  let pendingMatchdays: number[] = matchList.getPendingMatchdays();

  let appUpdateTime: UpdateTime;
  let matchUpdateTimestamp: number;

  // pending matchdays will be subject to an update if newer data is available
  for (let matchday of pendingMatchdays) {
    appUpdateTime = await appdata.getLastUpdateTime(matchList.season, matchday); // -1 on not available
    matchUpdateTimestamp = await matchdata.getLastUpdateTime(matchList.season, matchday); // -1 on no data

    if (matchUpdateTimestamp > appUpdateTime.timestampMatches)
      matchdaysToUpdate.push(matchday);
  }

  return matchdaysToUpdate.unique();
}

export async function updateSyncPhases(syncPhases: SyncPhase[]): Promise<boolean> {
  let updateSuccessful: boolean = true;

  for (let syncPhase of syncPhases) {
    // first, check if sync phase is already existing
    let syncPhaseAppData: SyncPhase[] = await appdata.getSyncPhases("==", syncPhase.start);
    if (syncPhaseAppData.length > 0) {
      syncPhase.documentId = syncPhaseAppData[0].documentId;
    }
    updateSuccessful = await appdata.setSyncPhase(syncPhase);
    
    if (updateSuccessful === false)
      break;
  }
  
  return updateSuccessful;
}

/**
 * Creates a SyncPhase array from a Match array. That means the start time
 * for synchronizing results of certain mathces
 *
 * @param {Match[]} matches The list of Matches to create SyncPhases from
 * @return {SyncPhase[]} SyncPhases from the given Matches
 */
export function createSyncPhases(matches: Match[]): SyncPhase[] {
  let syncPhases: SyncPhase[] = [];

  while (matches.length > 0) {
    let match: any = matches.shift();
    let idxPhase: number = syncPhases.findIndex(el => el.start == match.timestamp);
    if (idxPhase > -1) { // start time already existing
      syncPhases[idxPhase].matchIds.push(match.matchId);
    }
    else { // start time not yet existing
      syncPhases.push({
        documentId: "",
        start: match.timestamp,
        matchIds: [match.matchId]
      });
    }
  }

  return syncPhases;
}
