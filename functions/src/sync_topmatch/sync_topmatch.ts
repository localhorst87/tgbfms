import {SEASON} from "../business_rules/rule_defined_values";
import {Match, TopMatchVote, VoteCount} from "../business_rules/basic_datastructures";
import * as appdata from "../data_access/appdata_access";
import * as helper from "./sync_topmatch_helpers";

export async function syncTopMatch(): Promise<void> {
    // get matches that begin within the vote closing time (1 hour before match)
    // if no match begins within the next hour, stop here.
    const nextMatches: Match[] = await helper.getNextMatches();
    if (nextMatches.length == 0)
        return;

    // get all matchdays of the next matches that have a pending (not yet
    // decided) top match (usually only one matchday. Expect if a postponed 
    // match takes place at the same time).
    // If all matchdays have already decided on its top match, stop here.
    const matchdaysNoTopMatch: number[] = await helper.getPendingTopMatchMatchdays(nextMatches);
    if (matchdaysNoTopMatch.length == 0)
        return;

    // for each of the matchdays (usually only one), get all top match votes
    // and evaluate top match
    let matchIdTopMatch: number[] = [];
    for (let matchday of matchdaysNoTopMatch) {
        let topMatchVotes: TopMatchVote[] = await appdata.getTopMatchVotes(SEASON, matchday);
        let matchdayMatchIds: number[] = (await appdata.getMatchesByMatchday(SEASON, matchday))
            .map(match => match.matchId);
        
        let votedMatchId: number = evaluateTopMatchVotes(topMatchVotes, matchdayMatchIds);
        matchIdTopMatch.push(votedMatchId);
    }
    
    // set top match
    for (let matchId of matchIdTopMatch) {
        let matchToSet: Match = await appdata.getMatch(matchId);
        matchToSet.isTopMatch = true;
        await appdata.setMatch(matchToSet);
    }

    return;
}

/**
 * Returns the id of the top match according to the given votes.
 * If no votes are given, a random selection will be carried out
 * 
 * @param {TopMatchVote[]} topMatchVotes 
 * @param {number[]} matchdayMatchIds
 * @returns {number} the top match ID
 */
function evaluateTopMatchVotes(topMatchVotes: TopMatchVote[], matchdayMatchIds: number[]): number {
    let voteCount: VoteCount[] = [];
    let filteredVotes: TopMatchVote[];

    for (let matchId of matchdayMatchIds) {
      filteredVotes = topMatchVotes.filter(vote => vote.matchId == matchId);
      const maxTimestamp: number = filteredVotes.reduce((reducedTime, currentVote) => 
        Math.max(reducedTime, currentVote.timestamp), -1)

      voteCount.push({
        matchId: matchId,
        nVotes: filteredVotes.length,
        lastVoteTime: maxTimestamp
      });
    }
    voteCount.sort(helper.sortVotes);
    return voteCount[0].matchId;

  }