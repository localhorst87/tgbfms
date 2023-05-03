import { Match, Bet, User, Score } from "../../../src/app/Businessrules/basic_datastructures";
import { MatchImportData, SyncPhase, UpdateTime, MatchdayScoreSnapshot } from "../data_access/import_datastructures";

import * as appdata from "../data_access/appdata_access";
import * as matchdata from "../data_access/matchdata_access";
import { getCurrentTimestamp } from "../util";

/**
 * Returns the bets of the given users for the given matches. Results will not be ordered.
 * 
 * @param matches the corresponding matches where bets will be requested for
 * @param users all users for which bets will be requested for
 * @returns the corresponding bets
 */
export async function getAllBetsOfMatches(matches: Match[], users: User[]): Promise<Bet[]> {
    let allBets: Bet[] = [];
  
    for (let match of matches) {
      for (let user of users) {
        allBets.push(await appdata.getBet(match.matchId, user.id));
      }
    }
  
    return allBets;
}

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
    if (matches.length == 0)
        return [];
    
    // matches.length > 0 is guaranteed, as getReferenceMatchData will only be called if matches.length > 0
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
 * 
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
export function addLiveData(match: Match, imported: MatchImportData): Match {
    match.isFinished = imported.isFinished;
    match.goalsHome = imported.goalsHome;
    match.goalsAway = imported.goalsAway;
  
    return match;
}

/**
 * Converts a ScoreArray to a MatchdayScoreSnapshot
 * 
 * @param season the current season
 * @param matchday the matchday of the current season
 * @param scoreArray the ScoreArray to convert
 * @returns the snapshot for the DB
 */
export function convertToScoreSnapshot(season: number, matchday: number, scoreArray: Score[]): MatchdayScoreSnapshot {
    let scoreSnapshot: MatchdayScoreSnapshot = {
        documentId: "",
        season: season,
        matchday: matchday,
        userId: [],
        points: [],
        matches: [],
        results: [],
        extraTop: [],
        extraOutsider: [],
        extraSeason: []
    };
  
    for (let score of scoreArray) {
        scoreSnapshot.userId.push(score.userId);
        scoreSnapshot.points.push(score.points);
        scoreSnapshot.matches.push(score.matches);
        scoreSnapshot.results.push(score.results);
        scoreSnapshot.extraTop.push(score.extraTop);
        scoreSnapshot.extraOutsider.push(score.extraOutsider);
        scoreSnapshot.extraSeason.push(score.extraSeason);
    }
  
    return scoreSnapshot;
}

