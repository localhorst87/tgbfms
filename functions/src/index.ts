import * as functions from "firebase-functions";
import { SEASON } from "./business_rules/rule_defined_values";
import { Match } from "./business_rules/basic_datastructures";
import * as sync_live from "./sync_live/sync_live";
import * as sync_live_helper from "./sync_live/sync_live_helpers";
import * as sync_matchplan from "./sync_matchplan";
import { SyncPhase } from "./data_access/import_datastructures";

export const syncLiveData = functions
  .region('europe-west3')
  .pubsub.schedule('every 15 minutes from 15:30 to 23:00')
  .timeZone('Europe/Berlin')
  .onRun(async (context: functions.EventContext) => {
    let matchesToSync: Match[] = await sync_live_helper.getRelevantMatchesToSync();

    if (matchesToSync.length == 0) // nothing to sync...
      return;
  
    // sync matches
    const matchesSynced: Match[] = await sync_live.syncMatches(matchesToSync);
  
    // sync team ranking 
    const season = matchesToSync[0].season;
    await sync_live.syncTeamRanking(season);
  
    // sync user scores
    const matchdaysSynced = matchesSynced.map((match: Match) => match.matchday).unique();
    for (let matchday of matchdaysSynced)
      await sync_live.updateScoreSnapshot(season, matchday);
  
    return null;
  });

export const syncMatchPlan = functions
  .region('europe-west3')
  .pubsub.schedule('every day 10:00')
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

    console.log(matchList.getNextMatches(5));

    // update SyncPhases
    const matchesNextDays: Match[] = matchList.getNextMatches(3);
    const syncPhases: SyncPhase[] = sync_matchplan.createSyncPhases(matchesNextDays);
    await sync_matchplan.updateSyncPhases(syncPhases);

    return null;
  });