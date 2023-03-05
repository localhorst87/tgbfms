import * as admin from "firebase-admin";
import { Match, SeasonBet, SeasonResult } from "../../../src/app/Businessrules/basic_datastructures";
import { RELEVANT_FIRST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT } from "../../../src/app/Businessrules/rule_defined_values";
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
 * Sorts SeasonBet array in ascendings order and fills up unknown SeasonBets
 * 
 * @param seasonBetsRaw raw SeasonBet array from the DB
 * @param season season of the given bets
 * @param userId id of the user
 * @return sorted and filled up SeasonBet array
 */
export function postProcessSeasonBets(seasonBetsRaw: SeasonBet[], season: number, userId: string): SeasonBet[] {
  let postprocessedBets = [];

  const relevantPlaces = createRelevantPlacesArray();

  for (let place of relevantPlaces) {
    let requestedBet: SeasonBet[] = seasonBetsRaw.filter((bet: SeasonBet) => bet.place == place);
    if (requestedBet.length > 0)
      postprocessedBets.push(requestedBet[0])
    else 
      postprocessedBets.push(makeUnknownSeasonBet(season, place, userId));
  }

  return postprocessedBets;
}

export function postProcessSeasonResults(seasonResultsRaw: SeasonResult[], season: number): SeasonResult[] {
  let postprocessedResults = [];

  const relevantPlaces = createRelevantPlacesArray();

  for (let place of relevantPlaces) {
    let requestedResult: SeasonResult[] = seasonResultsRaw.filter((result: SeasonResult) => result.place == place);
    if (requestedResult.length > 0)
      postprocessedResults.push(requestedResult[0])
    else 
      postprocessedResults.push(makeUnknownSeasonResult(season, place));
  }

  return postprocessedResults;
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
    teamIdAway: -1,
    goalsHome: -1,
    goalsAway: -1
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

function makeUnknownSeasonBet(season: number, place: number, userId: string): SeasonBet {
  return {
    documentId: "",
    season: season,
    userId: userId,
    isFixed: false,
    place: place,
    teamId: -1
  };
}

function makeUnknownSeasonResult(season: number, place: number): SeasonResult {
  return {
    documentId: "",
    season: season,
    place: place,
    teamId: -1
  }
}

function createRelevantPlacesArray(): number[] {
  const relevantFirstPlaces: number[] = Array.from(
    {length: RELEVANT_FIRST_PLACES_COUNT}, 
    (_, i) => i + 1);

  const relevantLastPlaces: number[] = Array.from(
    {length: RELEVANT_LAST_PLACES_COUNT}, 
    (_, i) => -(RELEVANT_LAST_PLACES_COUNT - i));
  
  return relevantFirstPlaces.concat(relevantLastPlaces);
}