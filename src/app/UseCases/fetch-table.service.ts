import { Injectable } from '@angular/core';
import { Observable, of, from, iif, combineLatest, range, concat } from 'rxjs';
import { map, concatMap, toArray, reduce, pluck, defaultIfEmpty } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { StatisticsCalculatorService } from '../Businessrules/statistics-calculator.service';
import { Score, SeasonBet, SeasonResult, User } from '../Businessrules/basic_datastructures';
import { MatchdayScoreSnapshot } from '../Dataaccess/import_datastructures';
import { TableData } from './output_datastructures';
import { RELEVANT_FIRST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT } from '../Businessrules/rule_defined_values';

@Injectable({
  providedIn: 'root'
})
export class FetchTableService {

  relevantPlaces$: Observable<number>;

  constructor(private appData: AppdataAccessService, private statisticsCalculator: StatisticsCalculatorService) {
    this.relevantPlaces$ = concat(
      range(1, RELEVANT_FIRST_PLACES_COUNT),
      range(-RELEVANT_LAST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT)
    );
  }

  public fetchTableByMatchdays$(season: number, matchdays: number[], includeSeasonBets: boolean = false): Observable<TableData> {
    // fetches TableData according to the given season and the given matchdays
    // if includeSeasonBets is set to true, the points from the SeasonBets will be
    // included in the calculation (according to the current team ranking)

    let matchdaysScore$: Observable<Score[]> = from(matchdays).pipe(
      defaultIfEmpty(-1),
      concatMap((day: number) => this.appData.getMatchdayScoreSnapshot$(season, day)),
      map((scoreSnap: MatchdayScoreSnapshot) => this.scoreSnapToScoreArray(scoreSnap)),
      reduce((acc: Score[], matchdayScoreArray: Score[]) => this.statisticsCalculator.addScoreArrays(acc, matchdayScoreArray), []),
    );

    let aggregatedMatchdayScore$: Observable<Score[]> = combineLatest(
      this.initScoreArray$(), matchdaysScore$,
      (initialScore, matchScore) => {
        return this.statisticsCalculator.addScoreArrays(initialScore, matchScore);
      }
    ); // inits all active users in the Score array and adds the Score arrays from matchdays

    let aggregatedMatchdayAndSeasonScore$: Observable<Score[]> = combineLatest(
      this.initScoreArray$(), matchdaysScore$, this.fetchSeasonScoreArray$(season),
      (initialScore, matchScore, seasonScore) => {
        return this.statisticsCalculator.addScoreArrays(initialScore, matchScore, seasonScore);
      }
    ); // inits all active users in the Score array and adds the Score arrays from matchdays and season bets (if includeSeasonBets is true)

    return iif(() => includeSeasonBets, aggregatedMatchdayAndSeasonScore$, aggregatedMatchdayScore$).pipe(
      concatMap((scores: Score[]) => this.makeTableData$(scores))
    );
  }

  private fetchSeasonScoreArray$(season: number): Observable<Score[]> {
    // fetches the Score array of the season bets

    return combineLatest(
      this.fetchSeasonBetArray$(season),
      this.fetchSeasonResultArray$(season),
      (betArray: SeasonBet[], resultArray: SeasonResult[]) => {
        return this.statisticsCalculator.getSeasonScoreArray(betArray, resultArray);
      }
    );
  }

  private fetchSeasonBetArray$(season: number): Observable<SeasonBet[]> {
    // collects the SeasonBets of all active users and returns them as an array

    return this.appData.getActiveUserIds$().pipe(
      concatMap((userId: string) => this.relevantPlaces$.pipe(
        concatMap((place: number) => this.appData.getSeasonBet$(season, place, userId))
      )),
      toArray()
    );
  }

  private fetchSeasonResultArray$(season: number): Observable<SeasonResult[]> {
    // collects the SeasonResult of the given season and returns it as an array

    return this.relevantPlaces$.pipe(
      concatMap((place: number) => this.appData.getSeasonResult$(season, place)),
      toArray()
    );
  }

  private scoreSnapToScoreArray(scoreSnapshot: MatchdayScoreSnapshot): Score[] {
    // converts the MatchdayScoreSnapshot to a Score array for further processing
    // of the Score data
    // if array lengths are not matching, an empty Score array will be returned

    let scoreArray: Score[] = [];

    let arrayLenghts: number[] = [
      scoreSnapshot.points.length,
      scoreSnapshot.matches.length,
      scoreSnapshot.results.length,
      scoreSnapshot.extraTop.length,
      scoreSnapshot.extraOutsider.length,
      scoreSnapshot.extraSeason.length
    ];
    let arrayLengthsMatching: boolean = arrayLenghts.every(len => len == scoreSnapshot.userId.length);

    if (arrayLengthsMatching) {
      for (let i = 0; i < scoreSnapshot.userId.length; i++) {
        let score: Score = {
          userId: scoreSnapshot.userId[i],
          points: scoreSnapshot.points[i],
          matches: scoreSnapshot.matches[i],
          results: scoreSnapshot.results[i],
          extraTop: scoreSnapshot.extraTop[i],
          extraOutsider: scoreSnapshot.extraOutsider[i],
          extraSeason: scoreSnapshot.extraSeason[i]
        };
        scoreArray.push(score);
      }
    }

    return scoreArray;
  }

  private initScoreArray$(): Observable<Score[]> {
    // returns a Score array with initial zero Score of all active users

    return this.appData.getActiveUserIds$().pipe(
      map((userId: string) => {
        return {
          userId: userId,
          points: 0,
          matches: 0,
          results: 0,
          extraTop: 0,
          extraOutsider: 0,
          extraSeason: 0,
        };
      }),
      toArray()
    );
  }

  private makeTableData$(unsortedScoreArray: Score[]): Observable<TableData> {
    // converts the Score array to TableData array.
    // It is required to use a Score ARRAY instead of a Score OBJECT, because
    // to create the positions, all Score objects in combination are needed
    // simultaneously!

    let sortedScores$: Observable<Score[]> = of(unsortedScoreArray.sort(this.statisticsCalculator.compareScores));
    let positions$: Observable<number[]> = of(this.statisticsCalculator.makePositions(unsortedScoreArray, this.statisticsCalculator.compareScores));
    let userNames$: Observable<string[]> = sortedScores$.pipe(
      concatMap((scores: Score[]) => from(scores)),
      concatMap((score: Score) => this.appData.getUserDataById$(score.userId)),
      pluck("displayName"),
      toArray()
    );

    let table$: Observable<TableData[]> = combineLatest(
      sortedScores$, positions$, userNames$,
      (scoreArray: Score[], positionArray: number[], userNameArray: string[]) => {
        let table: TableData[] = [];
        for (let i in scoreArray) {

          let tableRow: TableData = {
            position: positionArray[i],
            userName: userNameArray[i],
            points: scoreArray[i].points,
            matches: scoreArray[i].matches,
            results: scoreArray[i].results,
            extraTop: scoreArray[i].extraTop,
            extraOutsider: scoreArray[i].extraOutsider,
            extraSeason: scoreArray[i].extraSeason
          };
          table.push(tableRow);

        }
        return table;
      }
    );

    return table$.pipe(
      concatMap((table: TableData[]) => from(table))
    );
  }

}
