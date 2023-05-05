import * as functions from "firebase-functions";
import { SEASON } from "./business_rules/rule_defined_values";
import { Match } from "./business_rules/basic_datastructures";
import * as sync_live from "./sync_live/sync_live";
import * as sync_matchplan from "./sync_matchplan/sync_matchplan";
import * as sync_topmatch from "./sync_topmatch/sync_topmatch";
import * as fix_bets from "./fix_bets/fix_bets";
import { SyncPhase } from "./data_access/import_datastructures";

// alternative cron jobs / cron.yaml

// result sync: 

// At every 15th minute from 0 through 59 past every hour from 15 through 23 
// on Friday, Saturday, and Sunday in January, February, March, April, 
// May, August, September, October, November, and December.
// --> '0/15 15-23 * 1,2,3,4,5,8,9,10,11,12 Fri,Sat,Sun'

// top match sync: 

// At minute 31 past hour 14, 17, and 19 on Tuesday, Friday, and Saturday in 
// January, February, March, April, May, August, September, October, November, 
// and December.
// --> '31 14,17,19 * 1,2,3,4,5,8,9,10,11,12 Tue,Fri,Sat'

// fix bet sync:

// At minute 31 past hour 15, 17, 18, 19, and 20 in January, February, March,
// April, May, August, September, October, November, and December.
// --> '31 15,17,18,19,20 * 1,2,3,4,5,8,9,10,11,12 *'

export const refreshMatchesAndBets = functions
  .region('europe-west3')
  .pubsub
  .schedule('every 15 minutes from 14:30 to 23:00')
  .timeZone('Europe/Berlin')
  .onRun(async (context: functions.EventContext) => {
    // sync results, ranking and scores
    await sync_live.syncLive();

    // sync top match
    await sync_topmatch.syncTopMatch();

    // fix bets
    await fix_bets.fixBets();
  
    return null;
  });

export const syncMatchPlan = functions
  .region('europe-west3')
  .pubsub
  .schedule('every day 10:00')
  .timeZone('Europe/Berlin')
  .onRun(async (context: functions.EventContext) => {
    await sync_matchplan.syncMatchplan();

    return null;
  });