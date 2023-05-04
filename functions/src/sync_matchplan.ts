import {Match} from "./business_rules/basic_datastructures";
import {MatchImportData, UpdateTime, SyncPhase}
  from "./data_access/import_datastructures";
import {SEASON, MATCHDAYS_PER_SEASON, NUMBER_OF_TEAMS}
  from "./business_rules/rule_defined_values";
import * as appdata from "./data_access/appdata_access";
import * as matchdata from "./data_access/matchdata_access";
import * as util from "./util";

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
  const matchesNextDays: Match[] = matchList.getNextMatches(2);
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
      let matchImported: Match = convertToMatch(refMatch, matchAppData);

      // Match unknown to App DB or Match available in App DB, but not up to date
      if (matchAppData.documentId === "" || !isMatchEqual(matchAppData, matchImported)) {
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
      updateTime.timestamp = util.getCurrentTimestamp();
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

    if (matchUpdateTimestamp > appUpdateTime.timestamp)
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

export class MatchList {

  static MATCHES_PER_DAY: number = Math.floor(NUMBER_OF_TEAMS / 2);
  static MATCHDAYS_PER_SEASON: number = MATCHDAYS_PER_SEASON; // copied for being able to be stubbed for testing
  private _season: number;
  private _matches: Match[];

  /**
   * @constructor
   * @param {number} season The season where to request matches for
   *                        (e.g. 2021 for the season 2021/2022)
   */
  constructor(season: number) {
    this._season = season;
    this._matches = [];
  }

  /**
   * @param {number} newSeason The season where to request matches for
   *                           (e.g. 2021 for the season 2021/2022)
   */
  set season(newSeason: number) {
    if (this._season == newSeason)
      return;
    else {
      this._season = newSeason;
      this._matches = [];
    }
  }

  /**
   * @return {number} The season where to request matches for
   */
  get season(): number {
    return this._season;
  }

  /**
   * @return {Match[]} The list of the matches of the season
   */
  get matches(): Match[] {
    return this._matches;
  }

  /**
   * Fills the matches array with all the matches of the selected season
   *
   * @public
   */
  async fillMatchList(): Promise<void> {
    return appdata.getAllMatches(this._season).then(
      (matches: Match[]) => {
        this._matches = matches;
      })
      .catch((err: any) => {
        this._matches = [];
      });
  }

  updateMatches(matches: Match[]): void {
    for (let updatedMatch of matches) {
      let idx: number = this._matches.findIndex(match => match.documentId == updatedMatch.documentId);
      this._matches.splice(idx, 1, updatedMatch);
    }

    return;
  }

  /**
   * Extracts all pending matchdays from the matches list. That is: All
   * matchdays that haven't been completely finished so far
   *
   * @public
   * @return {number[]} all pending matchdays
   */
  getPendingMatchdays(): number[] {
    let pendingMatchdays: number[] = [];

    for (let i = 1; i <= MatchList.MATCHDAYS_PER_SEASON; i++) {
      const pendingCondition = (match: Match) => (match.matchday == i && match.isFinished == false);
      let isMatchdayPending: boolean = this._matches.some(pendingCondition);

      if (isMatchdayPending)
        pendingMatchdays.push(i);
    }

    return pendingMatchdays;
  }

  /**
   * Extracts all incomplete matchdays from the matches list. That is: All
   * matchdays that do not contain the expected number of matches
   *
   * @public
   * @return {number[]} all pending matchdays
   */
  getIncompleteMatchdays(): number[] {
    let incompleteMatchdays: number[] = [];

    for (let i = 1; i <= MatchList.MATCHDAYS_PER_SEASON; i++) {
      const filterCondition = (match: Match) => (match.matchday == i);
      let isMatchdayIncomplete: boolean = this._matches.filter(filterCondition).length < MatchList.MATCHES_PER_DAY;

      if (isMatchdayIncomplete)
        incompleteMatchdays.push(i);
    }

    return incompleteMatchdays;
  }

  /**
   * Extracts the Matches that begin within the next given days.
   * days = 0 means the same day, days = 1 means the same day and tomorrow
   *
   * @public
   * @param {number} days The next complete days to consider
   * @return {Match[]} all pending matchdays
   */
  getNextMatches(days: number): Match[] {
    let startTimestamp = util.getCurrentTimestamp();
    let endTimestamp = util.getFutureEndDate(days);
    const filterCondition = (match: Match) => (match.timestamp <= endTimestamp && match.timestamp > startTimestamp);

    return this._matches.filter(filterCondition);
  }

}

/**
 * Converts MatchImportData from the reference data to a Match
 *
 * @param {MatchImportData} importedData The imported match that shall be converted
 * @param {Match} matchAppData The corresponding match from the App DB
 * @return {Match} converted Match
 */
function convertToMatch(importedData: MatchImportData, matchAppData: Match): Match {
  return {
    documentId: matchAppData.documentId,
    season: importedData.season,
    matchday: importedData.matchday,
    matchId: importedData.matchId,
    timestamp: new Date(importedData.datetime).getTime() / 1000,
    isFinished: importedData.isFinished,
    isTopMatch: matchAppData.isTopMatch,
    teamIdHome: importedData.teamIdHome,
    teamIdAway: importedData.teamIdAway,
    goalsHome: importedData.goalsHome,
    goalsAway: importedData.goalsAway
  };
}

/**
 * Checks if two matches contain the same data, except the documentId
 *
 * @param {Match} match1 first match to compare
 * @param {Match} match2 other match to compare
 * @return {boolean} true/false if equal/not equal
 */
function isMatchEqual(match1: Match, match2: Match): boolean {
  return (match1.season == match2.season &&
    match1.matchday == match2.matchday &&
    match1.matchId == match2.matchId &&
    match1.timestamp == match2.timestamp &&
    match1.isFinished == match2.isFinished &&
    match1.isTopMatch == match2.isTopMatch &&
    match1.teamIdHome == match2.teamIdHome &&
    match1.teamIdAway == match2.teamIdAway &&
    match1.goalsHome == match2.goalsHome &&
    match1.goalsAway == match2.goalsAway);
}
