import {Bet, User} from "../business_rules/basic_datastructures";
import {SyncPhase, Email} from "../data_access/import_datastructures";
import * as appdata from "../data_access/appdata_access";
import { getAuth } from "firebase-admin/auth"
import * as util from "../util";

const EMOJI_ALARM: string =  String.fromCodePoint(0x23F0);
const EMOJI_BALL: string =  String.fromCodePoint(0x26BD);
const EMOJI_KISS: string = String.fromCodePoint(0x1F618);

/**
 * Returns all Users that have set up an email notification service
 * 
 * @returns the user list
 */
export async function getUsersWithNotification(): Promise<User[]> {
    const users: User[] = await appdata.getActiveUsers();
    return users.filter(user => user.configs.notificationLevel > 0);
}

/**
 * Checks if a notification may be send to the user or not, based on the
 * configurations of the user: If the user has surpressed to send out multiple
 * notifications (for each  kickoff) per day and if a notification has already
 * been sent out this day, no further notification will be sent
 * 
 * @param user the user to check
 * @returns true/false if notification should be send out or not
 */
export async function maySendNotification(user: User): Promise<boolean> {
    if (user.configs.notificationLevel === 1) {
        const dateDayBegin: Date = util.getBeginningOfDayDate();
        const emailUser: string = (await getAuth().getUser(user.id)).email!;
        
        let mailsSent: Email[] = await appdata.getMail(emailUser, dateDayBegin);
        mailsSent = mailsSent.filter(mail => mail.delivery !== undefined && mail.delivery.state == "SUCCESS"); 
        
        if (mailsSent.length > 0)
            return false;
    }

    return true;
}

/**
 * Get the sync phases that contain the matchIds to check the bets for. 
 * That is all sync phases that begin within the notification time
 * 
 * @param user the corresponding user
 * @returns all relevant sync phases
 */
export async function getRelevantSyncPhases(user: User): Promise<SyncPhase[]> {
    const timestampNow: number = util.getCurrentTimestamp();
    const timestampAhead: number = timestampNow + user.configs.notificationTime * 3600;

    // request sync phases smaller than timestamp now + time ahead 
    const relevantSyncPhases: SyncPhase[] = await appdata.getSyncPhases("<=", timestampAhead);

    // filter out sync phases smaller than now 
    return relevantSyncPhases.filter(syncPhase => syncPhase.start > timestampNow);
}

/**
 * Checks for the relevant SyncPhases (SyncPhases within the notification time) 
 * the bets that haven't been set by the user
 * 
 * @param user the user to check
 * @param syncPhases all relevant sync phases
 * @returns all matchIds where bets are missing
 */
export async function getMissingBetIds(user: User, syncPhases: SyncPhase[]): Promise<number[]> {
    let missingBetIds: number[] = [];

    for (let syncPhase of syncPhases) {
        for (let matchId of syncPhase.matchIds) {
            let bet: Bet = await appdata.getBet(matchId, user.id);
            
            // filter bets that have -1 goals 
            if (bet.goalsHome == -1 || bet.goalsAway == -1)
                missingBetIds.push(bet.matchId);
        }
    }

    return missingBetIds;
}

export async function composeMessage(user: User): Promise<Email> {
    const content: string = "Hi " + user.displayName + "!<br><br>"
        + "Wieder busy <i>af</i> und vergessen zu tippen? " 
        + "Macht nix, denn zum Glück gibt's ja mich " + EMOJI_KISS + "<br><br>"
        + "Wollte dir nur sagen, dass heute wieder Bundesliga ist - "
        + "und du hast noch nicht alle Spiele getippt!<br><br>"
        + "<b><a href='https://tgbfms.web.app/' target='_blank'>Direkt zur App</a></b>";

    const emailUser: string = (await getAuth().getUser(user.id)).email!;

    return {
        documentId: "",
        to: emailUser,
        message: {
            subject: EMOJI_ALARM + EMOJI_BALL + "Friendly Tipp-Reminder",
            html: content
        }
    };
}