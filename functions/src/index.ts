import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";
// import { getLastUpdateTime } from "./matchdata_access";
import { SEASON } from "../../src/app/Businessrules/rule_defined_values";
import { MatchList, getMatchdaysToUpdate, updateMatchdays } from "./sync_matchplan";

export const syncMatchPlan = functions.pubsub.schedule("every day 10:00")
  .timeZone("Europe/Berlin")
  .onRun(async (context: functions.EventContext) => {
    let matchList = new MatchList(SEASON);
    await matchList.fillMatchList();

    // update Matches
    let matchdaysToUpdate: number[] = await getMatchdaysToUpdate(matchList);
    let matchdaysUpdated: number[] = await updateMatchdays(SEASON, matchdaysToUpdate);

    // update SyncPhases


    return null;
  });

export const test = functions.pubsub.schedule("every 5 hours from 10:00 to 20:00")
  .timeZone("Europe/Berlin")
  .onRun((context: functions.EventContext) => {
    let dateString_local: string = "2022-05-06T20:30:00";
    let dateString_utc: string = "2022-05-06T20:30:00Z";

    let date_local: Date = new Date(dateString_local);
    let date_utc: Date = new Date(dateString_utc);

    console.log("date_local", date_local.getTime());
    console.log("date_utc", date_utc.getTime());
    console.log("offset", date_local.getTimezoneOffset())

    return null;
  });
