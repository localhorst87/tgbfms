import { Injectable } from '@angular/core';
import { StatisticsCalculatorService } from './statistics-calculator.service';
import { Bet, Result, Match, Score, SeasonBet, SeasonResult } from './basic_datastructures';
import { PointCalculatorService } from './point-calculator.service';


@Injectable()
export class StatisticsCalculatorTrendbasedService implements StatisticsCalculatorService {
  constructor(private pointCalculator: PointCalculatorService) { }

  getScoreArray(matchArray: Match[], betArray: Bet[], resultArray: Result[], offset: Score[] = []): Score[] {
    // calculates all scores from the given bets, results and score offsets
    // for the matches given in the matchArray, sorted by user id

    let scores: Score[] = [];

    let availableUsers: string[] = this.identifyUsers(betArray, offset);

    for (let userId of availableUsers) {
      let scoreUser: Score = this.initScore(userId, offset);

      for (let match of matchArray) {
        let betUser: Bet = this.extractBet(betArray, match.matchId, userId);
        let allMatchBets: Bet[] = betArray.filter(bet => bet.matchId == match.matchId);
        let result: Result = this.extractResult(resultArray, match.matchId);
        let matchScore: Score = this.pointCalculator.calcSingleMatchScore(userId, allMatchBets, result, match);
        scoreUser = this.addScores(scoreUser, matchScore);
      }

      scores.push(scoreUser);
    }

    return scores;
  }

  getSeasonScoreArray(betArray: SeasonBet[], resultArray: SeasonResult[], offset: Score[] = []): Score[] {
    // calculates all scores of the given bets and results, sorted by user id

    let scores: Score[] = [];

    let availableUsers: string[] = this.identifyUsers(betArray, offset);

    for (let userId of availableUsers) {
      let scoreUser: Score = this.initScore(userId, offset);
      let betArrayUser: SeasonBet[] = betArray.filter(bet => bet.userId == userId);
      let seasonScore = this.pointCalculator.calcSingleSeasonScore(betArrayUser, resultArray);

      scoreUser = this.addScores(scoreUser, seasonScore);
      scores.push(scoreUser);
    }

    return scores;
  }

  compareScores(firstEl: Score, secondEl: Score): number {
    // used as sorting function to sort table according to business rules

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
    let places: number[] = [1];
    let scoresSorted: Score[] = scores.sort(compareFcn);

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

  private initScore(userId: string, offset: Score[]): Score {
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

  private extractBet(betArray: Bet[], matchId: number, userId: string): Bet {
    // extracts the Bet with the given matchId and userId from betArray.
    // If the conditions are not met, a default value will be returned

    let idx: number = betArray.findIndex(bet => bet.matchId == matchId && bet.userId == userId);

    if (idx >= 0) {
      return betArray[idx];
    }
    else {
      return {
        documentId: "",
        matchId: matchId,
        userId: userId,
        isFixed: false,
        goalsHome: -1,
        goalsAway: -1
      };
    }
  }

  private extractResult(resultArray: Result[], matchId: number): Result {
    // extracts the Result with the given matchId from resultArray.
    // If the conditions are not met, a default value will be returned

    let idx: number = resultArray.findIndex(result => result.matchId == matchId);

    if (idx >= 0) {
      return resultArray[idx];
    }
    else {
      return {
        documentId: "",
        matchId: matchId,
        goalsHome: -1,
        goalsAway: -1
      };
    }
  }
}
