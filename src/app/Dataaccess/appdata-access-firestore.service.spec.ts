import { TestBed } from '@angular/core/testing';

import { AppdataAccessFirestoreService } from './appdata-access-firestore.service';
// import { AppdataAccessService } from './appdata-access.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';
import { COLLECTION_NAME_BETS, COLLECTION_NAME_MATCHES, COLLECTION_NAME_RESULTS, COLLECTION_NAME_TEAMS, COLLECTION_NAME_USERS } from './appdata-access-firestore.service';
import { BetExtended, ResultExtended, MatchExtended, UserExtended, TeamExtended } from '../Businessrules/basic_datastructures';

describe('AppdataAccessFirestoreService', () => {
  let service: AppdataAccessFirestoreService;

  it('should be created', () => {
    const firestoreStub: any = jasmine.createSpy();
    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // getBet$
  // ---------------------------------------------------------------------------

  it("getBet$, one dataset", (done: DoneFn) => {
    const argument1: number = 9999;
    const argument2: string = "test_user_id";

    const targetBet: BetExtended = { documentId: "test_id_123", matchId: argument1, isFixed: true, userId: argument2, goalsHome: 2, goalsAway: 1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetBet])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: BetExtended[] = [targetBet];

    let i: number = 0;
    service["getBet$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getBet$, more than one dataset", (done: DoneFn) => {
    const argument1: number = 9999;
    const argument2: string = "test_user_id";

    const targetBet: BetExtended = { documentId: "test_id_123", matchId: argument1, isFixed: true, userId: argument2, goalsHome: 2, goalsAway: 1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetBet, targetBet])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: BetExtended[] = [targetBet];
    const expectedNumOfValues: number = 1;

    let i: number = 0;
    service["getBet$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getBet$, emitting twice", (done: DoneFn) => {
    const argument1: number = 9999;
    const argument2: string = "test_user_id";

    const targetBet: BetExtended = { documentId: "test_id_123", matchId: argument1, isFixed: true, userId: argument2, goalsHome: 2, goalsAway: 1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetBet], [targetBet])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: BetExtended[] = [targetBet];
    const expectedNumOfValues: number = 1;

    let i: number = 0;
    service["getBet$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getBet$, no dataset available", (done: DoneFn) => {
    const argument1: number = 9999;
    const argument2: string = "test_user_id";

    const unknownBet: BetExtended = { documentId: "", matchId: argument1, isFixed: false, userId: argument2, goalsHome: -1, goalsAway: -1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: BetExtended[] = [unknownBet];

    let i: number = 0;
    service["getBet$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getResult$
  // ---------------------------------------------------------------------------

  it("getResult$, one dataset", (done: DoneFn) => {
    const argument: number = 9999;

    const targetResult: ResultExtended = { documentId: "test_id_123", matchId: argument, goalsHome: 2, goalsAway: 1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetResult])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: ResultExtended[] = [targetResult];

    let i: number = 0;
    service["getResult$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getResult$, more than one dataset", (done: DoneFn) => {
    const argument: number = 9999;

    const targetResult: ResultExtended = { documentId: "test_id_123", matchId: argument, goalsHome: 2, goalsAway: 1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetResult, targetResult])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: ResultExtended[] = [targetResult];

    let i: number = 0;
    service["getResult$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getResult$, emitting twice", (done: DoneFn) => {
    const argument: number = 9999;

    const targetResult: ResultExtended = { documentId: "test_id_123", matchId: argument, goalsHome: 2, goalsAway: 1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetResult], [targetResult])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: ResultExtended[] = [targetResult];

    let i: number = 0;
    service["getResult$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getResult$, no dataset available", (done: DoneFn) => {
    const argument: number = 9999;

    const unknownResult: ResultExtended = { documentId: "", matchId: argument, goalsHome: -1, goalsAway: -1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: ResultExtended[] = [unknownResult];

    let i: number = 0;
    service["getResult$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getMatchesByMatchday$
  // ---------------------------------------------------------------------------

  it("getMatchesByMatchday$, datasets available", (done: DoneFn) => {
    const argument1: number = 2021;
    const argument2: number = 34;

    const match1: MatchExtended = { documentId: "test_id_1", season: argument1, matchday: argument2, matchId: 1, timestamp: 1617640000, isFinished: true, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const match2: MatchExtended = { documentId: "test_id_2", season: argument1, matchday: argument2, matchId: 2, timestamp: 1617645000, isFinished: false, isTopMatch: false, teamIdHome: 31, teamIdAway: 26 };
    const match3: MatchExtended = { documentId: "test_id_3", season: argument1, matchday: argument2, matchId: 3, timestamp: 1617650000, isFinished: false, isTopMatch: false, teamIdHome: 5, teamIdAway: 2 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([match1, match2, match3])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: MatchExtended[] = [match1, match2, match3];

    let i: number = 0;
    service["getMatchesByMatchday$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getMatchesByMatchday$, double datasets available", (done: DoneFn) => {
    const argument1: number = 2021;
    const argument2: number = 34;

    const match1: MatchExtended = { documentId: "test_id_1", season: argument1, matchday: argument2, matchId: 1, timestamp: 1617640000, isFinished: true, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const match2: MatchExtended = { documentId: "test_id_2", season: argument1, matchday: argument2, matchId: 2, timestamp: 1617645000, isFinished: false, isTopMatch: false, teamIdHome: 31, teamIdAway: 26 };
    const match3: MatchExtended = { documentId: "test_id_3", season: argument1, matchday: argument2, matchId: 3, timestamp: 1617650000, isFinished: false, isTopMatch: false, teamIdHome: 5, teamIdAway: 2 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([match1, match2, match2, match3, match3])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: MatchExtended[] = [match1, match2, match3];

    let i: number = 0;
    service["getMatchesByMatchday$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getMatchesByMatchday$, emitting twice", (done: DoneFn) => {
    const argument1: number = 2021;
    const argument2: number = 34;

    const match1: MatchExtended = { documentId: "test_id_1", season: argument1, matchday: argument2, matchId: 1, timestamp: 1617640000, isFinished: true, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const match2: MatchExtended = { documentId: "test_id_2", season: argument1, matchday: argument2, matchId: 2, timestamp: 1617645000, isFinished: false, isTopMatch: false, teamIdHome: 31, teamIdAway: 26 };
    const match3: MatchExtended = { documentId: "test_id_3", season: argument1, matchday: argument2, matchId: 3, timestamp: 1617650000, isFinished: false, isTopMatch: false, teamIdHome: 5, teamIdAway: 2 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([match1, match2, match3], [match1, match2, match3])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: MatchExtended[] = [match1, match2, match3];

    let i: number = 0;
    service["getMatchesByMatchday$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getMatchesByMatchday$, no datasets available", (done: DoneFn) => {
    const argument1: number = 2021;
    const argument2: number = 34;

    const defaultValue: MatchExtended = { documentId: "default", season: argument1, matchday: argument2, matchId: -1, timestamp: -1, isFinished: false, isTopMatch: false, teamIdHome: -1, teamIdAway: -1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    service["getMatchesByMatchday$"](argument1, argument2).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );
  });

  // ---------------------------------------------------------------------------
  // getNextMatchesByTime$
  // ---------------------------------------------------------------------------

  it("getNextMatchesByTime$, datasets available", (done: DoneFn) => {
    const argument: number = 6;

    const match1: MatchExtended = { documentId: "test_id_1", season: 2020, matchday: 28, matchId: 1, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const match2: MatchExtended = { documentId: "test_id_2", season: 2020, matchday: 28, matchId: 2, timestamp: 1617645000, isFinished: false, isTopMatch: false, teamIdHome: 31, teamIdAway: 26 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([match1, match2])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: MatchExtended[] = [match1, match2];

    let i: number = 0;
    service["getNextMatchesByTime$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getNextMatchesByTime$, double datasets available", (done: DoneFn) => {
    const argument: number = 6;

    const match1: MatchExtended = { documentId: "test_id_1", season: 2020, matchday: 28, matchId: 1, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([match1, match1, match1])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: MatchExtended[] = [match1];

    let i: number = 0;
    service["getNextMatchesByTime$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getNextMatchesByTime$, emitting twice", (done: DoneFn) => {
    const argument: number = 6;

    const match1: MatchExtended = { documentId: "test_id_1", season: 2020, matchday: 28, matchId: 1, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const match2: MatchExtended = { documentId: "test_id_2", season: 2020, matchday: 28, matchId: 2, timestamp: 1617645000, isFinished: false, isTopMatch: false, teamIdHome: 31, teamIdAway: 26 };
    const match3: MatchExtended = { documentId: "test_id_3", season: 2020, matchday: 29, matchId: 3, timestamp: 1617650000, isFinished: false, isTopMatch: true, teamIdHome: 5, teamIdAway: 2 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([match1, match2, match3], [match1, match2, match3])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: MatchExtended[] = [match1, match2, match3];

    let i: number = 0;
    service["getNextMatchesByTime$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getNextMatchesByTime$, no datasets available", (done: DoneFn) => {
    const argument: number = 1;

    const defaultValue: MatchExtended = { documentId: "default", season: -1, matchday: -1, matchId: -1, timestamp: -1, isFinished: false, isTopMatch: false, teamIdHome: -1, teamIdAway: -1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    service["getNextMatchesByTime$"](argument).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );
  });

  // ---------------------------------------------------------------------------
  // getMatchdayByMatchId$
  // ---------------------------------------------------------------------------

  it("getMatchdayByMatchId$, dataset available", (done: DoneFn) => {
    const argument: number = 9999;
    const expectedMatchday: number = 28;

    const match: MatchExtended = { documentId: "test_id", season: 2020, matchday: expectedMatchday, matchId: argument, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([match])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: number[] = [expectedMatchday];

    let i: number = 0;
    service["getMatchdayByMatchId$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getMatchdayByMatchId$, more than one dataset", (done: DoneFn) => {
    const argument: number = 9999;
    const expectedMatchday: number = 28;

    const match: MatchExtended = { documentId: "test_id", season: 2020, matchday: expectedMatchday, matchId: argument, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([match, match, match])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: number[] = [expectedMatchday];

    let i: number = 0;
    service["getMatchdayByMatchId$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getMatchdayByMatchId$, emitting twice", (done: DoneFn) => {
    const argument: number = 9999;
    const expectedMatchday: number = 28;

    const match: MatchExtended = { documentId: "test_id", season: 2020, matchday: expectedMatchday, matchId: argument, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([match], [match])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: number[] = [expectedMatchday];

    let i: number = 0;
    service["getMatchdayByMatchId$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getMatchdayByMatchId$, no dataset available", (done: DoneFn) => {
    const argument: number = 9999;
    const expectedMatchday: number = -1;

    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: number[] = [expectedMatchday];

    let i: number = 0;
    service["getMatchdayByMatchId$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getNextMatch$
  // ---------------------------------------------------------------------------

  it("getNextMatch$, dataset available", (done: DoneFn) => {
    const targetMatch: MatchExtended = { documentId: "test_id_1", season: 2020, matchday: 28, matchId: 1, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetMatch])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: MatchExtended[] = [targetMatch];

    let i: number = 0;
    service["getNextMatch$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getNextMatch$, emitting twice", (done: DoneFn) => {
    const targetMatch: MatchExtended = { documentId: "test_id_1", season: 2020, matchday: 28, matchId: 1, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetMatch], [targetMatch])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: MatchExtended[] = [targetMatch];

    let i: number = 0;
    service["getNextMatch$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getNextMatch$, no dataset available", (done: DoneFn) => {
    const unknownMatch: MatchExtended = { documentId: "", season: -1, matchday: -1, matchId: -1, timestamp: -1, isFinished: false, isTopMatch: false, teamIdHome: -1, teamIdAway: -1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: MatchExtended[] = [unknownMatch];

    let i: number = 0;
    service["getNextMatch$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getLastMatch$
  // ---------------------------------------------------------------------------

  it("getLastMatch$, dataset available", (done: DoneFn) => {
    const targetMatch: MatchExtended = { documentId: "test_id_1", season: 2020, matchday: 28, matchId: 1, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetMatch])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: MatchExtended[] = [targetMatch];

    let i: number = 0;
    service["getLastMatch$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getLastMatch$, emitting twice", (done: DoneFn) => {
    const targetMatch: MatchExtended = { documentId: "test_id_1", season: 2020, matchday: 28, matchId: 1, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetMatch], [targetMatch])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: MatchExtended[] = [targetMatch];

    let i: number = 0;
    service["getLastMatch$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getLastMatch$, no dataset available", (done: DoneFn) => {
    const unknownMatch: MatchExtended = { documentId: "", season: -1, matchday: -1, matchId: -1, timestamp: -1, isFinished: false, isTopMatch: false, teamIdHome: -1, teamIdAway: -1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: MatchExtended[] = [unknownMatch];

    let i: number = 0;
    service["getLastMatch$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getTeamNameByTeamId$
  // ---------------------------------------------------------------------------

  it("getTeamNameByTeamId$, dataset available, no short name argument", (done: DoneFn) => {
    const argument1: number = 10;
    const expectedTeamname: string = "TSV Handorf";

    const team: TeamExtended = { documentId: "test_id", id: argument1, nameLong: expectedTeamname, nameShort: "TSV" };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([team])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: string[] = [expectedTeamname];

    let i: number = 0;
    service["getTeamNameByTeamId$"](argument1).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getTeamNameByTeamId$, dataset available, short name argument true", (done: DoneFn) => {
    const argument1: number = 10;
    const argument2: boolean = true;
    const expectedTeamname: string = "TSV";

    const team: TeamExtended = { documentId: "test_id", id: argument1, nameLong: "TSV Handorf", nameShort: expectedTeamname };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([team])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: string[] = [expectedTeamname];

    let i: number = 0;
    service["getTeamNameByTeamId$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getTeamNameByTeamId$, more than one dataset, short name argument, false", (done: DoneFn) => {
    const argument1: number = 10;
    const argument2: boolean = false;
    const expectedTeamname: string = "TSV Handorf";

    const team: TeamExtended = { documentId: "test_id", id: argument1, nameLong: expectedTeamname, nameShort: "TSV" };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([team, team, team])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: string[] = [expectedTeamname];

    let i: number = 0;
    service["getTeamNameByTeamId$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getTeamNameByTeamId$, emitting twice, short name argument true", (done: DoneFn) => {
    const argument1: number = 10;
    const argument2: boolean = true;
    const expectedTeamname: string = "TSV";

    const team: TeamExtended = { documentId: "test_id", id: argument1, nameLong: "TSV Handorf", nameShort: expectedTeamname };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([team], [team])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: string[] = [expectedTeamname];

    let i: number = 0;
    service["getTeamNameByTeamId$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getTeamNameByTeamId$, emitting twice, no short name argument", (done: DoneFn) => {
    const argument1: number = 10;
    const expectedTeamname: string = "unknown team";

    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: string[] = [expectedTeamname];

    let i: number = 0;
    service["getTeamNameByTeamId$"](argument1).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getActiveUserIds$
  // ---------------------------------------------------------------------------

  it("getActiveUserIds$, users available", (done: DoneFn) => {
    const targetUser1: UserExtended = { documentId: "test_id_1", isAdmin: true, isActive: true, id: "test_user_id_1", displayName: "Username1", email: "test1@mail.com" };
    const targetUser2: UserExtended = { documentId: "test_id_2", isAdmin: true, isActive: true, id: "test_user_id_2", displayName: "Username2", email: "test2@mail.com" };
    const targetUser3: UserExtended = { documentId: "test_id_3", isAdmin: true, isActive: true, id: "test_user_id_3", displayName: "Username3", email: "test3@mail.com" };
    const targetUser4: UserExtended = { documentId: "test_id_4", isAdmin: true, isActive: true, id: "test_user_id_4", displayName: "Username4", email: "test4@mail.com" };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetUser1, targetUser2, targetUser3, targetUser4])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: string[] = [targetUser1.id, targetUser2.id, targetUser3.id, targetUser4.id];

    let i: number = 0;
    service["getActiveUserIds$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getActiveUserIds$, users available, double datasets", (done: DoneFn) => {
    const targetUser1: UserExtended = { documentId: "test_id_1", isAdmin: true, isActive: true, id: "test_user_id_1", displayName: "Username1", email: "test1@mail.com" };
    const targetUser2: UserExtended = { documentId: "test_id_2", isAdmin: true, isActive: true, id: "test_user_id_2", displayName: "Username2", email: "test2@mail.com" };
    const targetUser3: UserExtended = { documentId: "test_id_3", isAdmin: true, isActive: true, id: "test_user_id_3", displayName: "Username3", email: "test3@mail.com" };
    const targetUser4: UserExtended = { documentId: "test_id_4", isAdmin: true, isActive: true, id: "test_user_id_4", displayName: "Username4", email: "test4@mail.com" };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetUser1, targetUser1, targetUser2, targetUser2, targetUser3, targetUser4])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: string[] = [targetUser1.id, targetUser2.id, targetUser3.id, targetUser4.id];

    let i: number = 0;
    service["getActiveUserIds$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getActiveUserIds$, emitting twice", (done: DoneFn) => {
    const targetUser1: UserExtended = { documentId: "test_id_1", isAdmin: true, isActive: true, id: "test_user_id_1", displayName: "Username1", email: "test1@mail.com" };
    const targetUser2: UserExtended = { documentId: "test_id_2", isAdmin: true, isActive: true, id: "test_user_id_2", displayName: "Username2", email: "test2@mail.com" };
    const targetUser3: UserExtended = { documentId: "test_id_3", isAdmin: true, isActive: true, id: "test_user_id_3", displayName: "Username3", email: "test3@mail.com" };
    const targetUser4: UserExtended = { documentId: "test_id_4", isAdmin: true, isActive: true, id: "test_user_id_4", displayName: "Username4", email: "test4@mail.com" };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetUser1, targetUser2, targetUser3, targetUser4], [targetUser1, targetUser2, targetUser3, targetUser4])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: string[] = [targetUser1.id, targetUser2.id, targetUser3.id, targetUser4.id];

    let i: number = 0;
    service["getActiveUserIds$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getActiveUserIds$, no datasets available", (done: DoneFn) => {
    const argument: number = 1;

    const defaultUser: UserExtended = { documentId: "", isAdmin: false, isActive: false, id: "default_id", displayName: "", email: "" };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    service["getActiveUserIds$"]().pipe(
      defaultIfEmpty(defaultUser.id)).subscribe(
        val => {
          expect(val).toEqual(defaultUser.id);
          done();
        }
      );
  });

  // ---------------------------------------------------------------------------
  // getUserDataById$
  // ---------------------------------------------------------------------------

  it("getUserDataById$, one dataset", (done: DoneFn) => {
    const argument: string = "test_user_id";

    const targetUser: UserExtended = { documentId: "test_id_123", isAdmin: true, isActive: true, id: argument, displayName: "Username", email: "test@mail.com" };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetUser])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: UserExtended[] = [targetUser];

    let i: number = 0;
    service["getUserDataById$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getUserDataById$, more than one dataset", (done: DoneFn) => {
    const argument: string = "test_user_id";

    const targetUser: UserExtended = { documentId: "test_id_123", isAdmin: true, isActive: true, id: argument, displayName: "Username", email: "test@mail.com" };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetUser, targetUser])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: UserExtended[] = [targetUser];
    const expectedNumOfValues: number = 1;

    let i: number = 0;
    service["getUserDataById$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getUserDataById$, emitting twice", (done: DoneFn) => {
    const argument: string = "test_user_id";

    const targetUser: UserExtended = { documentId: "test_id_123", isAdmin: true, isActive: true, id: argument, displayName: "Username", email: "test@mail.com" };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetUser], [targetUser])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: UserExtended[] = [targetUser];
    const expectedNumOfValues: number = 1;

    let i: number = 0;
    service["getUserDataById$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getUserDataById$, no dataset available", (done: DoneFn) => {
    const argument: string = "test_user";

    const unknownUser: UserExtended = { documentId: "", isAdmin: false, isActive: false, id: argument, displayName: "unknown user", email: "" };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: UserExtended[] = [unknownUser];

    let i: number = 0;
    service["getUserDataById$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

});
