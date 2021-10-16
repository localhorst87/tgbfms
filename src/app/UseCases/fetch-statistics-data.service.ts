import { Injectable } from '@angular/core';
import { Observable, from, of, combineLatest } from 'rxjs';
import { concatMap, reduce, toArray, tap } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { StatisticsCalculatorService } from '../Businessrules/statistics-calculator.service';
import { MatchdayScoreSnapshot } from '../Dataaccess/import_datastructures';

const N_MATCHDAYS_TO_INCLUDE: number = 3;
const WEIGHTING_FACTOR: number = 1.413;

@Injectable({
  providedIn: 'root'
})
export class FetchStatisticsDataService {

  constructor(private appData: AppdataAccessService, private statCalc: StatisticsCalculatorService) { }

  public fetchFormByUserId$(season: number, completedMatchday: number, userId: string): Observable<number> {
    // returns the current form of the user

    if (completedMatchday == 0) {
      return of(0);
    }

    let matchdays: number[] = this.getMatchdayArray(completedMatchday);
    let weights: number[] = this.getWeights(matchdays.length);

    let pointsUser: number[] = [];
    let pointsOpponents: number[][] = [];

    let scoreSnapshots$: Observable<MatchdayScoreSnapshot> = from(matchdays).pipe(
      concatMap((matchday: number) => this.appData.getMatchdayScoreSnapshot$(season, matchday))
    );

    let userPoints$: Observable<number[]> = scoreSnapshots$.pipe(
      concatMap((scoreSnapshot: MatchdayScoreSnapshot) => this.getUserPoints$(scoreSnapshot, userId)),
      toArray()
    );

    let opponentPoints$: Observable<number[][]> = scoreSnapshots$.pipe(
      concatMap((scoreSnapshot: MatchdayScoreSnapshot) => this.getOpponentsPoints$(scoreSnapshot, userId)),
      toArray()
    );

    return combineLatest(userPoints$, opponentPoints$,
      (pointsUser: number[], pointsOpponents: number[][]) => {
        return this.statCalc.calculateForm(pointsUser, pointsOpponents, weights);
      }
    );
  }

  private getUserPoints$(scoreSnapshot: MatchdayScoreSnapshot, userId: string): Observable<number> {
    // extracts points of user from MatchdayScoreSnapshot and returns an Observable

    let userIdx: number = scoreSnapshot.userId.findIndex(el => el == userId);
    return of(scoreSnapshot.points[userIdx]);
  }

  private getOpponentsPoints$(scoreSnapshot: MatchdayScoreSnapshot, userId: string): Observable<number[]> {
    // extracts opponent points from MatchdayScoreSnapshot and return an Observable

    let userIdx: number = scoreSnapshot.userId.findIndex(el => el == userId);
    let nEntries: number = scoreSnapshot.userId.length;
    let pointsOpponentsMatchday: number[] = [];

    for (let i = 0; i < nEntries; i++) {
      if (i != userIdx) {
        pointsOpponentsMatchday.push(scoreSnapshot.points[i])
      }
    }

    return of(pointsOpponentsMatchday);
  }

  private getWeights(nWeights: number): number[] {
    // returns the weights array according to the given number of weight factors
    // and the weighting factor constant

    let weights: number[] = []
    let weightsEl: number = 1;

    for (let i = 0; i < nWeights; i++) {
      weights.push(weightsEl);
      weightsEl *= WEIGHTING_FACTOR;
    }

    let weightsSum = weights.reduce((a, b) => a + b, 0);
    return Array.from(weights, el => el / weightsSum); // norms the array sum to 1
  }

  private getMatchdayArray(currentMatchday: number): number[] {
    // return the matchdayArray according to the current matchday and the given
    // number of matchdays to consider

    let matchdayArray = [];
    let startMatchday: number = Math.max(currentMatchday - N_MATCHDAYS_TO_INCLUDE + 1, 1);

    for (let i = startMatchday; i <= currentMatchday; i++) {
      matchdayArray.push(i);
    }

    return matchdayArray;
  }
}
