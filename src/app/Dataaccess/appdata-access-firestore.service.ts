import { Injectable } from '@angular/core';
import { AppdataAccessService } from './appdata-access.service';
import { Observable, from } from 'rxjs';
import { map, switchMap, distinct, take, pluck } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import { Bet, Match, Result, Team, User } from './database_datastructures';
import { BetExtended, MatchExtended, ResultExtended, TeamExtended, UserExtended } from './database_datastructures';

const COLLECTION_NAME_BETS: string = 'bets';
const COLLECTION_NAME_MATCHES: string = 'matches';
const COLLECTION_NAME_RESULTS: string = 'results';
const COLLECTION_NAME_TEAMS: string = 'teams';
const COLLECTION_NAME_USERS: string = 'users';
const SECONDS_PER_DAY: number = 86400;

@Injectable()
export class AppdataAccessFirestoreService implements AppdataAccessService {

  constructor(private firestore: AngularFirestore) { }

  getBet$(matchId: number, userId: string): Observable<BetExtended> {
    // queries the bet with the given matchId and userId
    // and returns the corresponding Observable

    let betQuery$: Observable<BetExtended[]> = this.firestore.collection<BetExtended>(COLLECTION_NAME_BETS, ref =>
      ref.where("matchId", "==", matchId).where('userId', '==', userId))
      .valueChanges({ idField: 'documentId' });

    let bet$: Observable<BetExtended> = betQuery$.pipe(
      take(1),
      map(betArray => {
        if (betArray.length == 0) {
          betArray.push(this.makeUnknownBet(matchId, userId));
        }
        return betArray[0];
      })
    );

    return bet$;
  }

  getResult$(matchId: number): Observable<ResultExtended> {
    // queries the result with the given matchId
    // and returns the corresponding Observable

    let resultQuery$: Observable<ResultExtended[]> = this.firestore.collection<ResultExtended>(COLLECTION_NAME_RESULTS, ref =>
      ref.where("matchId", "==", matchId))
      .valueChanges({ idField: 'documentId' });

    let result$: Observable<ResultExtended> = resultQuery$.pipe(
      take(1),
      map(resultArray => {
        if (resultArray.length == 0) {
          resultArray.push(this.makeUnknownResult(matchId));
        }
        return resultArray[0];
      })
    );

    return result$;
  }

  getMatch$(matchId: number): Observable<MatchExtended> {
    // queries the match with the given matchId
    // and returns the corresponding Observable

    let matchQuery$: Observable<MatchExtended[]> = this.firestore.collection<MatchExtended>(COLLECTION_NAME_MATCHES, ref =>
      ref.where("matchId", "==", matchId))
      .valueChanges({ idField: 'documentId' });

    let match$: Observable<MatchExtended> = matchQuery$.pipe(
      take(1),
      map(matchArray => {
        if (matchArray.length == 0) {
          matchArray.push(this.makeUnknownMatch(matchId));
        }
        return matchArray[0];
      })
    );

    return match$;
  }

  getMatchesByMatchday$(season: number, matchday: number): Observable<MatchExtended> {
    // returns all matches of the given matchday as Obervable

    let matchQuery$: Observable<MatchExtended[]> = this.firestore.collection<MatchExtended>(COLLECTION_NAME_MATCHES, ref =>
      ref.where("matchday", "==", matchday).where("season", "==", season)
        .orderBy("timestamp"))
      .valueChanges({ idField: 'documentId' }); // requires additional index in firestore

    let matches$: Observable<MatchExtended> = matchQuery$.pipe(
      take(1),
      switchMap(matchArray => from(matchArray))
    );

    return matches$;
  }

  getNextMatchesByTime$(nextDays: number): Observable<MatchExtended> {
    // returns all matches within the nextDays days
    let timestampNow: Timestamp = firebase.firestore.Timestamp.fromDate(new Date());
    let timestampFuture = new Date(Date.now() + nextDays * SECONDS_PER_DAY * 1000);
    let timeStampNextDays = new Date(timestampFuture.getFullYear(), timestampFuture.getMonth(), timestampFuture.getDate(), 23, 59, 59); // ceil to end of day

    let matchQuery$: Observable<MatchExtended[]> = this.firestore.collection<MatchExtended>(COLLECTION_NAME_MATCHES, ref =>
      ref.where("timestamp", ">", timestampNow).where("timestamp", "<", timeStampNextDays)
        .orderBy("timestamp"))
      .valueChanges({ idField: 'documentId' });

    let matches$: Observable<MatchExtended> = matchQuery$.pipe(
      distinct(),
      switchMap(matchArray => from(matchArray))
    );

    return matches$;
  }

  getMatchdayByMatchId$(matchId: number): Observable<number> {
    // returns the corresponding matchday of the given matchId as Obervable

    let matchQuery$: Observable<MatchExtended[]> = this.firestore.collection<MatchExtended>(COLLECTION_NAME_MATCHES, ref =>
      ref.where("matchId", "==", matchId))
      .valueChanges({ idField: 'documentId' });

    let matchday$: Observable<number> = matchQuery$.pipe(
      distinct(),
      map(matchArray => {
        if (matchArray.length == 0) {
          return -1;
        }
        else {
          return matchArray[0].matchday;
        }
      })
    );

    return matchday$;
  }

  getNextMatch$(): Observable<MatchExtended> {
    // returns the next match that will take place. If no matches are left,
    // the function returns null

    let timestampNow: Timestamp = firebase.firestore.Timestamp.fromDate(new Date());

    let matchQuery$: Observable<MatchExtended[]> = this.firestore.collection<MatchExtended>(COLLECTION_NAME_MATCHES, ref =>
      ref.where("time", ">", timestampNow)
        .orderBy("time")
        .limit(1))
      .valueChanges({ idField: 'documentId' });

    let match$: Observable<MatchExtended> = matchQuery$.pipe(
      distinct(),
      map(matchArray => {
        if (matchArray.length == 0) {
          return this.makeUnknownMatch(-1);
        }
        else {
          return matchArray[0];
        }
      })
    );

    return match$;
  }

  getLastMatch$(): Observable<MatchExtended> {
    // returns the last match that took place. If no match has been played yet,
    // the function returns null

    let timestampNow: Timestamp = firebase.firestore.Timestamp.fromDate(new Date());

    let matchQuery$: Observable<MatchExtended[]> = this.firestore.collection<MatchExtended>(COLLECTION_NAME_MATCHES, ref =>
      ref.where("time", "<", timestampNow)
        .orderBy("time", "desc")
        .limit(1))
      .valueChanges({ idField: 'documentId' });

    let match$: Observable<MatchExtended> = matchQuery$.pipe(
      distinct(),
      map(matchArray => {
        if (matchArray.length == 0) {
          return this.makeUnknownMatch(-1);
        }
        else {
          return matchArray[0];
        }
      })
    );

    return match$;
  }

  getTeamNameByTeamId$(teamId: number, shortName: boolean = false): Observable<string> {
    // returns the name of the team with the given teamId. If the shortName flag is set
    // to true, the abbreviation of the team name will be returned

    let teamQuery$: Observable<TeamExtended[]> = this.firestore.collection<Team>(COLLECTION_NAME_TEAMS, ref =>
      ref.where("id", "==", teamId))
      .valueChanges({ idField: 'documentId' });

    let team$: Observable<string> = teamQuery$.pipe(
      take(1),
      map(teamArray => {
        if (teamArray.length == 0) {
          return "unknown team";
        }
        else {
          if (shortName) {
            return teamArray[0].nameShort;
          }
          else {
            return teamArray[0].nameLong;
          }
        }
      })
    );

    return team$;
  }

  getActiveUserIds$(): Observable<string> {
    // returns the user IDs of all active users

    let userQuery$: Observable<UserExtended[]> = this.firestore.collection<User>(COLLECTION_NAME_USERS, ref =>
      ref.where("isActive", "==", true)
        .orderBy("displayName"))
      .valueChanges({ idField: 'documentId' });

    return userQuery$.pipe(
      take(1),
      switchMap((userArray: UserExtended[]) => from(userArray)),
      pluck("id")
    );
  }

  getUserDataById$(userId: string): Observable<UserExtended> {
    // returns the user data according to the given ID

    let userQuery$: Observable<UserExtended[]> = this.firestore.collection<UserExtended>(COLLECTION_NAME_USERS, ref =>
      ref.where("id", "==", userId)
        .orderBy("displayName"))
      .valueChanges({ idField: 'documentId' });

    return userQuery$.pipe(
      take(1),
      map((userArray: UserExtended[]) => {
        if (userArray.length == 0) {
          return this.makeUnknownUser(userId);
        }
        else {
          return userArray[0];
        }
      })
    );
  }

  addMatch(match: Match): void {
    this.firestore.collection<Match>(COLLECTION_NAME_MATCHES).add(match);
  }

  addBet(bet: Bet): void {
    this.firestore.collection<Bet>(COLLECTION_NAME_BETS).add(bet);
  }

  addResult(result: Result): void {
    this.firestore.collection<Result>(COLLECTION_NAME_RESULTS).add(result);
  }

  updateMatch(documentId: string, match: Match): void {
    let matchDocument: AngularFirestoreDocument<Match> = this.firestore.doc<Match>(COLLECTION_NAME_MATCHES + "/" + documentId);
    matchDocument.update(match);
  }

  updateBet(documentId: string, bet: Bet): void {
    let betDocument: AngularFirestoreDocument<Bet> = this.firestore.doc<Bet>(COLLECTION_NAME_BETS + "/" + documentId);
    betDocument.update(bet);
  }

  updateResult(documentId: string, result: Result): void {
    let resultDocument: AngularFirestoreDocument<Result> = this.firestore.doc<Result>(COLLECTION_NAME_RESULTS + "/" + documentId);
    resultDocument.update(result);
  }

  private makeUnknownMatch(matchId: number): MatchExtended {
    // returns an unknown dummy Match

    return {
      documentId: "",
      season: -1,
      matchday: -1,
      matchId: matchId,
      timestamp: -1,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: -1,
      teamIdAway: -1
    };
  }

  private makeUnknownBet(matchId: number, userId: string): BetExtended {
    // returns an unknown dummy Bet

    return {
      documentId: "",
      matchId: matchId,
      userId: userId,
      isFixed: false,
      goalsHome: -1,
      goalsAway: -1
    };
  }

  private makeUnknownResult(matchId: number): ResultExtended {
    // returns an unknown dummy Result

    return {
      documentId: "",
      matchId: matchId,
      goalsHome: -1,
      goalsAway: -1
    };
  }

  private makeUnknownUser(userId: string): UserExtended {
    // returns an unknown dummy User

    return {
      documentId: "",
      id: userId,
      email: "",
      displayName: "unknown user",
      isAdmin: false,
      isActive: false
    };
  }

}
