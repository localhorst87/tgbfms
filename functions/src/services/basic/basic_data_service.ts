import * as appdata from "../../data_access/appdata_access";
import { Match } from "../../business_rules/basic_datastructures";
import * as util from "../../util";
import { SEASON } from "../../business_rules/rule_defined_values"

const THRESHOLD_POSTPONED_MATCH: number = 3 * 86400;

export interface CurrentMatchdays {
    matchdayClosest: number;
    matchdayNextMatch: number;
    matchdayLastMatch: number;
    matchdayRecent: number;
    matchdayCompleted: number;
};

export async function getCurrentMatchdays(): Promise<CurrentMatchdays> {
    const nextMatch: Match = await appdata.getNextMatch(SEASON);
    const lastMatch: Match = await appdata.getLastMatch(SEASON);

    if (lastMatch.matchday == -1 && nextMatch.matchday == -1) {
        // no matches available

        return {
            matchdayClosest: 1,
            matchdayNextMatch: 1,
            matchdayLastMatch: 1,
            matchdayRecent: 1,
            matchdayCompleted: 0
        };
    }
    else if (lastMatch.matchday > 0 && nextMatch.matchday == -1) {
        // all matches played

        return {
            matchdayClosest: lastMatch.matchday,
            matchdayNextMatch: lastMatch.matchday,
            matchdayLastMatch: lastMatch.matchday,
            matchdayRecent: lastMatch.matchday,
            matchdayCompleted: lastMatch.matchday
        };
    }
    else if (lastMatch.matchday == -1 && nextMatch.matchday > 0) {
        // no matches played yet

        return {
            matchdayClosest: nextMatch.matchday,
            matchdayNextMatch: nextMatch.matchday,
            matchdayLastMatch: nextMatch.matchday,
            matchdayRecent: nextMatch.matchday,
            matchdayCompleted: 0
        };
    }
    else {
        const closestMatch: Match = getCloserMatch(lastMatch, nextMatch);
        const lastMatches: Match[] = await appdata.getLastMatches(SEASON, 10);
        const recentMatchday: number = getRecentMatchday(lastMatches);
        const finishedMatchday: number = await getFinishedMatchday(lastMatches);

        return {
            matchdayClosest: closestMatch.matchday,
            matchdayNextMatch: nextMatch.matchday,
            matchdayLastMatch: lastMatch.matchday,
            matchdayRecent: recentMatchday,
            matchdayCompleted: finishedMatchday
        };
    }
}

function getRecentMatchday(lastMatches: Match[]): number {
    const matchdays: number[] = lastMatches.map((match: Match) => match.matchday);

    return Math.max(...matchdays);
}

async function getFinishedMatchday(lastMatches: Match[]): Promise<number> {
    const recentMatchday: number = getRecentMatchday(lastMatches);

    let matchesMatchday: Match[] = await appdata.getMatchesByMatchday(lastMatches[0].season, recentMatchday);

    // filter out matches without timestamp and sort ascending
    matchesMatchday = matchesMatchday
        .filter((match: Match) => match.timestamp > 0)
        .sort((a, b) => a.timestamp - b.timestamp);
    
    const timestampFirstMatch: number = matchesMatchday[0].timestamp;

    // filter out postponed matches and sort descending
    matchesMatchday = matchesMatchday
        .filter((match: Match) => match.timestamp - timestampFirstMatch < THRESHOLD_POSTPONED_MATCH)
        .sort((a, b) => b.timestamp - a.timestamp);

    if (matchesMatchday[0].isFinished)
        return recentMatchday;
    else
        return recentMatchday - 1;
}

function getCloserMatch(lastMatch: Match, nextMatch: Match): Match {
    const timestampNow: number = util.getCurrentTimestamp();
    const diffNextMatch: number = Math.abs(nextMatch.timestamp - timestampNow);
    const diffLastMatch: number = Math.abs(lastMatch.timestamp - timestampNow);

    return (diffNextMatch <= diffLastMatch ? nextMatch : lastMatch);
}