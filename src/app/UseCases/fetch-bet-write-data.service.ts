import { Injectable } from '@angular/core';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { Observable, combineLatest, concat, range } from 'rxjs';
import { map, mergeMap, distinct, concatMap } from 'rxjs/operators';
import { Bet, Match, Result, SeasonBet } from '../Businessrules/basic_datastructures';
import { BetWriteData, SeasonBetWriteData } from './output_datastructures';
import { RELEVANT_FIRST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT } from '../Businessrules/rule_defined_values';

@Injectable({
  providedIn: 'root'
})
export class FetchBetWriteDataService {

  relevantPlaces$: Observable<number>;

  constructor(private appData: AppdataAccessService) {
    this.relevantPlaces$ = concat(
      range(1, RELEVANT_FIRST_PLACES_COUNT),
      range(-RELEVANT_LAST_PLACES_COUNT, RELEVANT_LAST_PLACES_COUNT)
    );
  }

  public fetchDataByMatchday$(season: number, matchday: number, userId: string): Observable<BetWriteData> {
    // returns the required BetWriteData of the given matchday as Observable

    return this.appData.getMatchesByMatchday$(season, matchday).pipe(
      mergeMap(match => this.makeBetWriteData$(match, userId)),
      distinct(betWriteData => betWriteData.matchId) // prevents adding new form on changing a bet if real-time reading is active
    );
  }

  public fetchDataByTime$(nextDays: number, userId: string): Observable<BetWriteData> {
    // returns the required BetWriteData of the given timespan as Observable

    nextDays = Math.max(0, nextDays); // only future days allowed

    return this.appData.getNextMatchesByTime$(nextDays).pipe(
      mergeMap(match => this.makeBetWriteData$(match, userId)),
      distinct(betWriteData => betWriteData.matchId) // prevents adding new form on changing a bet if real-time reading is active
    );
  }

  public fetchSeasonData$(season: number, userId: string): Observable<SeasonBetWriteData> {
    // returns the required SeasonBetWriteData of the given season as Observable
    // sorted by the first to the last place

    return this.relevantPlaces$.pipe(
      concatMap((place: number) => this.appData.getSeasonBet$(season, place, userId)),
      concatMap((bet: SeasonBet) => this.makeSeasonBetWriteData$(bet)),
      distinct((writeData: SeasonBetWriteData) => writeData.place) // prevents adding new form on changing a bet if real-time reading is active
    );
  }

  private makeSeasonBetWriteData$(bet: SeasonBet): Observable<SeasonBetWriteData> {
    // converts SeasonBet into the output data structure SeasonBetWriteData

    return this.appData.getTeamNameByTeamId$(bet.teamId).pipe(
      map((teamName: string) => {
        return {
          season: bet.season,
          place: bet.place,
          teamId: bet.teamId,
          teamName: teamName,
          isBetFixed: bet.isFixed,
          betDocumentId: bet.documentId
        };
      })
    );
  }

  private makeBetWriteData$(match: Match, userId: string): Observable<BetWriteData> {
    // converts the BetWriteData request for the required match into a data structure

    return combineLatest(
      this.appData.getTeamNameByTeamId$(match.teamIdHome),
      this.appData.getTeamNameByTeamId$(match.teamIdAway),
      this.appData.getTeamNameByTeamId$(match.teamIdHome, true),
      this.appData.getTeamNameByTeamId$(match.teamIdAway, true),
      this.appData.getBet$(match.matchId, userId),
      (teamHome, teamAway, teamShortHome, teamShortAway, bet) => {

        if (bet.documentId == "") {
          bet.documentId = this.appData.createDocumentId();
        }

        return {
          matchId: match.matchId,
          matchDate: new Date(match.timestamp * 1000),
          isTopMatch: match.isTopMatch,
          teamIdHome: match.teamIdHome,
          teamIdAway: match.teamIdAway,
          teamNameHome: teamHome,
          teamNameAway: teamAway,
          teamNameShortHome: teamShortHome,
          teamNameShortAway: teamShortAway,
          betGoalsHome: bet.goalsHome,
          betGoalsAway: bet.goalsAway,
          isBetFixed: bet.isFixed,
          betDocumentId: bet.documentId
        };
      });
  }

}
