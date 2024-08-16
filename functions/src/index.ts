import * as functions from "firebase-functions";
import * as sync_live from "./sync_live/sync_live";
import * as sync_matchplan from "./sync_matchplan/sync_matchplan";
import * as sync_topmatch from "./sync_topmatch/sync_topmatch";
import * as fix_bets from "./fix_bets/fix_bets";
import * as email_notifier from "./email_notifier/email_notifier";
import * as auth_services from "./services/auth/auth_services";
import * as basic_data_services from "./services/basic/basic_data_service";
import * as init_season from "./init_season/init_season";

export const changeUsername = functions
  .region('europe-west3')
  .https
  .onCall(async (data, context) => {
    const oldUsername: string = data.oldUsername;
    const newUsername: string = data.newUsername;
    const isSuccessful: boolean = await auth_services.changeUsername(oldUsername, newUsername);
    
    return {
      operationSuccessful: isSuccessful
    };
});

export const changeEmail = functions
  .region('europe-west3')
  .https
  .onCall(async (data, context) => {
    const userId: string = data.userId;
    const newEmail: string = data.newEmail;
    const isSuccessful: boolean = await auth_services.changeEmail(userId, newEmail);
    
    return {
      operationSuccessful: isSuccessful
    };
});

export const changePassword = functions
  .region('europe-west3')
  .https
  .onCall(async (data, context) => {
    const userId: string = data.userId;
    const newPassword: string = data.newPassword;
    const isSuccessful: boolean = await auth_services.changePassword(userId, newPassword);
    
    return {
      operationSuccessful: isSuccessful
    };
});

export const getCurrentMatchdays = functions
  .region('europe-west3')
  .https
  .onCall(async (data, context) => {
    const matchdays: basic_data_services.CurrentMatchdays = await basic_data_services.getCurrentMatchdays();
    
    return matchdays;
});

/**
 * Synchronizes results, ranking and scores
 * 
 * At minute 0, 15, 30, and 45
 * past every hour from 15 till 22 included
 * on Friday, Saturday, and Sunday
 * in January, February, March, April, May, August, September, October, November, and December.
 */
export const syncLiveResults = functions
  .region('europe-west3')
  .pubsub
  .schedule('0,15,30,45 15-22 * 1,2,3,4,5,8,9,10,11,12 Fri,Sat,Sun')
  .timeZone('Europe/Berlin')
  .onRun(async (context: functions.EventContext) => {
    await sync_live.syncLive();
    return null;
  });

/**
 * Evalutes top match votes and sets top match
 * 
 * At minute 30
 * past hour 14, 17, and 19
 * on Tuesday, Friday, and Saturday
 * in January, February, March, April, May, August, September, October, November, and December.
 */
export const syncTopMatch = functions
  .region('europe-west3')
  .pubsub
  .schedule('30 14,17,19 * 1,2,3,4,5,8,9,10,11,12 Tue,Fri,Sat')
  .timeZone('Europe/Berlin')
  .onRun(async (context: functions.EventContext) => {
    await sync_topmatch.syncTopMatch();  
    return null;
  });

/**
 * Fixes open bets on kickoffs
 * 
 * At minute 30
 * past hour 15, 17, 18, 19, and 20
 * in January, February, March, April, May, August, September, October, November, and December.
 */
export const fixOpenBets = functions
  .region('europe-west3')
  .pubsub
  .schedule('30 15,17,18,19,20 * 1,2,3,4,5,8,9,10,11,12 *')
  .timeZone('Europe/Berlin')
  .onRun(async (context: functions.EventContext) => {
    await fix_bets.fixBets();  
    return null;
  });

/**
 * Synchronizes the match plan
 * 
 * At minute 0
 * past hour 9 and 23
 * in January, February, March, April, May, August, September, October, November, and December.
 */
export const syncMatchPlan = functions
  .region('europe-west3')
  .pubsub
  .schedule('0 9,23 * 1,2,3,4,5,8,9,10,11,12 *')
  .timeZone('Europe/Berlin')
  .onRun(async (context: functions.EventContext) => {
    await sync_matchplan.syncMatchplan();
    return null;
  });

/**
 * notifies users if they forgot to set bets
 * 
 * At minute 0 and 30
 * past every hour from 9 through 20
 * in January, February, March, April, May, August, September, October, November, and December.
 */
export const notifyUsers = functions
  .region('europe-west3')
  .pubsub
  .schedule('0,30 9-20 * 1,2,3,4,5,8,9,10,11,12 *')
  .timeZone('Europe/Berlin')
  .onRun(async (context: functions.EventContext) => {
    await email_notifier.notifyMissingBets();
    return null;
  });

/**
 * initiates table and stats
 * 
 * At 20:00 on August 5th
 */
export const initSeason = functions
  .region('europe-west3')
  .pubsub
  .schedule('0 20 5 8 *')
  .timeZone('Europe/Berlin')
  .onRun(async (context: functions.EventContext) => {
    await init_season.initSeason();
    return null;
});