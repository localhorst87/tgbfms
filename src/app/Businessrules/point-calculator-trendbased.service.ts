import { Injectable } from '@angular/core';
import { PointCalculatorService } from './point-calculator.service';
import { Bet, Match, Score, SeasonBet, SeasonResult } from './basic_datastructures';
import {
  POINTS_TENDENCY, POINTS_ADDED_RESULT, FACTOR_TOP_MATCH,
  POINTS_ADDED_OUTSIDER_TWO, POINTS_ADDED_OUTSIDER_ONE, POINTS_SEASON_FIRST_EXACT,
  POINTS_SEASON_SECOND_EXACT, POINTS_SEASON_LOSER_EXACT, POINTS_SEASON_LOSER_CORRECT
} from './rule_defined_values';

@Injectable()
export class PointCalculatorTrendbasedService implements PointCalculatorService {

  constructor() { }

  calcSingleMatchScore(userId: string, betsAllUsers: Bet[], match: Match): Score {
    // calculates the points of the user with the given user id for the specific match

    let score: Score = { userId: userId, points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };
    let betUser: Bet = { documentId: "", matchId: -1, userId: "", isFixed: false, goalsHome: -1, goalsAway: -1 };

    for (let bet of betsAllUsers) {
      if (userId == bet.userId) {
        betUser = bet;
        break;
      }
    }

    if (betUser.matchId != match.matchId) {
      return score;
    }

    if (this.isTendencyCorrect(betUser, match)) {
      score.matches += 1;
      score.points += POINTS_TENDENCY;
    }
    if (this.isResultCorrect(betUser, match)) {
      score.results += 1;
      score.points += POINTS_ADDED_RESULT;
    }
    if (match.isTopMatch) {
      score.extraTop += score.points * (FACTOR_TOP_MATCH - 1);
      score.points *= FACTOR_TOP_MATCH;
    }
    if (score.points > 0) {
      let extraOutsider: number = this.getPotentialOutsiderPoints(betsAllUsers, betUser);
      score.extraOutsider += extraOutsider;
      score.points += extraOutsider;
    }

    return score;
  }

  countTendencies(betArray: Bet[]): number[] {
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

  calcSingleSeasonScore(seasonBets: SeasonBet[], seasonResults: SeasonResult[]): Score {
    // calculates the season points according to the given bets and results

    let userId: string = seasonBets.length > 0 ? seasonBets[0].userId : "";
    let score: Score = { userId: userId, points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };

    let relegatorResults: SeasonResult[] = this.getRelegatorResults(seasonResults);

    for (let bet of seasonBets) {

      if (bet.teamId == -1) {
        continue;
      }

      let assocResult: SeasonResult = this.getSeasonResultFromArray(bet.place, seasonResults);

      if (bet.teamId == assocResult.teamId) {
        if (bet.place == 1) {
          score.points += POINTS_SEASON_FIRST_EXACT;
        }
        else if (bet.place == 2) {
          score.points += POINTS_SEASON_SECOND_EXACT;
        }
        else { // bet.place < 0 (-> relegators)
          score.points += POINTS_SEASON_LOSER_EXACT;
        }
      }
      else if (bet.place < 0) { // implicitly bet.teamId != assocResult.teamId (!)
        for (let res of relegatorResults) {
          if (bet.teamId == res.teamId) {
            score.points += POINTS_SEASON_LOSER_CORRECT;
          }
        }
      }

    }

    score.extraSeason = score.points;

    return score;
  }

  getPotentialOutsiderPoints(betArray: Bet[], betUser: Bet): number {
    // returns the potentially (!) added points for outsider bets (two or only one
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

  isTendencyCorrect(bet: Bet, match: Match): boolean {
    // returns true if the tendency of bet and result are the same

    if (!this.isAvailable(bet) || !this.isAvailable(match)) { // bet or result not set !
      return false;
    }
    else {
      return this.getTendency(bet) == this.getTendency(match);
    }
  }

  private isResultCorrect(bet: Bet, match: Match): boolean {
    // returns true if the results of bet and result are the same

    if (!this.isAvailable(bet) || !this.isAvailable(match)) { // bet or result not set !
      return false;
    }
    else {
      return bet.goalsHome == match.goalsHome && bet.goalsAway == match.goalsAway;
    }
  }

  private getTendency(betOrMatch: any): number {
    // returns the tendeny of the bet or result:
    // 1 in case of home wins, 0 in case of draw, 2 in case of away wins.
    // if no goals set (goalsHome == goalsAway == -1) -1 is returned
    // betOrMatch must fulfill the number properties goalsHome and goalsAway

    if (!this.isAvailable(betOrMatch)) { // no result available
      return -1;
    }

    if (betOrMatch.goalsHome > betOrMatch.goalsAway) { // home win
      return 1;
    }
    else if (betOrMatch.goalsHome < betOrMatch.goalsAway) { // away win
      return 2;
    }
    else { // draw
      return 0;
    }
  }

  private isAvailable(betOrMatch: any): boolean {
    // checks if bet or result is available (goals set)
    // betOrMatch must fulfill the number properties goalsHome and goalsAway

    if (betOrMatch.goalsHome > -1 && betOrMatch.goalsAway > -1) { // result available
      return true;
    }
    else {
      return false;
    }
  }

  private getSeasonResultFromArray(place: number, seasonResults: SeasonResult[]): SeasonResult {
    // returns the result from the array with the given place.
    // If the result is not available in the array, a dummy value will be returned.

    let resultToReturn: SeasonResult = { // dummy, if target not available
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

  private getRelegatorResults(results: SeasonResult[]): SeasonResult[] {
    // returns all the places of available season results as array

    let relegators: SeasonResult[] = [];

    for (let res of results) {
      if (res.place < 0) {
        relegators.push(res);
      }
    }

    return relegators;
  }

}
