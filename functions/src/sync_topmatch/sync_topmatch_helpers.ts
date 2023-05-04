import {SEASON, TOP_MATCH_VOTES_CLOSING_TIME_MINUTES} from "../business_rules/rule_defined_values";
import {Match} from "../business_rules/basic_datastructures";
import {getMatchesFromSyncPhase} from "../sync_live/sync_live_helpers";
import {SyncPhase} from "../data_access/import_datastructures";
import * as appdata from "../data_access/appdata_access";
import * as util from "../util";

/**
 * Get the next matches that begin within one hour or less
 * 
 * @returns {Promise<Match>} the next matches
 */
export async function getNextMatches(): Promise<Match[]> {
    const currentTimestamp: number = util.getCurrentTimestamp();
    const nextHourTimestamp: number = currentTimestamp + 60 * TOP_MATCH_VOTES_CLOSING_TIME_MINUTES;
    const syncPhases: SyncPhase[] = await appdata.getSyncPhases("<=", nextHourTimestamp);

    let nextMatches: Match[] = [];
    for (let syncPhase of syncPhases) {
        let matches: Match[] = await getMatchesFromSyncPhase(syncPhase);
        nextMatches.push(...matches);
    }

    return nextMatches;
}

/**
 * Filters out only those matchdays, where no top match is existing yet.
 * This is to prevent chosing the wrong matchday, if a postponed match is taking
 * place in parallel with the current matchday
 * 
 * @param {Match[]} matches the matches to check the corresponding matchday
 * @returns {Promise<number[]>} all matchdays with pending top match
 */
export async function getPendingTopMatchMatchdays(matches: Match[]): Promise<number[]> {
    if (matches.length == 0)
        return [];
    
    const matchdays: number[] = matches.map(match => match.matchday).unique();

    let matchdaysWithoutTopMatch: number[] = [];

    for (let matchday of matchdays) {
        let topMatch: Match = await appdata.getTopMatch(SEASON, matchday);
        if (topMatch.matchId == -1) {
            matchdaysWithoutTopMatch.push(matchday);
        }
    }

    return matchdaysWithoutTopMatch;
}

/**
 * Sort function for top match votes. Sorts the votes acording to
 * 
 * 1st: the number of votes,
 * 
 * 2nd: the minimum timestamp of the last vote,
 * 
 * 3rd: a random selection
 * 
 * @param {any} a first element
 * @param {any} b second element
 * @returns {number} sorting index
 */
export function sortVotes(a: any, b: any): number {
    // sorting function for the votes. 

    if (a.nVotes != b.nVotes) {
      return b.nVotes - a.nVotes;
    }
    else if (a.lastVoteTime != b.lastVoteTime) {
      return a.lastVoteTime - b.lastVoteTime;
    }
    else {
      return Math.floor(Math.random() * 2) - 0.5; // returns either 0.5 or -0.5
    }
}