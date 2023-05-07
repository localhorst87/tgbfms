import { Injectable, EventEmitter } from '@angular/core';
import { Observable, combineLatest, range, concat, from, throwError } from 'rxjs';
import { map, toArray, concatMap, distinct, retry } from 'rxjs/operators';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { MatchdataAccessService } from '../Dataaccess/matchdata-access.service';
import { StatisticsCalculatorService } from '../Businessrules/statistics-calculator.service';
import { MatchImportData, TeamRankingImportData, MatchdayScoreSnapshot, SyncTime } from '../Dataaccess/import_datastructures';
import { Bet, Match, SeasonResult, Score } from '../Businessrules/basic_datastructures';
import { RELEVANT_FIRST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT, NUMBER_OF_TEAMS } from '../Businessrules/rule_defined_values';

const MATCHES_PER_MATCHDAY: number = Math.floor(NUMBER_OF_TEAMS / 2);
export const REQUIRED_UPDATES_PER_MATCHDAY: number = MATCHES_PER_MATCHDAY + 2; // all matches, one season result, one score snapshots

@Injectable({
  providedIn: 'root'
})
export class SynchronizeDataService {

  matchCounter: any; // Map<matchday: number, counter: number>
  syncCounter: any; // Map<matchday: number, counter: number>
  relevantPlaces$: Observable<number>;
  counterEvent: EventEmitter<void>;

  constructor(
    private appDataAccess: AppdataAccessService,
    private matchDataAccess: MatchdataAccessService,
    private statCalculater: StatisticsCalculatorService) {
    this.relevantPlaces$ = concat(
      range(1, RELEVANT_FIRST_PLACES_COUNT),
      range(-RELEVANT_LAST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT)
    );
    this.matchCounter = new Map();
    this.syncCounter = new Map();
    this.counterEvent = new EventEmitter();
  }

  public syncData(season: number, matchday: number): void {
    // performs synchronization of Match and Result data of the app data
    // with the match data

    this.isSyncNeeded$(season, matchday).subscribe(
      (isNeeded: boolean) => {
        if (isNeeded) {

          this.matchCounter.set(matchday, 0);
          this.syncCounter.set(matchday, 0);

          this.matchDataAccess.importMatchdata$(season, matchday).subscribe(
            (importedMatch: MatchImportData) => this.syncMatch(season, importedMatch)        
          );

          this.matchDataAccess.importCurrentTeamRanking$(season).pipe(toArray()).subscribe(
            (importedRanking: TeamRankingImportData[]) => {
              this.syncSeasonResult(season, matchday, importedRanking);
            }
          );
        }
      }
    );
  }

  public isSyncNeeded$(season: number, matchday: number): Observable<boolean> {
    // checks if a synchronization  for the given season and matchday is needed

    return combineLatest(
      this.appDataAccess.getSyncTime$(season, matchday),
      this.matchDataAccess.getLastUpdateTime$(season, matchday),
      (updateTimeAppData: SyncTime, updateTimeMatchData: number) => {
        return updateTimeMatchData > updateTimeAppData.timestamp;
      }
    );
  }

  private syncMatch(season: number, importedData: MatchImportData): void {
    // performs synchronization of Match data

    let matchday: number = importedData.matchday;

    this.appDataAccess.getMatch$(importedData.matchId).subscribe(
      (appdataMatch: Match) => {

        let importedMatch: Match = this.convertToMatch(season, importedData, appdataMatch.isTopMatch);

        if (appdataMatch.documentId == "") { // match not yet exported to database
          this.appDataAccess.addMatch(importedMatch);
        }
        else if (!this.isMatchEqual(importedMatch, appdataMatch)) { // available, but not up to date
          this.appDataAccess.updateMatch(appdataMatch.documentId, importedMatch);
        }
      },

      err => { },

      () => {
        let currentMatchCounter = this.matchCounter.get(matchday);
        let currentSyncCounter = this.syncCounter.get(matchday);
        this.matchCounter.set(matchday, currentMatchCounter + 1);
        this.syncCounter.set(matchday, currentSyncCounter + 1);
        this.counterEvent.emit();
        this.checkCounters(season, matchday);
      }
    );
  }

  private syncSeasonResult(season: number, matchday: number, importedData: TeamRankingImportData[]): void {
    // synchronizes SeasonResults in app database

    const numRequiredResults: number = RELEVANT_FIRST_PLACES_COUNT + RELEVANT_LAST_PLACES_COUNT;
    const nImports: number = importedData.length;

    if (nImports < numRequiredResults) { // not enough data available?
      return;
    }

    this.relevantPlaces$.pipe(
      concatMap((place: number) => this.appDataAccess.getSeasonResult$(season, place))
    ).subscribe(
      (appdataResult: SeasonResult) => {
        let place: number = appdataResult.place; // place > 0 -> first places, place < 0 -> last places
        let elImportData = (place > 0) ? place - 1 : place + nImports; // instruction which element to take from the imported data (from front or end)

        let importedResult: SeasonResult = this.convertToSeasonResult(season, place, importedData[elImportData]);

        if (appdataResult.teamId == -1) { // SeasonResult not availabe in app database
          this.appDataAccess.addSeasonResult(importedResult);
          return;
        }

        if (!this.isSeasonResultEqual(appdataResult, importedResult)) { // available, but not up to date
          this.appDataAccess.updateSeasonResult(appdataResult.documentId, importedResult);
        }
      },
      err => { },
      () => {
        let currentSyncCounter = this.syncCounter.get(matchday);
        this.syncCounter.set(matchday, currentSyncCounter + 1);
        this.counterEvent.emit();
        this.checkCounters(season, matchday);
      }
    );
  }

  private checkCounters(season: number, matchday: number): void {
    // must be called on completing an update of app data (1.:matchtes, 2.:results)
    // checks if both updates have been done for each match and if this is the
    // case it triggers the updating of the MatchdayScoreSnapshot

    if (this.matchCounter.get(matchday) == MATCHES_PER_MATCHDAY) {
      this.updateScoreSnapshot(season, matchday); // triggers update of Score data
      this.matchCounter.set(matchday, 0);
    }

    if (this.syncCounter.get(matchday) == REQUIRED_UPDATES_PER_MATCHDAY) {
      this.refreshUpdateTime(season, matchday); // refreshes update time in app data
      this.syncCounter.set(matchday, 0);
    }
  }

  private updateScoreSnapshot(season: number, matchday: number): void {
    // updates the MatchdayScoreSnapshot in the app database for the given season and matchday

    let newScoreSnapshot$: Observable<MatchdayScoreSnapshot> = this.appDataAccess.getMatchesByMatchday$(season, matchday).pipe(
      toArray(),
      map((matchArray: Match[]) => {
        if (matchArray.length < MATCHES_PER_MATCHDAY) {
          throw throwError("firestore error");
        }
        return matchArray;
      }),
      retry(5),
      concatMap((matchArray: Match[]) => this.getScoreArrayFromMatchArray$(matchArray)),
      map((scoreArray: Score[]) => this.convertToScoreSnapshot(season, matchday, scoreArray))
    );

    let oldScoreSnapshot$: Observable<MatchdayScoreSnapshot> = this.appDataAccess.getMatchdayScoreSnapshot$(season, matchday);

    combineLatest(newScoreSnapshot$, oldScoreSnapshot$,
      (newScore: MatchdayScoreSnapshot, oldScore: MatchdayScoreSnapshot) => {
        newScore.documentId = (oldScore.documentId == "" ? this.appDataAccess.createDocumentId() : oldScore.documentId);
        return newScore;
      }
    ).subscribe(
      (newScoreSnapshot: MatchdayScoreSnapshot) => {
        this.appDataAccess.setMatchdayScoreSnapshot(newScoreSnapshot);
      },
      err => { },
      () => {
        let currentSyncCounter = this.syncCounter.get(matchday);
        this.syncCounter.set(matchday, currentSyncCounter + 1);
        this.counterEvent.emit();
        this.checkCounters(season, matchday);
      }
    );
  }

  private getScoreArrayFromMatchArray$(matchArray: Match[]): Observable<Score[]> {
    // retrieves Bets and returns the calculated Scores

    return this.getBetArrayFromMatchArray$(matchArray).pipe(
      map((betArray: Bet[]) => this.statCalculater.getScoreArray(matchArray, betArray))
    );
  }

  private getBetArrayFromMatchArray$(matchArray: Match[]): Observable<Bet[]> {
    // returns all Bets as array from the given Match array

    return from(matchArray).pipe(
      concatMap((match: Match) => this.appDataAccess.getActiveUserIds$().pipe(
        concatMap((userId: string) => this.appDataAccess.getBet$(match.matchId, userId)),
      )),
      distinct(),
      toArray(),
    );
  }

  private refreshUpdateTime(season: number, matchday: number): void {
    // updates the new snyc time in the app database

    this.appDataAccess.getSyncTime$(season, matchday).subscribe(
      (syncTime: SyncTime) => {
        if (syncTime.documentId == "") {
          syncTime.documentId = this.appDataAccess.createDocumentId();
        }
        syncTime.timestamp = Math.floor((new Date()).getTime() / 1000); // new timestamp
        this.appDataAccess.setSyncTime(syncTime);
      }
    );
  }

  private convertToSeasonResult(season: number, place: number, teamRankingRow: TeamRankingImportData): SeasonResult {
    // creates a new SeasonResult object from the given import data

    return {
      documentId: "",
      season: season,
      place: place,
      teamId: teamRankingRow.teamId
    };
  }

  private convertToMatch(season: number, importedData: MatchImportData, isTopMatch: boolean = false): Match {
    // creates a new Match structure for writing to the app database

    return {
      documentId: "",
      season: season,
      matchday: importedData.matchday,
      matchId: importedData.matchId,
      timestamp: new Date(importedData.datetime).getTime() / 1000,
      isFinished: importedData.isFinished,
      isTopMatch: isTopMatch,
      teamIdHome: importedData.teamIdHome,
      teamIdAway: importedData.teamIdAway,
      goalsHome: importedData.goalsHome,
      goalsAway: importedData.goalsAway
    };
  }

  private convertToScoreSnapshot(season: number, matchday: number, scoreArray: Score[]): MatchdayScoreSnapshot {
    // converts a ScoreArray to a MatchdayScoreSnapshot

    let scoreSnapshot: MatchdayScoreSnapshot = {
      documentId: "",
      season: season,
      matchday: matchday,
      userId: [],
      points: [],
      matches: [],
      results: [],
      extraTop: [],
      extraOutsider: [],
      extraSeason: []
    };

    for (let score of scoreArray) {
      scoreSnapshot.userId.push(score.userId);
      scoreSnapshot.points.push(score.points);
      scoreSnapshot.matches.push(score.matches);
      scoreSnapshot.results.push(score.results);
      scoreSnapshot.extraTop.push(score.extraTop);
      scoreSnapshot.extraOutsider.push(score.extraOutsider);
      scoreSnapshot.extraSeason.push(score.extraSeason);
    }

    return scoreSnapshot;
  }

  private isMatchEqual(match1: Match, match2: Match): boolean {
    // checks if all properties are equal and leaves out the document ID !

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

  private isSeasonResultEqual(result1: SeasonResult, result2: SeasonResult): boolean {
    // checks if all properties are equal, except the document ID

    return (result1.season == result2.season &&
      result1.place == result2.place &&
      result1.teamId == result2.teamId);
  }

}
