import * as admin from "firebase-admin";
import {WhereFilterOp} from '@firebase/firestore-types';
import {Match, 
  Bet, 
  SeasonBet, 
  SeasonResult, 
  User,
  TopMatchVote} from "../business_rules/basic_datastructures";
import {UpdateTime, 
  SyncPhase, 
  MatchdayScoreSnapshot,
  Email} from "./import_datastructures";
import * as helper from "./appdata_helpers";
import { Table } from "./export_datastructures";

const COLLECTION_NAME_MATCHES: string = "matches";
const COLLECTION_NAME_BETS: string = "bets";
const COLLECTION_NAME_UPDATE_TIMES: string = "sync_times";
const COLLECTION_NAME_SYNC_PHASES: string = "sync_phases";
const COLLECTION_NAME_SEASON_BETS: string = "season_bets";
const COLLECTION_NAME_SEASON_RESULTS: string = "season_results";
const COLLECTION_NAME_USERS: string = "users";
const COLLECTION_NAME_SCORE_SNAPSHOT: string = "matchday_score_snapshots";
const COLLECTION_NAME_TOPMATCH_VOTES: string = "topmatch_votes";
const COLLECTION_NAME_EMAIL: string = "mail";
const COLLECTION_NAME_VIEW_TABLES: string = "view_tables";

// for testing with online Firebase services: 
// GOOGLE_APPLICATION_CREDENTIALS must be set as env variable and point to
// credentials file
admin.initializeApp();

/**
 * Requests all matches of the given season and returns it as a Promise
 *
 * @param {number} season The season for which the matches should be requested
 * @returns {Promise<Match[]>} All the matches of the selected season
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
 * 
 * @param {number} season season for which the matches should be requested
 * @param {number} matchday matchday for which the matches should be requested
 * @returns {Promise<Match[]>} All matches of the given matchday
 */
export function getMatchesByMatchday(season: number, matchday: number): Promise<Match[]> {
  let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_MATCHES)
    .where("season", "==", season)
    .where("matchday", "==", matchday);

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
 * Requests the top match of the given matchday.
 * If no top match is existing yet, a dummy match is returned.
 * 
 * @param {number} season the season of the matchday
 * @param {number} matchday the matchday to request the top match for
 * @returns {Promise<Match>} the top match of the selected matchday
 */
export function getTopMatch(season: number, matchday: number): Promise<Match> {
  let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_MATCHES)
    .where("season", "==", season)
    .where("matchday", "==", matchday)
    .where("isTopMatch", "==", true);

  return query.get().then(
    (querySnapshot: admin.firestore.QuerySnapshot) => {
      let matchList: Match[] = helper.processSnapshot<Match>(querySnapshot);
      if (matchList.length > 0) {
        return matchList[0];
      }
      else {
        return helper.makeUnknownMatch(-1);
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

/**
 * Requests a bet with the given match ID and user ID (combination is unique)
 * If the bet is not existing in the app database, a dummy Bet will be returned
 * 
 * @param matchId the match ID of the target bet to request
 * @param userId the user ID of the target bet to request
 * @returns the requested bet
 */
export function getBet(matchId: number, userId: string): Promise<Bet> {
  let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_BETS)
  .where("matchId", "==", matchId)
  .where("userId", "==", userId);

  return query.get().then(
    (querySnapshot: admin.firestore.QuerySnapshot) => {
      let betList: Bet[] = helper.processSnapshot<Bet>(querySnapshot);
      if (betList.length > 0) {
        return betList[0];
      }
      else {
        return helper.makeUnknownBet(matchId, userId);
      }
    }
  );
}

/**
 * Requests the Bets of all users with the given match ID
 * 
 * @param matchId the match ID of the target bets to request
 * @returns all bets of the given match ID
 */
export function getAllBets(matchId: number): Promise<Bet[]> {
  let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_BETS)
    .where("matchId", "==", matchId);

  return query.get().then(
    (querySnapshot: admin.firestore.QuerySnapshot) => {
      return helper.processSnapshot<Bet>(querySnapshot);
    }
  );
}

/**
 * Sets the given Bet in the app database
 * 
 * @param bet the bet to set
 * @returns operation successful
 */
export function setBet(bet: Bet): Promise<boolean> {
  let documentReference: admin.firestore.DocumentReference;
  if (bet.documentId == "") {
    documentReference = admin.firestore().collection(COLLECTION_NAME_BETS).doc()
  }
  else {
    documentReference = admin.firestore().collection(COLLECTION_NAME_BETS).doc(bet.documentId);
  }

  // documentId should not be a property in the dataset itself, as it is meta-data
  let betToSet: any = { ...bet };
  delete betToSet.documentId;

  return documentReference.set(betToSet)
    .then(() => {
      return true;
    })
    .catch((err: any) => {
      return false;
    });
}

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
 * @param {number} season the season of the corresponding bets to request
 * @param {string} userId the corresponding user ID of the bets to request
 * @returns {Promise<SeasonBet[]>} all SeasonBets according to the requested season and userId
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
 * @param {number} season the season of the corresponding results to request
 * @returns {Promise<SeaSeasonResult[]>} all SeasonResults according to the requested season
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
 * @param {SeasonResult} result the result to set
 * @returns {Promise<boolean>} true/false upon successful/failed operation
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

/**
 * Returns all active user profiles and returns them as an array
 * 
 * @returns {Promise<User[]>} active users
 */
export async function getActiveUsers(): Promise<User[]> {
  let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_USERS)
    .where("isActive", "==", true);

  return query.get().then(
    (querySnapshot: admin.firestore.QuerySnapshot) => {
      return helper.processSnapshot<User>(querySnapshot);
    }
  );
}

/**
 * Returns a snapshot of the current matchday Scores, that is all scores of all users of a specific
 * matchday, non-sorted.
 * 
 * If the MatchdayScoreSnapshot is not existing, a dummy snapshot is returned.
 * 
 * @param {number} season the corresponding season
 * @param {number} matchday the corresponding matchday of the snapshot
 * @returns {Promise<MatchdayScoreSnapshot>} the requested MatchdayScoreSnapshot, if existet. Else, a dummy.
 */
export async function getMatchdayScoreSnapshot(season: number, matchday: number): Promise<MatchdayScoreSnapshot> {
  let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_SCORE_SNAPSHOT)
    .where("season", "==", season)
    .where("matchday", "==", matchday);

  return query.get().then(
    (querySnapshot: admin.firestore.QuerySnapshot) => {
      let snapshot: MatchdayScoreSnapshot[] = helper.processSnapshot<MatchdayScoreSnapshot>(querySnapshot);
      if (snapshot.length > 0)
        return snapshot[0];
      else
        return helper.makeUnknownScoreSnapshot(season, matchday);
    }
  );
}

/**
 * Sets a MatchdayScoreSnapshot in the App database
 * 
 * @param {MatchdayScoreSnapshot} snapshot 
 * @returns {Promise<boolean>} ScoreSnapshot set successful or not
 */
export async function setMatchdayScoreSnapshot(snapshot: MatchdayScoreSnapshot): Promise<boolean> {
  let documentReference: admin.firestore.DocumentReference;
  if (snapshot.documentId == "") {
    documentReference = admin.firestore().collection(COLLECTION_NAME_SCORE_SNAPSHOT).doc()
  }
  else {
    documentReference = admin.firestore().collection(COLLECTION_NAME_SCORE_SNAPSHOT).doc(snapshot.documentId);
  }

  // documentId should not be a property in the dataset itself, as it is meta-data
  let snapshotToSet: any = { ...snapshot };
  delete snapshotToSet.documentId;

  return documentReference.set(snapshotToSet)
    .then(() => {
      return true;
    })
    .catch((err: any) => {
      return false;
    });
}

/**
 * Requests all TopMatchVotes for the given matchday
 * 
 * @param season the selected season
 * @param matchday the selected matchday
 * @returns {Promise<TopMatchVote[]>}
 */
export async function getTopMatchVotes(season: number, matchday: number): Promise<TopMatchVote[]> {
  let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_TOPMATCH_VOTES)
    .where("season", "==", season)
    .where("matchday", "==", matchday);

  return query.get().then(
    (querySnapshot: admin.firestore.QuerySnapshot) => {
      return helper.processSnapshot<TopMatchVote>(querySnapshot);
    }
  );
}

/**
 * Gets all emails that has been sent out since the given startDate to the given
 * recipient 
 * 
 * @param to email adress of the recipient
 * @param startDate only emails later than this Date will be considered
 * @returns {Promise<any[]>} all emails that hold true
 */
export async function getMail(to: string, startDate: Date): Promise<Email[]> {
  let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_EMAIL)
    .where("to", "==", to)
    .where("delivery.endTime", ">=", startDate);

  return query.get().then(
    (querySnapshot: admin.firestore.QuerySnapshot) => {
      return helper.processSnapshot<any>(querySnapshot);
    }
  );  
}

/**
 * Sets an Email object in the app database (which triggers to send an email
 * to the given recipient)
 * 
 * @param email the email, as defined with all necessary fields
 * @returns 
 */
export async function setMail(email: Email): Promise<boolean> {
  let documentReference: admin.firestore.DocumentReference;
  if (email.documentId == "") {
    documentReference = admin.firestore().collection(COLLECTION_NAME_EMAIL).doc()
  }
  else {
    documentReference = admin.firestore().collection(COLLECTION_NAME_EMAIL).doc(email.documentId);
  }

  // documentId should not be a property in the dataset itself, as it is meta-data
  let emailToSet: any = { ...email };
  delete emailToSet.documentId;

  return documentReference.set(emailToSet)
    .then(() => {
      return true;
    })
    .catch((err: any) => {
      return false;
    });
}

/**
 * Get a specific Table for the view in the frontend. A specific Table object
 * is uniquely identified by the id, the season and the matchday.
 * 
 * If the requested Table does not exist in the app database, an empty dummy
 * Table object will be created.
 * 
 * @param id the id of the table to request. Must be one of the following:
 *            "total", "matchday", "second_half", "last_5", "last_10"
 * @param season the season of the corresp. matchday for unique identification 
 * @param matchday the matchday of the table
 * @returns the requested table or a dummy Table object
 */
export async function getTableView(id: string, season: number, matchday: number): Promise<Table> {
  let query: admin.firestore.Query = admin.firestore().collection(COLLECTION_NAME_VIEW_TABLES)
    .where("id", "==", id)
    .where("season", "==", season)
    .where("matchday", "==", matchday);

  return query.get().then(
    (querySnapshot: admin.firestore.QuerySnapshot) => {
      let table: Table[] = helper.processSnapshot<Table>(querySnapshot);
      if (table.length > 0)
        return table[0];
      else
        return helper.makeUnknownTableView(id, season, matchday);
    }
  );
}

/**
 * Sets the given Table in the app database
 * 
 * @param table the Table object to set
 * @returns 
 */
export async function setTableView(table: Table): Promise<boolean> {
  let documentReference: admin.firestore.DocumentReference;
  if (table.documentId == "") {
    documentReference = admin.firestore().collection(COLLECTION_NAME_VIEW_TABLES).doc()
  }
  else {
    documentReference = admin.firestore().collection(COLLECTION_NAME_VIEW_TABLES).doc(table.documentId);
  }

  // documentId should not be a property in the dataset itself, as it is meta-data
  let tableToSet: any = { ...table };
  delete tableToSet.documentId;

  return documentReference.set(tableToSet)
    .then(() => {
      return true;
    })
    .catch((err: any) => {
      return false;
    });
}