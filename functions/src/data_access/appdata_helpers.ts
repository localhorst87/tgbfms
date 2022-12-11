import * as admin from "firebase-admin";
import { Match } from "../../../src/app/Businessrules/basic_datastructures";
import { UpdateTime } from "./import_datastructures";

/**
 * Is processing the QuerySnapshot into the desired data type
 *
 * @param {QuerySnapshot} querySnapshot The Firestore QuerySnapshot of the
 *                                      requested Firestore data
 * @return {Type[]} The data of interest, without meta-data
 */
export function processSnapshot<Type>(querySnapshot: admin.firestore.QuerySnapshot): Type[] {
  let output: Type[] = [];

  let docs: admin.firestore.QueryDocumentSnapshot[] = querySnapshot.docs;
  for (let doc of docs) {
    let data: any = doc.data();
    data.documentId = doc.id;
    output.push(data);
  }

  return output;
}

/**
 * Creates a dummy match
 *
 * @param {number} matchId The unique ID the dummy match should be assigned to
 * @return {Match} A dummy match with the given unique ID
*/
export function makeUnknownMatch(matchId: number): Match {
  // returns an unknown dummy Match

  return {
    documentId: "",
    season: -1,
    matchday: -1,
    matchId: matchId,
    timestamp: -1,
    isFinished: false,
    isTopMatch: false,
    teamIdHome: -1,
    teamIdAway: -1
  };
}

/**
 * Creates an UpdateTime instance with the current timestamp for the given
 * season and matchday
 *
 * @param {number} season season that this UpdateTime shall point to
 * @param {number} matchday matchday that this UpdateTime shall point to
 * @return {UpdateTime} The new UpdateTime with the current timestamp
*/
export function makeUnknownUpdateTime(season: number, matchday: number): UpdateTime {
  return {
    documentId: "",
    season: season,
    matchday: matchday,
    timestamp: -1
  }
}
