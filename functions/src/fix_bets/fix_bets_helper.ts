import * as appdata from "../data_access/appdata_access";
import {SyncPhase} from "../data_access/import_datastructures";
import {Bet} from "../business_rules/basic_datastructures";

/**
 * Returns all Bets that are not fixed for matches that have begun
 * 
 * @param syncPhases all past sync phases
 * @returns {Pormise<Bet[]>} all not-fixed Bets
 */
export async function getRelevantBets(syncPhases: SyncPhase[]): Promise<Bet[]> {
    let relevantBets: Bet[] = [];

    for (let syncPhase of syncPhases) {
        for (let matchId of syncPhase.matchIds) {
            let bets: Bet[] = await appdata.getAllBets(matchId);
            relevantBets.push(...bets);
        }
    }

    return relevantBets.filter(bet => bet.isFixed === false);
}

/**
 * Sets all the given Bets to be fixed in the app database
 * 
 * @param relevantBets all bets to be fixed
 * @returns {Promise<boolean>} all set operations successful
 */
export async function updateBets(relevantBets: Bet[]): Promise<boolean> {
    let isUpdated: boolean = true;

    for (let bet of relevantBets) {
        bet.isFixed = true;
        isUpdated = await appdata.setBet(bet);

        if (isUpdated === false)
            break;
    }

    return isUpdated;
}