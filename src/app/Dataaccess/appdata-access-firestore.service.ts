import { Injectable } from '@angular/core';
import { AppdataAccessService } from './appdata-access.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import { Bet, Match, Result } from './datastructures';

const COLLECTION_NAME_BETS: string = 'bets';
const COLLECTION_NAME_MATCHES: string = 'matches';
const COLLECTION_NAME_RESULTS: string = 'results';

@Injectable({
  providedIn: 'root'
})
export class AppdataAccessFirestoreService implements AppdataAccessService {

  constructor(private firestore: AngularFirestore) { }

  getBet(matchId: number, userId: number): Observable<Bet | null> {
    // queries the bet with the given matchId and userId
    // and returns the corresponding Observable

    let betQuery$: Observable<unknown[]> = this.firestore.collection(COLLECTION_NAME_BETS, ref =>
      ref.where("matchId", "==", matchId).where('userId', '==', userId))
      .valueChanges();

    let bet$: Observable<Bet | null> = betQuery$.pipe(
      map(betArray => {
        if (betArray.length == 0) {
          return null;
        }
        else {
          return this.makeBetFromDocument(betArray[0]);
        }
      })
    );

    return bet$;
  }

  getResult(matchId: number): Observable<Result | null> {
    // queries the result with the given matchId
    // and returns the corresponding Observable

    let resultQuery$: Observable<unknown[]> = this.firestore.collection(COLLECTION_NAME_RESULTS, ref =>
      ref.where("matchId", "==", matchId))
      .valueChanges();

    let result$: Observable<Result | null> = resultQuery$.pipe(
      map(resultArray => {
        if (resultArray.length == 0) {
          return null;
        }
        else {
          return this.makeResultFromDocument(resultArray[0]);
        }
      })
    );

    return result$;
  }

  getMatch(matchId: number): Observable<Match | null> {
    // queries the match with the given matchId
    // and returns the corresponding Observable

    let matchQuery$: Observable<unknown[]> = this.firestore.collection(COLLECTION_NAME_MATCHES, ref =>
      ref.where("matchId", "==", matchId))
      .valueChanges();

    let match$: Observable<Match | null> = matchQuery$.pipe(
      map(matchArray => {
        if (matchArray.length == 0) {
          return null;
        }
        else {
          return this.makeMatchFromDocument(matchArray[0]);
        }
      })
    );

    return match$;
  }

  getMatchesByMatchday(matchday: number): Observable<Match[] | null> {
    // returns all matches of the given matchday as Obervable

    let matchQuery$: Observable<unknown[]> = this.firestore.collection(COLLECTION_NAME_MATCHES, ref =>
      ref.where("day", "==", matchday))
      .valueChanges();

    let matches$: Observable<Match[] | null> = matchQuery$.pipe(
      map(matchArray => {
        if (matchArray.length == 0) {
          return null;
        }
        else {
          let matches: Match[] = [];
          for (let matchItem of matchArray) {
            matches.push(this.makeMatchFromDocument(matchItem));
          }
          return matches;
        }
      })
    );

    return matches$;
  }

  getMatchdayByMatchId(matchId: number): Observable<number | null> {
    // returns the corresponding matchday of the given matchId as Obervable

    let matchQuery$: Observable<unknown[]> = this.firestore.collection(COLLECTION_NAME_MATCHES, ref =>
      ref.where("matchId", "==", matchId))
      .valueChanges();

    let matchday$: Observable<number | null> = matchQuery$.pipe(
      map(matchArray => {
        if (matchArray.length == 0) {
          return null;
        }
        else {
          let matchItem: any = matchArray[0];
          return matchItem.day;
        }
      })
    );

    return matchday$;
  }

  getNextMatch(): Observable<Match | null> {
    // returns the next match that will take place. If no matches are left,
    // the function returns null

    let timestampNow: Timestamp = firebase.firestore.Timestamp.fromDate(new Date());

    let matchQuery$: Observable<unknown[]> = this.firestore.collection(COLLECTION_NAME_MATCHES, ref =>
      ref.where("time", ">", timestampNow)
        .orderBy("time")
        .limit(1))
      .valueChanges();

    let match$: Observable<Match | null> = matchQuery$.pipe(
      map(matchArray => {
        if (matchArray.length == 0) {
          return null;
        }
        else {
          return this.makeMatchFromDocument(matchArray[0]);
        }
      })
    );

    return match$;
  }

  getLastMatch(): Observable<Match | null> {
    // returns the last match that took place. If no match has been played yet,
    // the function returns null

    let timestampNow: Timestamp = firebase.firestore.Timestamp.fromDate(new Date());

    let matchQuery$: Observable<unknown[]> = this.firestore.collection(COLLECTION_NAME_MATCHES, ref =>
      ref.where("time", "<", timestampNow)
        .orderBy("time", "desc")
        .limit(1))
      .valueChanges();

    let match$: Observable<Match | null> = matchQuery$.pipe(
      map(matchArray => {
        if (matchArray.length == 0) {
          return null;
        }
        else {
          return this.makeMatchFromDocument(matchArray[0]);
        }
      })
    );

    return match$;
  }

  private makeMatchFromDocument(docItem: unknown) {
    // creates a Match Struct of the requested document of Firestore collection

    let castedItem = docItem as any;
    return {
      matchId: castedItem.matchId,
      timestamp: castedItem.time.seconds,
      teamIdHome: castedItem.teamIdHome,
      teamIdAway: castedItem.teamIdAway
    };
  }

  private makeBetFromDocument(docItem: unknown) {
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

  private makeResultFromDocument(docItem: unknown) {
    // creates a Result Struct of the requested document of Firestore collection

    let castedItem = docItem as any;
    return {
      matchId: castedItem.matchId,
      goalsHome: castedItem.goalsHome,
      goalsAway: castedItem.goalsAway
    };
  }

}
