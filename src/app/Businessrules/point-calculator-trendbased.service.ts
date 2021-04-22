import { Injectable } from '@angular/core';
import { PointCalculatorService } from './point-calculator.service';
import { BetExtended, ResultExtended, SeasonBetExtended, SeasonResultExtended } from '../Dataaccess/database_datastructures';

export const POINTS_TENDENCY: number = 1; // points if the tendency is correct
export const POINTS_ADDED_RESULT: number = 1; // added points if the result is correct
export const FACTOR_TOP_MATCH: number = 2; // raw points are multiplicated in case of top match
export const POINTS_ADDED_OUTSIDER_TWO: number = 1; // points added if only two users bet on a specific tendency
export const POINTS_ADDED_OUTSIDER_ONE: number = 2; // points added if only one user bet on a specific tendency
export const POINTS_SEASON_FIRST_EXACT: number = 3; // points if the 1st place bet is correct
export const POINTS_SEASON_SECOND_EXACT: number = 2; // points if the 2nd place bet is correct
export const POINTS_SEASON_LOSER_EXACT: number = 2; // points if a relegator bet is exactly correct
export const POINTS_SEASON_LOSER_CORRECT: number = 1; // points if the relegator bet is among results, but not exactly

@Injectable()
export class PointCalculatorTrendbasedService implements PointCalculatorService {

  constructor() { }

  getMatchPoints(userId: string, betsAllUsers: BetExtended[], result: ResultExtended, isTopMatch: boolean): number {
    // calculates the points of the user with the given user id for the specific match

    let points: number = 0;
    let betUser: BetExtended = { documentId: "", matchId: -1, userId: "", isFixed: false, goalsHome: -1, goalsAway: -1 };

    for (let bet of betsAllUsers) {
      if (userId == bet.userId) {
        betUser = bet;
        break;
      }
    }

    points += this.getTendencyPoints(betUser, result);
    points += this.getAddedResultPoints(betUser, result);
    if (isTopMatch) { points *= FACTOR_TOP_MATCH; }
    if (points > 0) { points += this.getAddedOutsiderPoints(betsAllUsers, betUser); }

    return points;
  }

  countTendencies(betArray: BetExtended[]): number[] {
    // counts the tendencies by examining all bets, given in betArray
    // return an array with the following convention [nDraw, nHome, nAway]

    let tendencyCount: number[] = [0, 0, 0]; // [draw, home, away]

    for (let bet of betArray) {
      let tendency: number = this.getTendency(bet);
      if (tendency != -1) {
        tendencyCount[tendency]++;
      }
    }

    return tendencyCount;
  }

  getSeasonPoints(seasonBets: SeasonBetExtended[], seasonResults: SeasonResultExtended[]): number {
    // calculates the season points according to the given bets and results

    let points: number = 0;
    let relegatorResults: SeasonResultExtended[] = this.getRelegatorResults(seasonResults);

    for (let bet of seasonBets) {

      if (bet.teamId == -1) {
        continue;
      }

      let assocResult: SeasonResultExtended = this.getSeasonResultFromArray(bet.place, seasonResults);

      if (bet.teamId == assocResult.teamId) {
        if (bet.place == 1) {
          points += POINTS_SEASON_FIRST_EXACT;
        }
        else if (bet.place == 2) {
          points += POINTS_SEASON_SECOND_EXACT;
        }
        else { // bet.place < 0 (-> relegators)
          points += POINTS_SEASON_LOSER_EXACT;
        }
      }
      else if (bet.place < 0) { // implicitly bet.teamId != assocResult.teamId (!)
        for (let res of relegatorResults) {
          if (bet.teamId == res.teamId) {
            points += POINTS_SEASON_LOSER_CORRECT;
          }
        }
      }

    }

    return points;
  }

  private getTendencyPoints(bet: BetExtended, result: ResultExtended): number {
    // returns the raw tendency points if bet and result tendency are equal, else 0

    if (!this.isAvailable(bet) || !this.isAvailable(result)) { // bet or result not set !
      return 0;
    }

    if (this.getTendency(bet) == this.getTendency(result)) {
      return POINTS_TENDENCY;
    }
    else {
      return 0;
    }
  }

  private getAddedResultPoints(bet: BetExtended, result: ResultExtended): number {
    // returns the added result points if the bet and result are totally equal

    if (!this.isAvailable(bet) || !this.isAvailable(result)) {
      return 0;
    }

    if (bet.goalsHome == result.goalsHome && bet.goalsAway == result.goalsAway) {
      return POINTS_ADDED_RESULT;
    }
    else {
      return 0;
    }
  }

  private getAddedOutsiderPoints(betArray: BetExtended[], betUser: BetExtended): number {
    // returns the potential added points for outsider bets (two or only one
    // user per tendency) for the given bet of the user

    let nTendency: number[] = this.countTendencies(betArray);
    let tendencyUser = this.getTendency(betUser);

    if (tendencyUser == -1) {
      return 0;
    }

    if (nTendency[tendencyUser] == 2) { // only 1 other user has set this bet
      return POINTS_ADDED_OUTSIDER_TWO;
    }
    else if (nTendency[tendencyUser] == 1) { // users bet is unique
      return POINTS_ADDED_OUTSIDER_ONE;
    }
    else {
      return 0;
    }
  }

  private getTendency(betOrResult: any): number {
    // returns the tendeny of the bet or result:
    // 1 in case of home wins, 0 in case of draw, 2 in case of away wins.
    // if no goals set (goalsHome == goalsAway == -1) -1 is returned
    // betOrResult must fulfill the number properties goalsHome and goalsAway

    if (!this.isAvailable(betOrResult)) { // no result available
      return -1;
    }

    if (betOrResult.goalsHome > betOrResult.goalsAway) { // home win
      return 1;
    }
    else if (betOrResult.goalsHome < betOrResult.goalsAway) { // away win
      return 2;
    }
    else { // draw
      return 0;
    }
  }

  private isAvailable(betOrResult: any): boolean {
    // checks if bet or result is available (goals set)
    // betOrResult must fulfill the number properties goalsHome and goalsAway

    if (betOrResult.goalsHome > -1 && betOrResult.goalsAway > -1) { // result available
      return true;
    }
    else {
      return false;
    }
  }

  private getSeasonResultFromArray(place: number, seasonResults: SeasonResultExtended[]): SeasonResultExtended {
    // returns the result from the array with the given place.
    // If the result is not available in the array, a dummy value will be returned.

    let resultToReturn: SeasonResultExtended = { // dummy, if target not available
      documentId: "",
      season: -1,
      place: place,
      teamId: -1
    };

    for (let result of seasonResults) {
      if (result.place == place) {
        resultToReturn = result;
        break;
      }
    }

    return resultToReturn;
  }

  private getRelegatorResults(results: SeasonResultExtended[]): SeasonResultExtended[] {
    // returns all the places of available season results as array

    let relegators: SeasonResultExtended[] = [];

    for (let res of results) {
      if (res.place < 0) {
        relegators.push(res);
      }
    }

    return relegators;
  }

}
