import {Match} from "../business_rules/basic_datastructures";
import {MatchImportData}
  from "../data_access/import_datastructures";
import {MATCHDAYS_PER_SEASON, NUMBER_OF_TEAMS}
  from "../business_rules/rule_defined_values";
import * as appdata from "../data_access/appdata_access";
import * as util from "../util";

declare global {
    interface Array<T> {
      unique(): Array<T>;
    }
  }
  
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

export class MatchList {

    static MATCHES_PER_DAY: number = Math.floor(NUMBER_OF_TEAMS / 2);
    static MATCHDAYS_PER_SEASON: number = MATCHDAYS_PER_SEASON; // copied for being able to be stubbed for testing
    private _season: number;
    private _matches: Match[];
  
    /**
     * @constructor
     * @param {number} season The season where to request matches for
     *                        (e.g. 2021 for the season 2021/2022)
     */
    constructor(season: number) {
      this._season = season;
      this._matches = [];
    }
  
    /**
     * @param {number} newSeason The season where to request matches for
     *                           (e.g. 2021 for the season 2021/2022)
     */
    set season(newSeason: number) {
      if (this._season == newSeason)
        return;
      else {
        this._season = newSeason;
        this._matches = [];
      }
    }
  
    /**
     * @return {number} The season where to request matches for
     */
    get season(): number {
      return this._season;
    }
  
    /**
     * @return {Match[]} The list of the matches of the season
     */
    get matches(): Match[] {
      return this._matches;
    }
  
    /**
     * Fills the matches array with all the matches of the selected season
     *
     * @public
     */
    async fillMatchList(): Promise<void> {
      return appdata.getAllMatches(this._season).then(
        (matches: Match[]) => {
          this._matches = matches;
        })
        .catch((err: any) => {
          this._matches = [];
        });
    }
  
    updateMatches(matches: Match[]): void {
      for (let updatedMatch of matches) {
        let idx: number = this._matches.findIndex(match => match.documentId == updatedMatch.documentId);
        this._matches.splice(idx, 1, updatedMatch);
      }
  
      return;
    }
  
    /**
     * Extracts all pending matchdays from the matches list. That is: All
     * matchdays that haven't been completely finished so far
     *
     * @public
     * @return {number[]} all pending matchdays
     */
    getPendingMatchdays(): number[] {
      let pendingMatchdays: number[] = [];
  
      for (let i = 1; i <= MatchList.MATCHDAYS_PER_SEASON; i++) {
        const pendingCondition = (match: Match) => (match.matchday == i && match.isFinished == false);
        let isMatchdayPending: boolean = this._matches.some(pendingCondition);
  
        if (isMatchdayPending)
          pendingMatchdays.push(i);
      }
  
      return pendingMatchdays;
    }
  
    /**
     * Extracts all incomplete matchdays from the matches list. That is: All
     * matchdays that do not contain the expected number of matches
     *
     * @public
     * @return {number[]} all pending matchdays
     */
    getIncompleteMatchdays(): number[] {
      let incompleteMatchdays: number[] = [];
  
      for (let i = 1; i <= MatchList.MATCHDAYS_PER_SEASON; i++) {
        const filterCondition = (match: Match) => (match.matchday == i);
        let isMatchdayIncomplete: boolean = this._matches.filter(filterCondition).length < MatchList.MATCHES_PER_DAY;
  
        if (isMatchdayIncomplete)
          incompleteMatchdays.push(i);
      }
  
      return incompleteMatchdays;
    }
  
    /**
     * Extracts the Matches that begin within the next given days.
     * days = 0 means the same day, days = 1 means the same day and tomorrow
     *
     * @public
     * @param {number} days The next complete days to consider
     * @return {Match[]} all pending matchdays
     */
    getNextMatches(days: number): Match[] {
      let startTimestamp = util.getCurrentTimestamp();
      let endTimestamp = util.getFutureEndDate(days);
      const filterCondition = (match: Match) => (match.timestamp <= endTimestamp && match.timestamp > startTimestamp);
  
      return this._matches.filter(filterCondition);
    }
  
  }
  
  /**
   * Converts MatchImportData from the reference data to a Match
   *
   * @param {MatchImportData} importedData The imported match that shall be converted
   * @param {Match} matchAppData The corresponding match from the App DB
   * @return {Match} converted Match
   */
  export function convertToMatch(importedData: MatchImportData, matchAppData: Match): Match {
    return {
      documentId: matchAppData.documentId,
      season: importedData.season,
      matchday: importedData.matchday,
      matchId: importedData.matchId,
      timestamp: new Date(importedData.datetime).getTime() / 1000,
      isFinished: importedData.isFinished,
      isTopMatch: matchAppData.isTopMatch,
      teamIdHome: importedData.teamIdHome,
      teamIdAway: importedData.teamIdAway,
      goalsHome: importedData.goalsHome,
      goalsAway: importedData.goalsAway
    };
  }
  
  /**
   * Checks if two matches contain the same data, except the documentId
   *
   * @param {Match} match1 first match to compare
   * @param {Match} match2 other match to compare
   * @return {boolean} true/false if equal/not equal
   */
  export function isMatchEqual(match1: Match, match2: Match): boolean {
    return (match1.season == match2.season &&
      match1.matchday == match2.matchday &&
      match1.matchId == match2.matchId &&
      match1.timestamp == match2.timestamp &&
      match1.isFinished == match2.isFinished &&
      match1.isTopMatch == match2.isTopMatch &&
      match1.teamIdHome == match2.teamIdHome &&
      match1.teamIdAway == match2.teamIdAway &&
      match1.goalsHome == match2.goalsHome &&
      match1.goalsAway == match2.goalsAway);
  }