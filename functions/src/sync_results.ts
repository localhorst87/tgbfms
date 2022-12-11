import { Match } from "../../src/app/Businessrules/basic_datastructures";
import { MatchImportData, SyncPhase } from "./data_access/import_datastructures";
import * as appdata from "./data_access/appdata_access";
import * as matchdata from "./data_access/matchdata_access";
import { getCurrentTimestamp } from "./util";

/**
 * deletes double entries from an array
 */
Array.prototype.unique = function() {
    let arr = this.concat();
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] === arr[j])
          arr.splice(j--, 1);
      }
    }
  
    return arr;
};

export async function getRelevantSyncPhases(): Promise<SyncPhase[]> {
    const timestampNow: number = getCurrentTimestamp();
    // return syncPhases.map(phase => phase.matchIds).flat();
    return appdata.getSyncPhases("<=", timestampNow);
}

export async function getMatchesToSync(syncPhase: SyncPhase): Promise<Match[]> {
  let matchesToSync: Match[] = [];
  for (let id of syncPhase.matchIds) {
    matchesToSync.push(await appdata.getMatch(id));
  }

  return matchesToSync.filter((match: Match) => match.isFinished == false);
}

export async function getSyncData(matches: Match[]): Promise<MatchImportData[]> {
  const season: number = matches[0].season; // two seasons never overlap, so take it as representative for all

  let matchdaysToSync: number[] = matches.map((match: Match) => match.matchday).unique();
  let matchImportData: MatchImportData[][] = [];
  for (let matchday of matchdaysToSync) {
    matchImportData.push(await matchdata.importMatchdata(season, matchday));
  }

  return matchImportData.flat();
}