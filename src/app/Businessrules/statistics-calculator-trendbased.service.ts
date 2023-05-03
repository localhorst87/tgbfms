import { Injectable } from '@angular/core';
import { StatisticsCalculatorService } from './statistics-calculator.service';
import { Bet, Match, Score, SeasonBet, SeasonResult } from './basic_datastructures';
import { PointCalculatorService } from './point-calculator.service';

const WEIGHT_RELATIVE_TO_OPP: number = 0.67; // weight for points relative to opponents
const WEIGHT_RELATIVE_TO_REF: number = 0.33; // weight for points relative to point reference
const POINT_REFERENCE: number = 6; // a chosen mean point reference

@Injectable()
export class StatisticsCalculatorTrendbasedService implements StatisticsCalculatorService {
  constructor(private pointCalculator: PointCalculatorService) { }

  getScoreArray(matchArray: Match[], betArray: Bet[]): Score[] {
    // calculates all scores from the given bets, results for the matches given
    // in the matchArray, returns the Score sorted alphabetically by userId

    let scores: Score[] = [];
    let availableUsers: string[] = this.identifyUsers(betArray);

    for (let userId of availableUsers) {
      let scoreUser: Score = this.initScore(userId);

      for (let match of matchArray) {
        let allMatchBets: Bet[] = betArray.filter(bet => bet.matchId == match.matchId);
        let matchScore: Score = this.pointCalculator.calcSingleMatchScore(userId, allMatchBets, match);
        scoreUser = this.addScores(scoreUser, matchScore);
      }

      scores.push(scoreUser);
    }

    return scores;
  }

  getSeasonScoreArray(betArray: SeasonBet[], resultArray: SeasonResult[]): Score[] {
    // calculates all scores of the given bets and results, sorted by user id

    let scores: Score[] = [];
    let availableUsers: string[] = this.identifyUsers(betArray);

    for (let userId of availableUsers) {
      let scoreUser: Score = this.initScore(userId);
      let betArrayUser: SeasonBet[] = betArray.filter(bet => bet.userId == userId);
      let seasonScore = this.pointCalculator.calcSingleSeasonScore(betArrayUser, resultArray);

      scoreUser = this.addScores(scoreUser, seasonScore);
      scores.push(scoreUser);
    }

    return scores;
  }

  compareScores(firstEl: any, secondEl: any): number {
    // used as sorting function to sort table according to business rules
    // elements must fulfill properties "points", "matches" and "results"

    if (firstEl.points != secondEl.points) {
      return secondEl.points - firstEl.points;
    }
    else if (firstEl.matches != secondEl.matches) {
      return secondEl.matches - firstEl.matches;
    }
    else if (firstEl.results != secondEl.results) {
      return secondEl.results - firstEl.results;
    }
    else {
      return 0;
    }
  }

  makePositions(scores: Score[], compareFcn: (arg0: Score, arg1: Score) => number): number[] {
    // returns the position array of the sorted scores array according to the
    // given compare function compareFcn
    let places: number[] = [];

    if (scores.length > 0) {
      scores = scores.sort(compareFcn);
      places.push(1);
    }

    for (let i = 0; i < scores.length - 1; i++) {
      let newPlace: number;

      if (compareFcn(scores[i], scores[i + 1]) == 0) {
        newPlace = places[i];
      }
      else {
        newPlace = i + 1 + places[0];
      }

      places.push(newPlace);
    }

    return places;
  }

  addScores(score1: Score, score2: Score): Score {
    // adds two score structures
    // if the source are from different users, the user name will be taken
    // from the first score structure

    score1.points += score2.points;
    score1.matches += score2.matches;
    score1.results += score2.results;
    score1.extraTop += score2.extraTop;
    score1.extraOutsider += score2.extraOutsider;
    score1.extraSeason += score2.extraSeason;

    return score1;
  }

  addScoreArrays(scoreArray: Score[], ...furtherScoreArrays: Score[][]): Score[] {
    // adds all the Score elements given in the scoreArray and furtherScoreArrays
    // returns the Scores alphabetically according to the userId

    let scores: Score[] = [];
    let availableUsers: string[] = this.identifyUsers(scoreArray, ...furtherScoreArrays);

    for (let userId of availableUsers) {
      let scoreUser: Score = this.initScore(userId, scoreArray);

      for (let scoreArrayToAdd of furtherScoreArrays) {
        let scoreToAdd: Score = this.extractScore(scoreArrayToAdd, userId);
        scoreUser = this.addScores(scoreUser, scoreToAdd);
      }

      scores.push(scoreUser);
    }

    return scores;
  }

  calculateForm(pointsUser: number[], pointsOpponents: number[][], weights: number[]) {
    // calculates the current form of a user, according to given point array and point
    // array of the opponents

    let weightedAvgRel: number = 0;
    let weightedAvgAbs: number = 0;

    // weighted average is being calculated from a fraction relative to opponents points
    // and a fraction relative to an absolute point reference
    // the weights given as the functional argument is weighting the matchdays in time progression
    for (let i in pointsUser) {
      let pointsSumOpponents: number = pointsOpponents[i].reduce((a, b) => a + b, 0);
      let pointsMeanOpponents: number = pointsSumOpponents / pointsOpponents[i].length;
      weightedAvgRel += weights[i] * pointsUser[i] / pointsMeanOpponents;
      weightedAvgAbs += weights[i] * pointsUser[i] / POINT_REFERENCE;
    }

    if (weightedAvgRel == 0) { // in case of no points directly return -10
      return -10;
    }

    let weightsSum: number = weights.reduce((a, b) => a + b, 0);
    weightedAvgRel /= weightsSum;
    weightedAvgAbs /= weightsSum;

    let normedValueRel: number = 10 * Math.tanh(2.5 * (weightedAvgRel - 1)); // norm from -10 to +10
    let normedValueAbs: number = 10 * Math.tanh(2.5 * (weightedAvgAbs - 1));
    let weightedForm: number = WEIGHT_RELATIVE_TO_OPP * normedValueRel + WEIGHT_RELATIVE_TO_REF * normedValueAbs;

    return Math.round(weightedForm * 10) / 10; // round to 1 decimal
  }

  private identifyUsers(inputArray: any[], ...furtherArrays: any[]): string[] {
    // identifies all unique user IDs that are present in objects of inputArray
    // and furtherArrays, and sorts them by userId.
    // the objects in inputArray and furtherArrays must fulfill a string property
    // called userId!

    let users: string[] = inputArray.map((el: any) => el.userId); // filters user IDs
    for (let anotherArray of furtherArrays) {
      users = users.concat(anotherArray.map((el: any) => el.userId)); // concats user IDs
    }
    let uniqueUsers: string[] = users.filter((val, idx, arr) => arr.indexOf(val) === idx); // makes IDs unique

    return uniqueUsers.sort();
  }

  private initScore(userId: string, offset: Score[] = []): Score {
    // returns the Score from the offset table. If the userId is not
    // available in the offset, or the offset table is empty, a zero point
    // Score will be emitted

    let idx: number = offset.findIndex(score => score.userId == userId);

    if (idx >= 0) {
      return offset[idx];
    }
    else {
      return {
        userId: userId,
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      };
    }
  }

  private extractScore(scoreArray: Score[], userId: string): Score {
    // extracts the Score with the given userId from scoreArray.
    // If the conditions are not met, a default zero value will be returned

    let idx: number = scoreArray.findIndex(score => score.userId == userId);

    if (idx >= 0) {
      return scoreArray[idx];
    }
    else {
      return {
        userId: userId,
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      };
    }

  }
}
