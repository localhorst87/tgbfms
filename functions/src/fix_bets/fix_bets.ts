import * as appdata from "../data_access/appdata_access";
import * as util from "../util";
import * as helper from "./fix_bets_helper";
import {SyncPhase} from "../data_access/import_datastructures";
import {Bet} from "../business_rules/basic_datastructures";

const RETRY_ON_FAIL: number = 3;

export async function fixBets(): Promise<void> {
    const timestampNow: number = util.getCurrentTimestamp();
    const syncPhases: SyncPhase[] = await appdata.getSyncPhases("<=", timestampNow);
    if (syncPhases.length == 0)
        return;

    let relevantBets: Bet[] = await helper.getRelevantBets(syncPhases);
    if (relevantBets.length == 0)
        return;
    
    let updateBets: boolean = false;
    let tryCounter: number = 0;

    while (updateBets === false) {
        updateBets = await helper.updateBets(relevantBets);
        if (tryCounter++ == RETRY_ON_FAIL)
            break;
    }

    return;
}