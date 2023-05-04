import * as functions from "firebase-functions";
import { SEASON } from "./business_rules/rule_defined_values";
import { Match } from "./business_rules/basic_datastructures";
import * as sync_live from "./sync_live/sync_live";
import * as sync_matchplan from "./sync_matchplan";
import * as sync_topmatch from "./sync_topmatch/sync_topmatch";
import { SyncPhase } from "./data_access/import_datastructures";

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
  
    return null;
  });

export const syncMatchPlan = functions
  .region('europe-west3')
  .pubsub
  .schedule('every day 10:00')
  .timeZone('Europe/Berlin')
  .onRun(async (context: functions.EventContext) => {
    let matchList = new sync_matchplan.MatchList(SEASON);
    await matchList.fillMatchList();

    // update Matches
    const matchdaysToUpdate: number[] = await sync_matchplan.getMatchdaysToUpdate(matchList);
    const updatedMatches: Match[] = await sync_matchplan.updateMatchdays(SEASON, matchdaysToUpdate);

    // update MatchList
    if (updatedMatches.length > 0) 
      matchList.updateMatches(updatedMatches);

    // update SyncPhases
    const matchesNextDays: Match[] = matchList.getNextMatches(3);
    const syncPhases: SyncPhase[] = sync_matchplan.createSyncPhases(matchesNextDays);
    await sync_matchplan.updateSyncPhases(syncPhases);

    return null;
  });