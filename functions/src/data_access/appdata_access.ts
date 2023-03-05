import * as admin from "firebase-admin";
import { WhereFilterOp } from '@firebase/firestore-types';
import { Match, SeasonBet, SeasonResult } from "../../../src/app/Businessrules/basic_datastructures";
import { UpdateTime, SyncPhase } from "./import_datastructures";
import * as helper from "./appdata_helpers";

const COLLECTION_NAME_MATCHES = "matches";
const COLLECTION_NAME_UPDATE_TIMES = "sync_times";
const COLLECTION_NAME_SYNC_PHASES = "sync_phases";
const COLLECTION_NAME_SEASON_BETS = "season_bets";
const COLLECTION_NAME_SEASON_RESULTS = "season_results";

// GOOGLE_APPLICATION_CREDENTIALS must be set as env variable and point to credentials file
admin.initializeApp();

/**
 * Requests all matches of the given season and returns it as a Promise
 *
 * @param {number} season The season for which the matches should be requested
 * @return {Promise<Match[]>} All the matches of the selected season
 */
export function getAllMatches(season: number): Promise<Match[]> {
  let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_MATCHES)
    .where("season", "==", season);

  return query.get().then(
      (querySnapshot: admin.firestore.QuerySnapshot) => {
        return helper.processSnapshot<Match>(querySnapshot);
      }
  );
}

/**
 * Requests a match with the given unique match ID
 * If the match is not existing in the app database, a dummy Match will be returned
 *
 * @param {number} matchId The unique ID of the match
 * @return {Promise<Match>} The requested Match or dummy Match if not existing
 */
export function getMatch(matchId: number): Promise<Match> {
  let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_MATCHES)
    .where("matchId", "==", matchId);

  return query.get().then(
    (querySnapshot: admin.firestore.QuerySnapshot) => {
      let matchList: Match[] = helper.processSnapshot<Match>(querySnapshot);
      if (matchList.length > 0) {
        return matchList[0];
      }
      else {
        return helper.makeUnknownMatch(matchId);
      }
    }
  );
}

/**
 * Adds or updates a Match. If documentId of the Match equals an empty string,
 * the Match will be added, if the documentId is already available, the Match
 * will be updated. Returns a true/false Promise if the operation has been
 * successful or not.
 *
 * @param {Match} match The Match to add or update
 * @return {Promise<boolean>} Feedback if operation was successful or not
 */
export function setMatch(match: Match): Promise<boolean> {
  let documentReference: admin.firestore.DocumentReference;
  if (match.documentId == "") {
    documentReference = admin.firestore().collection(COLLECTION_NAME_MATCHES).doc()
  }
  else {
    documentReference = admin.firestore().collection(COLLECTION_NAME_MATCHES).doc(match.documentId);
  }

  // documentId should not be a property in the dataset itself, as it is meta-data
  let matchToSet: any = { ...match };
  delete matchToSet.documentId;

  return documentReference.set(matchToSet)
    .then(() => {
      return true;
    })
    .catch((err: any) => {
      return false;
    });
}

// export function getNextMatch(season: number, amount: number = 1): Promise<Match[]> {
//   let currentTimestamp: number = getCurrentTimestamp();
//
//   let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_MATCHES)
//     .where("timestamp", ">", currentTimestamp)
//     .where("season", "==", season)
//     .orderBy("timestamp")
//     .limit(amount);
//
//   return query.get().then(
//     (querySnapshot: admin.firestore.QuerySnapshot) => {
//       return processSnapshot<Match>(querySnapshot);
//     }
//   );
// }

// export function getLastMatch(season: number, amount: number = 1): Promise<Match[]> {
//   let currentTimestamp: number = getCurrentTimestamp();
//
//   let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_MATCHES)
//     .where("timestamp", "<", currentTimestamp)
//     .where("season", "==", season)
//     .orderBy("timestamp", "desc")
//     .limit(amount);
//
//   return query.get().then(
//     (querySnapshot: admin.firestore.QuerySnapshot) => {
//       return processSnapshot<Match>(querySnapshot);
//     }
//   );
// }
//
// export function getPendingMatches(season: number, matchday: number, amount: number): Promise<Match[]> {
//   let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_MATCHES)
//     .where("season", "==", season)
//     .where("matchday", "==", matchday)
//     .where("isFinished", "==", false)
//     .orderBy("matchday")
//     .limit(amount)
//
//   return query.get().then(
//     (querySnapshot: admin.firestore.QuerySnapshot) => {
//       return processSnapshot<Match>(querySnapshot);
//     }
//   );
// }

/**
 * Requests the time of when the last update of the match in the app database
 * has been processed
 *
 * @param {number} season The season for which the time will be requested
 * @param {number} matchday The matchday for which the time will be requested
 * @return {Promise<number>} The update time as unix timestamp in seconds
 */
export function getLastUpdateTime(season: number, matchday: number): Promise<UpdateTime> {
  let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_UPDATE_TIMES)
    .where("season", "==", season)
    .where("matchday", "==", matchday);

  return query.get().then(
    (querySnapshot: admin.firestore.QuerySnapshot) => {
      let syncTime: UpdateTime[] = helper.processSnapshot<UpdateTime>(querySnapshot);
      if (syncTime.length > 0)
        return syncTime[0];
      else
        return helper.makeUnknownUpdateTime(season, matchday);
    }
  );
}

/**
 * Sets a new update time for a specific matchday, according to the given update
 * time document. Returns a true/false Promise, if the operation has been successful
 * or not
 *
 * @param {UpdateTime} updateTime The new update time dataset
 * @return {Promise<boolean>} Feedback if operation was successful or not
 */
export function setUpdateTime(updateTime: UpdateTime): Promise<boolean> {
  let documentReference: admin.firestore.DocumentReference;
  if (updateTime.documentId == "") {
    documentReference = admin.firestore().collection(COLLECTION_NAME_UPDATE_TIMES).doc()
  }
  else {
    documentReference = admin.firestore().collection(COLLECTION_NAME_UPDATE_TIMES).doc(updateTime.documentId);
  }

  // documentId should not be a property in the dataset itself, as it is meta-data
  let updateTimeToSet: any = { ...updateTime };
  delete updateTimeToSet.documentId;

  return documentReference.set(updateTimeToSet)
    .then(() => {
      return true;
    })
    .catch((err: any) => {
      return false;
    });
}

/**
 * Get SyncPhase array, depending on the given start time
 *
 * @param {WhereFilterOp} operator  must be set to "==" if exactly the SyncPhase with the
 *                                  given startTimestamp should be queried, or ">" for
 *                                  future SyncPhases, or "<" for past SyncPhases
 * @param {number} startTimestamp   The start timestamp of the SyncPhase to query
 * @return {Promise<SyncPhase[]>}   All SyncPhases that fulfill the time condition
 */
export function getSyncPhases(operator: WhereFilterOp, startTimestamp: number): Promise<SyncPhase[]> {
  let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_SYNC_PHASES)
    .where("start", operator, startTimestamp);

  return query.get().then(
    (querySnapshot: admin.firestore.QuerySnapshot) => {
      return helper.processSnapshot<SyncPhase>(querySnapshot);
    }
  );
}

/**
 * Sets a SyncPhase according to the given input. Returns a true/false Promise,
 * if the operation has been successful or not
 *
 * @param {SyncPhase} syncPhase The SyncPhase dataset
 * @return {Promise<boolean>} Feedback if operation was successful or not
 */
export function setSyncPhase(syncPhase: SyncPhase): Promise<boolean> {
  let documentReference: admin.firestore.DocumentReference;
  if (syncPhase.documentId == "") {
    documentReference = admin.firestore().collection(COLLECTION_NAME_SYNC_PHASES).doc()
  }
  else {
    documentReference = admin.firestore().collection(COLLECTION_NAME_SYNC_PHASES).doc(syncPhase.documentId);
  }

  // documentId should not be a property in the dataset itself, as it is meta-data
  let syncPhaseToSet: any = { ...syncPhase };
  delete syncPhaseToSet.documentId;

  return documentReference.set(syncPhaseToSet)
    .then(() => {
      return true;
    })
    .catch((err: any) => {
      return false;
    });
}

/**
 * Deletes all SyncPhases that fulfill the condition given with operator and startTimestamp
 *
 * @param {WhereFilterOp} operator  must be set to "==" if exactly the SyncPhase with the
 *                                  given startTimestamp should be queried, or ">" for
 *                                  future SyncPhases, or "<" for past SyncPhases
 * @param {number} startTimestamp   The start timestamp of the SyncPhase to query
 * @return {Promise<boolean>} Feedback if operation was successful or not
 */
export async function deleteSyncPhases(operator: WhereFilterOp, startTimestamp: number): Promise<boolean> {
  let syncPhases: SyncPhase[] = await getSyncPhases(operator, startTimestamp);

  let docRef: admin.firestore.DocumentReference;
  let isDeleted: boolean = true;

  for (let syncPhase of syncPhases) {
    docRef = admin.firestore().collection(COLLECTION_NAME_SYNC_PHASES).doc(syncPhase.documentId);
    isDeleted = await docRef.delete()
      .then(() => {
        return true;
      })
      .catch((err: any) => {
        return false;
      });

    if (isDeleted == false)
      break; // if deleting fails, cancel operation
  }

  return isDeleted;
}

/**
 * Yields the season bets for the given user and season
 * 
 * @param season the season of the corresponding bets to request
 * @param userId the corresponding user ID of the bets to request
 * @returns all SeasonBets according to the requested season and userId
 */
export async function getSeasonBets(season: number, userId: string): Promise<SeasonBet[]> {
  let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_SEASON_BETS)
    .where("season", "==", season)
    .where("userId", "==", userId);

  return query.get().then(
    (querySnapshot: admin.firestore.QuerySnapshot) => {
      const bets: SeasonBet[] =  helper.processSnapshot<SeasonBet>(querySnapshot);
      return helper.postProcessSeasonBets(bets, season, userId);
    }
  );
}

/**
 * Yields the current season results for the given season
 * 
 * @param season the season of the corresponding results to request
 * @returns all SeasonResults according to the requested season
 */
export async function getSeasonResults(season: number): Promise<SeasonResult[]> {
  let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_SEASON_RESULTS)
  .where("season", "==", season);

  return query.get().then(
    (querySnapshot: admin.firestore.QuerySnapshot) => {
      const results: SeasonResult[] =  helper.processSnapshot<SeasonResult>(querySnapshot);
      return helper.postProcessSeasonResults(results, season);
    }
  );
}

/**
 * Sets a specific season result. If the dataset is already existing in the App DB
 * it will update the result, else it will add a new dataset
 * 
 * @param result the result to set
 * @returns true/false upon successful/failed operation
 */
export async function setSeasonResult(result: SeasonResult): Promise<boolean> {
  let documentReference: admin.firestore.DocumentReference;
  if (result.documentId == "") {
    documentReference = admin.firestore().collection(COLLECTION_NAME_SEASON_RESULTS).doc()
  }
  else {
    documentReference = admin.firestore().collection(COLLECTION_NAME_SEASON_RESULTS).doc(result.documentId);
  }

  // documentId should not be a property in the dataset itself, as it is meta-data
  let resultToSet: any = { ...result };
  delete resultToSet.documentId;

  return documentReference.set(resultToSet)
    .then(() => {
      return true;
    })
    .catch((err: any) => {
      return false;
    });
}