import { Match, Bet, User, SeasonBet, SeasonResult, Score } from "../business_rules/basic_datastructures";
import { MatchImportData, SyncPhase, UpdateTime, MatchdayScoreSnapshot } from "../data_access/import_datastructures";
import * as appdata from "../data_access/appdata_access";
import * as matchdata from "../data_access/matchdata_access";
import { getCurrentTimestamp } from "../util";
import { Table, TableData } from "../data_access/export_datastructures";
import { ScoreAdderTrendbased } from "../business_rules/score_adder_trendbased";
import { TableExporterTrendbased } from "../view_preparation/export_table_trendbased";
import { MATCHDAYS_PER_SEASON } from "../business_rules/rule_defined_values";

export const THRESHOLD_POSTPONED_MATCH: number = 3 * 86400;

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
 * Returns the season bets of the given users for the given season. Results will not be ordered.
 * 
 * @param season the season for requesting the bets
 * @param users the users for requesting the bets
 * @returns the corresponding season bets
 */
export async function getAllSeasonBets(season: number, users: User[]): Promise<SeasonBet[]> {
    let allSeasonBets: SeasonBet[] = [];

    for (let user of users) {
        allSeasonBets.push(...(await appdata.getSeasonBets(season, user.id)));
    }

    return allSeasonBets;
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
 * Does not updates the stats time, only the matches time!
 * 
 * @param season the corresponding season
 * @param matchdays the matchday to set the new update time
 * @returns the list of matchdays where update time was set
 */
export async function setNewUpdateTimes(season: number, matchdays: number[]): Promise<number[]> {
    let matchdayTimeSet: number[] = [];

    for (let matchday of matchdays) {
        let updateTime: UpdateTime = await appdata.getLastUpdateTime(season, matchday);
        updateTime.timestampMatches = getCurrentTimestamp();

        if (await appdata.setUpdateTime(updateTime))
            matchdayTimeSet.push(matchday);
    }

    return matchdayTimeSet;
}

export async function setNewStatsUpdateTime(season: number, matchday: number): Promise<boolean> {
    let updateTime: UpdateTime = await appdata.getLastUpdateTime(season, matchday);
    updateTime.timestampStats = getCurrentTimestamp();

    return await appdata.setUpdateTime(updateTime);
}

export async function getMatchdayScoreSnapshots(season: number, matchdays: number[]): Promise<MatchdayScoreSnapshot[]> {
    let scoreSnapshots: MatchdayScoreSnapshot[] = [];

    for (let matchday of matchdays) {
        scoreSnapshots.push(await appdata.getMatchdayScoreSnapshot(season, matchday));
    }

    return scoreSnapshots;
}

export async function getSeasonScoreSnapshot(season: number, matchday: number, users: User[]): Promise<MatchdayScoreSnapshot> {
    let scoreAdder = new ScoreAdderTrendbased();

    const bets: SeasonBet[] = await getAllSeasonBets(season, users);
    const results: SeasonResult[] = await appdata.getSeasonResults(season);

    scoreAdder.calcSeasonScores(bets, results);
    const scores: Score[] = scoreAdder.getScores(true);

    return {
        documentId: "",
        season: season,
        matchday: matchday,
        scores: scores
    }
}

/**
 * Calculates the matchday table of the given matchday of the season as Table
 * data structure, ready for the view in the frontend
 * 
 * @param season the corresponding season
 * @param matchday the matchday
 * @param users all users
 * @returns the matchday table 
 */
export function makeMatchdayTable(season: number, matchday: number, users: User[], allSnapshots: MatchdayScoreSnapshot[]): Table {
    const tableData: TableData[] = makeTable(matchday, matchday, users, allSnapshots);

    return {
        documentId: "",
        id: "matchday",
        season: season,
        matchday: matchday,
        tableData: tableData
    }; 
}

/**
 * Calculates the total table of the given matchday of the season as Table data
 * structure, ready for the view in the frontend
 * 
 * @param season the corresponding season
 * @param matchday the matchday of the total table
 * @param users all users
 * @returns the total table 
 */
export function makeTotalTable(season: number, matchday: number, users: User[], allSnapshots: MatchdayScoreSnapshot[]): Table {
    const tableData: TableData[] = makeTable(1, matchday, users, allSnapshots);

    return {
        documentId: "",
        id: "total",
        season: season,
        matchday: matchday,
        tableData: tableData
    };
}

/**
 * Returns the ...
 * 
 * @param season the corresponding season
 * @param matchday the matchday of the table
 * @param users all users
 * @param matchdaySnapshots all MatchdayScoreSnapshots from (at least) the relevant matchdays
 * @param seasonScoreSnapshot the MatchdayScoreSnapshot from the season bets only
 * @returns the total table including the season bet points
 */
export function makeFinalTable(season: number, matchday: number, users: User[], matchdaySnapshots: MatchdayScoreSnapshot[], seasonScoreSnapshot: MatchdayScoreSnapshot): Table {
    const allSnapshots: MatchdayScoreSnapshot[] = [...matchdaySnapshots, seasonScoreSnapshot];
    const tableData: TableData[] = makeTable(1, matchday, users, allSnapshots, true);    

    return {
        documentId: "",
        id: "final",
        season: season,
        matchday: matchday,
        tableData: tableData
    };
}

/**
 * Calculates the second season half table of the given matchday of the season
 * as Table data structure, ready for the view in the frontend
 * 
 * @param season the corresponding season
 * @param matchday the matchday of the total table
 * @param users all users
 * @param allSnapshots all MatchdayScoreSnapshots from (at least) the relevant matchdays
 * @returns the total table 
 */
export function makeSecondHalfTable(season: number, matchday: number, users: User[], allSnapshots: MatchdayScoreSnapshot[]): Table {
    const matchdayStart: number = MATCHDAYS_PER_SEASON / 2 + 1;
    const matchdayEnd: number = Math.max(MATCHDAYS_PER_SEASON/2 + 1, matchday);

    const tableData: TableData[] = makeTable(matchdayStart, matchdayEnd, users, allSnapshots);

    return {
        documentId: "",
        id: "second_half",
        season: season,
        matchday: matchday,
        tableData: tableData
    };
}

/**
 * Calculates the table of the last 5 matchdays for the given matchday of the 
 * season as Table data structure, ready for the view in the frontend
 * 
 * @param season the corresponding season
 * @param matchday the matchday of the total table
 * @param users all users
 * @returns the total table 
 */
export function makeLast5Table(season: number, matchday: number, users: User[], allSnapshots: MatchdayScoreSnapshot[]): Table {
    const matchdayStart: number = Math.max(1, matchday - 4);
    const tableData: TableData[] = makeTable(matchdayStart, matchday, users, allSnapshots);

    return {
        documentId: "",
        id: "last_5",
        season: season,
        matchday: matchday,
        tableData: tableData
    };
}

/**
 * Calculates the table of the last 10 matchdays for the given matchday of the 
 * season as Table data structure, ready for the view in the frontend
 * 
 * @param season the corresponding season
 * @param matchday the matchday of the total table
 * @param users all users
 * @returns the total table
 */
export function makeLast10Table(season: number, matchday: number, users: User[], allSnapshots: MatchdayScoreSnapshot[]): Table {
    const matchdayStart: number = Math.max(1, matchday - 9);
    const tableData: TableData[] = makeTable(matchdayStart, matchday, users, allSnapshots);

    return {
        documentId: "",
        id: "last_10",
        season: season,
        matchday: matchday,
        tableData: tableData
    };
}

export function makeTable(matchdayStart: number, matchdayEnd: number, users: User[], allSnapshots: MatchdayScoreSnapshot[], ingestSeasonScore: boolean = false): TableData[] {
    let scoreAdder: ScoreAdderTrendbased = new ScoreAdderTrendbased();
    
    for (let i = matchdayStart; i <= matchdayEnd; i++) {
        let scoreSnapshotsRelevant: MatchdayScoreSnapshot[] = allSnapshots.filter(snapshot => snapshot.matchday == i);
        if (scoreSnapshotsRelevant.length > 0) {
            // for a single matchday, two snapshots may exist if season bet snapshot is ingested
            for (let snapshot of scoreSnapshotsRelevant) {
                scoreAdder.addScores(snapshot.scores);
            }
        }
    }

    let tableExporter: TableExporterTrendbased = new TableExporterTrendbased(users, scoreAdder);
    return tableExporter.exportTable(ingestSeasonScore);
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
 * Returns all matchdays that right now need a statistics update
 * 
 * @param season 
 * @returns 
 */
export async function getMatchdayForStatsUpdate(season: number): Promise<number> {
    const lastFinishedMatch: Match = await appdata.getLastMatch(season, true);
    if (lastFinishedMatch.matchId == -1) {
        // no (finished) last match available => nothing to update
        return -1;
    }

    const matchday: number = lastFinishedMatch.matchday;
    const matchesMatchday: Match[] = await appdata.getMatchesByMatchday(season, matchday);
    const nextMatch: Match = await appdata.getNextMatch(season);

    // check if matchday is finished (without considering postponed matches)
    if (isMatchdayFinished(lastFinishedMatch, matchesMatchday)) {
        if (nextMatch.matchday - matchday > 1) {
            // last finished match was a postponed match --> update matchday of postponed match anyway
            return matchday;
        }
        else {
            // either one must be valid:
            // - next match is postponed match (nextMatch.matchday < matchday)
            // - next match is from next matchday (nextMatch.matchday - matchday == 1)
            // then: check if stats are already set. If no: update needed

            const updateTime: UpdateTime = await appdata.getLastUpdateTime(season, matchday);
            if (updateTime.timestampStats == -1)
                return matchday;
        }
    }
    
    return -1;
}

/**
 * Returns if the matchday of the last played match is finished
 * 
 * @param lastFinishedMatch last finished match, must not be an unknown match!
 * @param matchesMatchday all matches of matchday from last finished match
 * @returns 
 */
export function isMatchdayFinished(lastFinishedMatch: Match, matchesMatchday: Match[]): boolean {     
    matchesMatchday = matchesMatchday.filter((match: Match) => match.timestamp > -1);

    if (matchesMatchday.length == 0) 
        return false;

    const firstMatchOfMatchday: Match = matchesMatchday.sort((a, b) => a.timestamp - b.timestamp)[0];
    const matchesPending: Match[] = matchesMatchday
        .filter((match: Match) => match.timestamp - firstMatchOfMatchday.timestamp < THRESHOLD_POSTPONED_MATCH)
        .filter((match: Match) => match.timestamp >= lastFinishedMatch.timestamp);

    if (matchesPending.length == 0)
        return true;
    else
        return matchesPending.every((match: Match) => match.isFinished);
}