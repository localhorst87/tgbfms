import { Injectable } from '@angular/core';
import { AppdataAccessService } from './appdata-access.service';
import { Observable, from } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import { Bet, Match, Result } from './datastructures';

const COLLECTION_NAME_BETS: string = 'bets';
const COLLECTION_NAME_MATCHES: string = 'matches';
const COLLECTION_NAME_RESULTS: string = 'results';
const COLLECTION_NAME_TEAMS: string = 'teams';

@Injectable()
export class AppdataAccessFirestoreService implements AppdataAccessService {

  constructor(private firestore: AngularFirestore) { }

  getBet(matchId: number, userId: number): Observable<Bet> {
    // queries the bet with the given matchId and userId
    // and returns the corresponding Observable

    let betQuery$: Observable<unknown[]> = this.firestore.collection(COLLECTION_NAME_BETS, ref =>
      ref.where("matchId", "==", matchId).where('userId', '==', userId))
      .valueChanges();

    let bet$: Observable<Bet> = betQuery$.pipe(
      map(betArray => {
        if (betArray.length == 0) {
          return this.makeUnknownBet(matchId, userId);
        }
        else {
          return this.makeBetFromDocument(betArray[0]);
        }
      })
    );

    return bet$;
  }

  getResult(matchId: number): Observable<Result> {
    // queries the result with the given matchId
    // and returns the corresponding Observable

    let resultQuery$: Observable<unknown[]> = this.firestore.collection(COLLECTION_NAME_RESULTS, ref =>
      ref.where("matchId", "==", matchId))
      .valueChanges();

    let result$: Observable<Result> = resultQuery$.pipe(
      map(resultArray => {
        if (resultArray.length == 0) {
          return this.makeUnknownResult(matchId);
        }
        else {
          return this.makeResultFromDocument(resultArray[0]);
        }
      })
    );

    return result$;
  }

  getMatch(matchId: number): Observable<Match> {
    // queries the match with the given matchId
    // and returns the corresponding Observable

    let matchQuery$: Observable<unknown[]> = this.firestore.collection(COLLECTION_NAME_MATCHES, ref =>
      ref.where("matchId", "==", matchId))
      .valueChanges();

    let match$: Observable<Match> = matchQuery$.pipe(
      map(matchArray => {
        if (matchArray.length == 0) {
          return this.makeUnknownMatch(matchId);
        }
        else {
          return this.makeMatchFromDocument(matchArray[0]);
        }
      })
    );

    return match$;
  }

  getMatchesByMatchday(matchday: number): Observable<Match> {
    // returns all matches of the given matchday as Obervable

    let matchQuery$: Observable<unknown[]> = this.firestore.collection(COLLECTION_NAME_MATCHES, ref =>
      ref.where("day", "==", matchday)
        .orderBy("time"))
      .valueChanges(); // requires additional index in firestore

    let matches$: Observable<Match> = matchQuery$.pipe(
      switchMap(matchArray => {
        let matches: Match[] = [];
        for (let matchItem of matchArray) {
          matches.push(this.makeMatchFromDocument(matchItem));
        }
        return from(matches);
      })
    );

    return matches$;
  }

  getMatchdayByMatchId(matchId: number): Observable<number> {
    // returns the corresponding matchday of the given matchId as Obervable

    let matchQuery$: Observable<unknown[]> = this.firestore.collection(COLLECTION_NAME_MATCHES, ref =>
      ref.where("matchId", "==", matchId))
      .valueChanges();

    let matchday$: Observable<number> = matchQuery$.pipe(
      map(matchArray => {
        if (matchArray.length == 0) {
          return -1;
        }
        else {
          let matchItem: any = matchArray[0];
          return matchItem.day;
        }
      })
    );

    return matchday$;
  }

  getNextMatch(): Observable<Match> {
    // returns the next match that will take place. If no matches are left,
    // the function returns null

    let timestampNow: Timestamp = firebase.firestore.Timestamp.fromDate(new Date());

    let matchQuery$: Observable<unknown[]> = this.firestore.collection(COLLECTION_NAME_MATCHES, ref =>
      ref.where("time", ">", timestampNow)
        .orderBy("time")
        .limit(1))
      .valueChanges();

    let match$: Observable<Match> = matchQuery$.pipe(
      map(matchArray => {
        if (matchArray.length == 0) {
          return this.makeUnknownMatch(-1);
        }
        else {
          return this.makeMatchFromDocument(matchArray[0]);
        }
      })
    );

    return match$;
  }

  getLastMatch(): Observable<Match> {
    // returns the last match that took place. If no match has been played yet,
    // the function returns null

    let timestampNow: Timestamp = firebase.firestore.Timestamp.fromDate(new Date());

    let matchQuery$: Observable<unknown[]> = this.firestore.collection(COLLECTION_NAME_MATCHES, ref =>
      ref.where("time", "<", timestampNow)
        .orderBy("time", "desc")
        .limit(1))
      .valueChanges();

    let match$: Observable<Match> = matchQuery$.pipe(
      map(matchArray => {
        if (matchArray.length == 0) {
          return this.makeUnknownMatch(-1);
        }
        else {
          return this.makeMatchFromDocument(matchArray[0]);
        }
      })
    );

    return match$;
  }

  getTeamNameByTeamId(teamId: number, shortName: boolean = false): Observable<string> {
    // returns the name of the team with the given teamId. If the shortName flag is set
    // to true, the abbreviation of the team name will be returned

    let teamQuery$: Observable<unknown[]> = this.firestore.collection(COLLECTION_NAME_TEAMS, ref =>
      ref.where("id", "==", teamId))
      .valueChanges();

    let team$: Observable<string> = teamQuery$.pipe(
      take(1), // sporadically the value gets emitted twice (!?)
      map(teamArray => {
        if (teamArray.length == 0) {
          return "unknown team";
        }
        else {
          return this.makeTeamNameFromDocument(teamArray[0], shortName);
        }
      })
    );

    return team$;
  }

  private makeMatchFromDocument(docItem: unknown): Match {
    // creates a Match Struct of the requested document of Firestore collection

    let castedItem = docItem as any;
    return {
      matchId: castedItem.matchId,
      timestamp: castedItem.time.seconds,
      teamIdHome: castedItem.teamIdHome,
      teamIdAway: castedItem.teamIdAway
    };
  }

  private makeBetFromDocument(docItem: unknown): Bet {
    // creates a Bet Struct of the requested document of Firestore collection

    let castedItem = docItem as any;
    return {
      matchId: castedItem.matchId,
      userId: castedItem.userId,
      isFixed: castedItem.isFixed,
      goalsHome: castedItem.goalsHome,
      goalsAway: castedItem.goalsAway
    };
  }

  private makeResultFromDocument(docItem: unknown): Result {
    // creates a Result Struct of the requested document of Firestore collection

    let castedItem = docItem as any;
    return {
      matchId: castedItem.matchId,
      goalsHome: castedItem.goalsHome,
      goalsAway: castedItem.goalsAway
    };
  }

  private makeTeamNameFromDocument(docItem: unknown, shortName: boolean): string {
    // returns the long or short name of the team according to the given
    // teams document of the Firestone collection

    let castedItem = docItem as any;
    if (shortName) {
      return castedItem.nameShort;
    }
    else {
      return castedItem.nameLong;
    }
  }

  private makeUnknownMatch(matchId: number): Match {
    // returns an unknown dummy Match

    return {
      matchId: matchId,
      timestamp: -1,
      teamIdHome: -1,
      teamIdAway: -1
    };
  }

  private makeUnknownBet(matchId: number, userId: number): Bet {
    // returns an unknown dummy Bet

    return {
      matchId: matchId,
      userId: userId,
      isFixed: false,
      goalsHome: -1,
      goalsAway: -1
    };
  }

  private makeUnknownResult(matchId: number): Result {
    // returns an unknown dummy Result

    return {
      matchId: matchId,
      goalsHome: -1,
      goalsAway: -1
    };
  }

}
