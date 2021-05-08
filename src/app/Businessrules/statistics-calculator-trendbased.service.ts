import { Injectable } from '@angular/core';
import { StatisticsCalculatorService } from './statistics-calculator.service';
import { Bet, Result, Match, Score } from './basic_datastructures';
import { PointCalculatorService } from './point-calculator.service';


@Injectable()
export class StatisticsCalculatorTrendbasedService implements StatisticsCalculatorService {
  constructor(private pointCalculator: PointCalculatorService) { }

  getScoreArray(matchArray: Match[], betArray: Bet[], resultArray: Result[], offset: Score[] = []): Score[] {
    // calculates all scores from the given bets, results and score offsets
    // for the matches given in the matchArray

    let scores: Score[] = [];

    let availableUsers: string[] = this.identifyUsers(betArray, offset);

    for (let userId of availableUsers) {
      let scoreUser: Score = this.initScore(userId, offset);

      for (let match of matchArray) {
        let betUser: Bet = this.extractBet(betArray, match.matchId, userId);
        let allMatchBets: Bet[] = betArray.filter(bet => bet.matchId == match.matchId);
        let result: Result = this.extractResult(resultArray, match.matchId);
        let matchScore: Score = this.pointCalculator.calcSingleMatchScore(userId, allMatchBets, result, match);

        scoreUser.points += matchScore.points;
        scoreUser.matches += matchScore.matches;
        scoreUser.results += matchScore.results;
        scoreUser.extraTop += matchScore.extraTop;
        scoreUser.extraOutsider += matchScore.extraOutsider;
        scoreUser.extraSeason += matchScore.extraSeason;
      }

      scores.push(scoreUser);
    }

    return scores.sort(this.compareScores);
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

  private identifyUsers(betArray: Bet[], offset: Score[]): string[] {
    // identifies all the users whose bets are present in betArray and returns
    // an array of unique user IDs

    let usersBet: string[] = betArray.map(bet => bet.userId); // filters user IDs
    let usersTable: string[] = offset.map(score => score.userId);
    let usersUnion: string[] = usersBet.concat(usersTable); // combines both userId arrays
    let uniqueUsers: string[] = usersUnion.filter((val, idx, arr) => arr.indexOf(val) === idx); // makes IDs unique

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
