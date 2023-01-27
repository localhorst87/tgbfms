import { Injectable } from '@angular/core';
import { AppdataAccessService } from './appdata-access.service';
import { Observable, from, timer } from 'rxjs';
import { map, switchMap, distinct, take, pluck, takeUntil } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { Bet, Match, Team, User, SeasonBet, SeasonResult, TopMatchVote } from '../Businessrules/basic_datastructures';
import { MatchdayScoreSnapshot, SyncTime } from './import_datastructures';
import { NUMBER_OF_TEAMS } from '../Businessrules/rule_defined_values';

export const COLLECTION_NAME_BETS: string = 'bets';
export const COLLECTION_NAME_MATCHES: string = 'matches';
export const COLLECTION_NAME_RESULTS: string = 'results';
export const COLLECTION_NAME_TEAMS: string = 'teams';
export const COLLECTION_NAME_USERS: string = 'users';
export const COLLECTION_NAME_MATCHDAY_SCORE_SNAPSHOT: string = 'matchday_score_snapshots';
export const COLLECTION_NAME_SEASON_BETS: string = 'season_bets';
export const COLLECTION_NAME_SEASON_RESULTS: string = 'season_results';
export const COLLECTION_NAME_UPDATE_TIMES: string = 'sync_times';
export const COLLECTION_NAME_TOPMATCH_VOTE: string = 'topmatch_votes';

const SECONDS_PER_DAY: number = 86400;
const MATCHES_PER_MATCHDAY: number = Math.floor(NUMBER_OF_TEAMS / 2);

@Injectable()
export class AppdataAccessFirestoreService implements AppdataAccessService {

  constructor(private firestore: AngularFirestore) { }

  getBet$(matchId: number, userId: string): Observable<Bet> {
    // queries the bet with the given matchId and userId
    // and returns the corresponding Observable

    let betQuery$: Observable<Bet[]> = this.firestore.collection<Bet>(COLLECTION_NAME_BETS, ref =>
      ref.where("matchId", "==", matchId).where('userId', '==', userId))
      .valueChanges({ idField: 'documentId' });

    let bet$: Observable<Bet> = betQuery$.pipe(
      map(betArray => {
        if (betArray.length == 0) {
          betArray.push(this.makeUnknownBet(matchId, userId));
        }
        return betArray[0];
      }),
      take(1),
      distinct()
    );

    return bet$;
  }

  getMatch$(matchId: number): Observable<Match> {
    // queries the match with the given matchId
    // and returns the corresponding Observable

    let matchQuery$: Observable<Match[]> = this.firestore.collection<Match>(COLLECTION_NAME_MATCHES, ref =>
      ref.where("matchId", "==", matchId))
      .valueChanges({ idField: 'documentId' });

    let match$: Observable<Match> = matchQuery$.pipe(
      map(matchArray => {
        if (matchArray.length == 0) {
          matchArray.push(this.makeUnknownMatch(matchId));
        }
        return matchArray[0];
      }),
      take(1),
      distinct()
    );

    return match$;
  }

  getSeasonBet$(season: number, place: number, userId: string): Observable<SeasonBet> {
    // queries the SeasonBets with the given season, place + userId and returns
    // the corresponding Observable

    let betQuery$: Observable<SeasonBet[]> = this.firestore.collection<SeasonBet>(COLLECTION_NAME_SEASON_BETS, ref =>
      ref.where("season", "==", season).where("place", "==", place).where("userId", "==", userId))
      .valueChanges({ idField: 'documentId' });

    return betQuery$.pipe(
      take(1),
      map(betArray => {
        if (betArray.length == 0) {
          betArray.push(this.makeUnknownSeasonBet(season, place, userId));
        }
        return betArray[0];
      })
    );
  }

  getSeasonResult$(season: number, place: number): Observable<SeasonResult> {
    // queries the SeasonResult with the given season + place and returns
    // the corresponding Observable

    let resultQuery$: Observable<SeasonResult[]> = this.firestore.collection<SeasonResult>(COLLECTION_NAME_SEASON_RESULTS, ref =>
      ref.where("season", "==", season).where("place", "==", place))
      .valueChanges({ idField: 'documentId' });

    return resultQuery$.pipe(
      take(1),
      map(resultArray => {
        if (resultArray.length == 0) {
          resultArray.push(this.makeUnknownSeasonResult(season, place));
        }
        return resultArray[0];
      })
    );
  }

  getMatchesByMatchday$(season: number, matchday: number): Observable<Match> {
    // returns all matches of the given matchday as Obervable

    let matchQuery$: Observable<Match[]> = this.firestore.collection<Match>(COLLECTION_NAME_MATCHES, ref =>
      ref.where("matchday", "==", matchday).where("season", "==", season)
        .orderBy("timestamp"))
      .valueChanges({ idField: 'documentId' }); // requires additional index in firestore

    return matchQuery$.pipe(
      switchMap(matchArray => from(matchArray)),
      take(MATCHES_PER_MATCHDAY),
      distinct(match => match.matchId)
    );
  }

  getFirstMatchOfMatchday$(season: number, matchday: number): Observable<Match> {
    // returns the first match of the given matchday in terms of time

    let matchQuery$: Observable<Match[]> = this.firestore.collection<Match>(COLLECTION_NAME_MATCHES, ref =>
      ref.where("matchday", "==", matchday).where("season", "==", season)
        .orderBy("timestamp")
        .limit(1))
      .valueChanges({ idField: 'documentId' });

    return matchQuery$.pipe(
      map((matchArray: Match[]) => {
        if (matchArray.length == 0) {
          matchArray.push(this.makeUnknownMatch(-1));
        }
        return matchArray[0];
      }),
      take(1),
      distinct()
    );
  }

  getNextMatchesByTime$(nextDays: number): Observable<Match> {
    // returns all matches within the nextDays days
    let timestampNow: number = Math.floor((new Date()).getTime() / 1000);
    let dateFuture: Date = new Date(Date.now() + nextDays * SECONDS_PER_DAY * 1000);
    let dateNextDays: Date = new Date(dateFuture.getFullYear(), dateFuture.getMonth(), dateFuture.getDate(), 23, 59, 59); // ceil to end of day
    let timeStampNextDays: number = Math.floor(dateNextDays.getTime() / 1000);

    let matchQuery$: Observable<Match[]> = this.firestore.collection<Match>(COLLECTION_NAME_MATCHES, ref =>
      ref.where("timestamp", ">", timestampNow).where("timestamp", "<", timeStampNextDays)
        .orderBy("timestamp"))
      .valueChanges({ idField: 'documentId' });

    let matches$: Observable<Match> = matchQuery$.pipe(
      take(1),
      switchMap(matchArray => from(matchArray)),
      distinct()
    );

    return matches$;
  }

  getMatchdayByMatchId$(matchId: number): Observable<number> {
    // returns the corresponding matchday of the given matchId as Obervable

    let matchQuery$: Observable<Match[]> = this.firestore.collection<Match>(COLLECTION_NAME_MATCHES, ref =>
      ref.where("matchId", "==", matchId))
      .valueChanges({ idField: 'documentId' });

    let matchday$: Observable<number> = matchQuery$.pipe(
      map(matchArray => {
        if (matchArray.length == 0) {
          return -1;
        }
        else {
          return matchArray[0].matchday;
        }
      }),
      take(1),
      distinct()
    );

    return matchday$;
  }

  getNextMatch$(season: number, amount: number = 1): Observable<Match> {
    // returns the next match that will take place. If no matches are left,
    // the function returns a dummy match
    // if amount is given, it returns the next matches according to the amount
    // given

    let timestampNow: number = Math.floor((new Date()).getTime() / 1000);

    let matchQuery$: Observable<Match[]> = this.firestore.collection<Match>(COLLECTION_NAME_MATCHES, ref =>
      ref.where("timestamp", ">", timestampNow).where("season", "==", season)
        .orderBy("timestamp")
        .limit(amount))
      .valueChanges({ idField: 'documentId' });

    let match$: Observable<Match> = matchQuery$.pipe(
      map(matchArray => {
        if (matchArray.length == 0) {
          matchArray.push(this.makeUnknownMatch(-1));
        }
        return matchArray;
      }),
      switchMap((matchArray: Match[]) => from(matchArray)),
      takeUntil(timer(3000)),
      distinct()
    );

    return match$;
  }

  getLastMatch$(season: number, amount: number = 1): Observable<Match> {
    // returns the last match that took place. If no match has been played yet,
    // the function returns a dummy match

    let timestampNow: number = Math.floor((new Date()).getTime() / 1000);

    let matchQuery$: Observable<Match[]> = this.firestore.collection<Match>(COLLECTION_NAME_MATCHES, ref =>
      ref.where("timestamp", "<", timestampNow).where("season", "==", season)
        .orderBy("timestamp", "desc")
        .limit(amount))
      .valueChanges({ idField: 'documentId' });

    let match$: Observable<Match> = matchQuery$.pipe(
      map(matchArray => {
        if (matchArray.length == 0) {
          matchArray.push(this.makeUnknownMatch(-1));
        }
        return matchArray;
      }),
      switchMap((matchArray: Match[]) => from(matchArray)),
      takeUntil(timer(3000)),
      distinct()
    );

    return match$;
  }

  getTopMatch$(season: number, matchday: number): Observable<Match> {
    // returns the top match of the given matchday. If no top match has been set,
    // the function returns a dummy match

    let matchQuery$: Observable<Match[]> = this.firestore.collection<Match>(COLLECTION_NAME_MATCHES, ref =>
      ref.where("matchday", "==", matchday).where("season", "==", season).where("isTopMatch", "==", true))
      .valueChanges({ idField: 'documentId' });

    let match$: Observable<Match> = matchQuery$.pipe(
      map(matchArray => {
        if (matchArray.length == 0) {
          return this.makeUnknownMatch(-1);
        }
        else {
          return matchArray[0];
        }
      }),
      take(1),
      distinct()
    );

    return match$;
  }

  getTeamNameByTeamId$(teamId: number, shortName: boolean = false): Observable<string> {
    // returns the name of the team with the given teamId. If the shortName flag is set
    // to true, the abbreviation of the team name will be returned

    let teamQuery$: Observable<Team[]> = this.firestore.collection<Team>(COLLECTION_NAME_TEAMS, ref =>
      ref.where("id", "==", teamId))
      .valueChanges({ idField: 'documentId' });

    let team$: Observable<string> = teamQuery$.pipe(
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
      }),
      take(1),
      distinct()
    );

    return team$;
  }

  getTeamByTeamId$(teamId: number): Observable<Team> {
    // returns the team information of the team with the given teamId

    let teamQuery$: Observable<Team[]> = this.firestore.collection<Team>(COLLECTION_NAME_TEAMS, ref =>
      ref.where("id", "==", teamId))
      .valueChanges({ idField: 'documentId' });

    let team$: Observable<Team> = teamQuery$.pipe(
      take(1),
      map(teamArray => {
        if (teamArray.length == 0) {
          return this.makeUnknownTeam(teamId);
        }
        else {
          return teamArray[0];
        }
      }),
      take(1),
      distinct()
    );

    return team$;
  }

  getActiveUserIds$(): Observable<string> {
    // returns the user IDs of all active users

    let userQuery$: Observable<User[]> = this.firestore.collection<User>(COLLECTION_NAME_USERS, ref =>
      ref.where("isActive", "==", true)
        .orderBy("displayName"))
      .valueChanges({ idField: 'documentId' });

    return userQuery$.pipe(
      take(1),
      switchMap((userArray: User[]) => from(userArray)),
      pluck("id"),
      distinct()
    );
  }

  getUserDataById$(userId: string): Observable<User> {
    // returns the user data according to the given ID

    let userQuery$: Observable<User[]> = this.firestore.collection<User>(COLLECTION_NAME_USERS, ref =>
      ref.where("id", "==", userId)
        .orderBy("displayName"))
      .valueChanges({ idField: 'documentId' });

    return userQuery$.pipe(
      map((userArray: User[]) => {
        if (userArray.length == 0) {
          return this.makeUnknownUser(userId);
        }
        else {
          return userArray[0];
        }
      }),
      take(1),
      distinct()
    );
  }

  getMatchdayScoreSnapshot$(season: number, matchday: number): Observable<MatchdayScoreSnapshot> {
    // returns the MatchdayScoreSnapshot according to the given arguments

    let snapshotQuery$: Observable<MatchdayScoreSnapshot[]> = this.firestore.collection<MatchdayScoreSnapshot>(COLLECTION_NAME_MATCHDAY_SCORE_SNAPSHOT, ref =>
      ref.where("season", "==", season).where("matchday", "==", matchday))
      .valueChanges({ idField: 'documentId' });

    return snapshotQuery$.pipe(
      map((scoreSnapshot: MatchdayScoreSnapshot[]) => {
        if (scoreSnapshot.length == 0) {
          return this.makeUnknownScoreSnapshot(season, matchday);
        }
        else {
          return scoreSnapshot[0];
        }
      }),
      take(1),
      distinct()
    );
  }

  getSyncTime$(season: number, matchday: number): Observable<SyncTime> {
    // returns the last time as unix timestamp (wrapped as SyncTime object)
    // of when the last change in the app database was made with respect to
    // the given season and matchday

    let timeQuery$: Observable<SyncTime[]> = this.firestore.collection<SyncTime>(COLLECTION_NAME_UPDATE_TIMES, ref =>
      ref.where("season", "==", season).where("matchday", "==", matchday))
      .valueChanges({ idField: 'documentId' });

    return timeQuery$.pipe(
      map((syncTimeArray: SyncTime[]) => {
        if (syncTimeArray.length == 0) {
          return this.makeUnknownSyncTime(season, matchday);
        }
        else {
          return syncTimeArray[0];
        }
      }),
      take(1),
      distinct()
    );
  }

  getOpenBets$(matchId: number): Observable<Bet> {
    // returns all the Bets with the given match ID that are not fixed

    let betQuery$: Observable<Bet[]> = this.firestore.collection<Bet>(COLLECTION_NAME_BETS, ref =>
      ref.where("matchId", "==", matchId).where("isFixed", "==", false))
      .valueChanges({ idField: "documentId" });

    return betQuery$.pipe(
      take(1),
      switchMap((betArray: Bet[]) => from(betArray)),
      distinct((bet: Bet) => bet.userId),
    );
  }

  getTopMatchVotes$(season: number, matchday: number, userId?: string): Observable<TopMatchVote> {
    // returns the TopMatchVotes from the given matchday. If userId is given,
    // the function returns only the TopMatchVote with given matchday and userId

    let voteQuery$: Observable<TopMatchVote[]>;

    if (userId) {
      voteQuery$ = this.firestore.collection<TopMatchVote>(COLLECTION_NAME_TOPMATCH_VOTE, ref =>
        ref.where("season", "==", season).where("matchday", "==", matchday).where("userId", "==", userId))
        .valueChanges({ idField: "documentId" });
    }
    else {
      voteQuery$ = this.firestore.collection<TopMatchVote>(COLLECTION_NAME_TOPMATCH_VOTE, ref =>
        ref.where("matchday", "==", matchday))
        .valueChanges({ idField: "documentId" });
    }

    return voteQuery$.pipe(
      take(1),
      switchMap((voteArray: TopMatchVote[]) => from(voteArray)),
      distinct()
    );
  }

  setBet(bet: Bet): Promise<void> {
    let betToUpdate: any = bet;
    let documentId: string = bet.documentId;
    delete betToUpdate.documentId;

    let betDocument: AngularFirestoreDocument = this.firestore.doc(COLLECTION_NAME_BETS + "/" + documentId);
    return betDocument.set(betToUpdate);
  }

  setSeasonBet(bet: SeasonBet): void {
    let betToUpdate: any = bet;
    let documentId: string = bet.documentId;
    delete betToUpdate.documentId;

    let betDocument: AngularFirestoreDocument = this.firestore.doc(COLLECTION_NAME_SEASON_BETS + "/" + documentId);
    betDocument.set(betToUpdate);
  }

  setUser(user: User): void {
    let userToUpdate: any = user;
    let documentId: string = user.documentId;
    delete userToUpdate.documentId;

    let userDocument: AngularFirestoreDocument = this.firestore.doc(COLLECTION_NAME_USERS + "/" + documentId);
    userDocument.set(userToUpdate);
  }

  addMatch(match: Match): void {
    let matchToWrite: any = match;
    delete matchToWrite.documentId;
    this.firestore.collection(COLLECTION_NAME_MATCHES).add(matchToWrite);
  }

  addSeasonResult(result: SeasonResult): void {
    let resultToWrite: any = result;
    delete resultToWrite.documentId;
    this.firestore.collection(COLLECTION_NAME_SEASON_RESULTS).add(resultToWrite);
  }

  updateMatch(documentId: string, match: Match): void {
    let matchToUpdate: any = match;
    delete matchToUpdate.documentId;

    let matchDocument: AngularFirestoreDocument = this.firestore.doc(COLLECTION_NAME_MATCHES + "/" + documentId);
    matchDocument.update(matchToUpdate);
  }

  updateSeasonResult(documentId: string, result: SeasonResult): void {
    let resultToUpdate: any = result;
    delete resultToUpdate.documentId;

    let resultDocument: AngularFirestoreDocument = this.firestore.doc(COLLECTION_NAME_SEASON_RESULTS + "/" + documentId);
    resultDocument.update(resultToUpdate);
  }

  setMatchdayScoreSnapshot(snapshot: MatchdayScoreSnapshot): void {
    let snapshotToUpdate: any = snapshot;
    let documentId: string = snapshot.documentId;
    delete snapshotToUpdate.documentId;

    let snapshotDocument: AngularFirestoreDocument = this.firestore.doc(COLLECTION_NAME_MATCHDAY_SCORE_SNAPSHOT + "/" + documentId);
    snapshotDocument.set(snapshotToUpdate);
  }

  setSyncTime(syncTime: SyncTime): void {
    let syncTimeToUpdate: any = syncTime;
    let documentId: string = syncTime.documentId;
    delete syncTimeToUpdate.documentId;

    let syncTimeDocument: AngularFirestoreDocument = this.firestore.doc(COLLECTION_NAME_UPDATE_TIMES + "/" + documentId);
    syncTimeDocument.set(syncTimeToUpdate);
  }

  setTopMatchVote(vote: TopMatchVote): Promise<void> {
    let voteToSet: any = vote;
    let documentId: string = vote.documentId;
    delete voteToSet.documentId;

    let voteDocument: AngularFirestoreDocument = this.firestore.doc(COLLECTION_NAME_TOPMATCH_VOTE + "/" + documentId);
    return voteDocument.set(voteToSet);
  }

  createDocumentId(): string {
    return this.firestore.createId();
  }

  private makeUnknownMatch(matchId: number): Match {
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
      teamIdAway: -1,
      goalsHome: -1,
      goalsAway: -1
    };
  }

  private makeUnknownBet(matchId: number, userId: string): Bet {
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

  private makeUnknownUser(userId: string): User {
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

  private makeUnknownScoreSnapshot(season: number, matchday: number): MatchdayScoreSnapshot {
    // returns an unknown dummy MatchdayScoreSnapshot

    return {
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
  }

  private makeUnknownSeasonBet(season: number, place: number, userId: string): SeasonBet {
    // returns an unknown dummy SeasonBet

    return {
      documentId: "",
      season: season,
      userId: userId,
      isFixed: false,
      place: place,
      teamId: -1
    };
  }

  private makeUnknownSeasonResult(season: number, place: number): SeasonResult {
    // returns an unknown dummy SeasonResult

    return {
      documentId: "",
      season: season,
      place: place,
      teamId: -1
    };
  }

  private makeUnknownTeam(teamId: number): Team {
    // return an unkown dummy Team

    return {
      documentId: "",
      id: teamId,
      nameLong: "unknown team",
      nameShort: "???"
    };
  }

  private makeUnknownSyncTime(season: number, matchday: number): SyncTime {
    // returns an unknown SyncTime struct

    return {
      documentId: "",
      season: season,
      matchday: matchday,
      timestamp: -1
    };
  }

}
