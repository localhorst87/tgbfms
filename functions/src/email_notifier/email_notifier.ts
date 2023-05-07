import {User} from "../business_rules/basic_datastructures";
import {Email, SyncPhase} from "../data_access/import_datastructures";
import * as helpers from "./email_notifier_helpers";
import * as appdata from "../data_access/appdata_access";

/**
 * Sends out notification on behalf of the users configuration if at least one 
 * bet is missing for the upcoming matches
 */
export async function notifyMissingBets(): Promise<void> {
    // get all users that have set up a notification
    let users: User[] = await helpers.getUsersWithNotification();

    for (let user of users) {
        // check if notifications may be sent out, based on user configuration
        // (multiple notifications per day allowed? notification sent out today?)
        if ((await helpers.maySendNotification(user)) === false)
            continue;
        
        // get all sync phases that begin with the notification time from now on
        const relevantSyncPhases: SyncPhase[] = await helpers.getRelevantSyncPhases(user);

        // get missing bets for all matches of relevant sync phases
        const missingBetIds: number[] = await helpers.getMissingBetIds(user, relevantSyncPhases);
        
        // if any bets are missing, send out notification
        if (missingBetIds.length > 0) {
            let email: Email = await helpers.composeMessage(user);
            await appdata.setMail(email);
        }
    }
}