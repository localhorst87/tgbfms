import axios from 'axios';
import { MatchImportData, TeamRankingImportData } from "./import_datastructures";
import * as helper from "./matchdata_helpers";

const URL_TRUNK_MATCHES: string = "https://api.openligadb.de/getmatchdata/bl1";
const URL_TRUNK_RANKING: string = "https://api.openligadb.de/getbltable/bl1";
const URL_TRUNK_UPDATETIME: string = "https://api.openligadb.de/getlastchangedate/bl1";

/**
 * Fetches the time when the data of the season/matchday was changed the last
 * time in openligadb, and returns it as a Promise.
 * Resolves to the time of a unix timestamp in seconds.
 * Resolves to -1, if results status is not 200 or requested data is not available
 *
 * @param {number} season
 * @param {number} matchday
 * @return {Promise<number>} unix timestamp in seconds of last matchday update time
 */
export function getLastUpdateTime(season: number, matchday: number): Promise<number> {
  let fullUrl: string = URL_TRUNK_UPDATETIME + "/" + String(season) + "/" + String(matchday);

  return axios.get(fullUrl, { responseType: "json" })
    .then((res: any) => {
      if (res.status == 200 || res.status == 202) {
        let timestamp: number = helper.convertUpdateTime(res.data);
        return Math.max(-1, timestamp); // non existing data will return date string "0001-01-01T00:00:00"
      }
      else {
        return -1;
      }
    })
    .catch((err: any) => {
      return -1;
    });
}

/**
 * Fetches the data of the given season and matchday and extracts the required
 * information to MatchImportData within a Promise.
 * Resolves to [], if results status is not 200 or data is not available
 *
 * @param {number} season
 * @param {number} matchday
 * @return {Promise<MatchImportData[]>} imported match data of the matchday as an Array
 */
export function importMatchdata(season: number, matchday: number): Promise<MatchImportData[]> {
  let fullUrl: string = URL_TRUNK_MATCHES + "/" + String(season) + "/" + String(matchday);

  return axios.get(fullUrl, { responseType: "json" })
    .then((res: any) => {
      if (res.status == 200) {
        return helper.convertMatchdayJson(res.data, season);
      }
      else {
        return [];
      }
    })
    .catch((err: any) => {
      return [];
    });
}

export function importCurrentTeamRanking(season: number): Promise<TeamRankingImportData[]> {
  let fullUrl: string = URL_TRUNK_RANKING + "/" + String(season);

  return axios.get(fullUrl, { responseType: "json" })
  .then((res: any) => {
    if (res.status == 200) {
      return helper.convertRankingJson(res.data);
    }
    else {
      return [];
    }
  })
  .catch((err: any) => {
    return [];
  });
  
}
