import { TestBed } from '@angular/core/testing';

import { AppdataAccessFirestoreService } from './appdata-access-firestore.service';
// import { AppdataAccessService } from './appdata-access.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { of } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';
import { COLLECTION_NAME_BETS, COLLECTION_NAME_MATCHES, COLLECTION_NAME_RESULTS, COLLECTION_NAME_TEAMS, COLLECTION_NAME_USERS } from './appdata-access-firestore.service';
import { Bet, Result, Match, User, Team, SeasonBet, SeasonResult } from '../Businessrules/basic_datastructures';
import { MatchdayScoreSnapshot, SyncTime } from './import_datastructures';

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

    const targetBet: Bet = { documentId: "test_id_123", matchId: argument1, isFixed: true, userId: argument2, goalsHome: 2, goalsAway: 1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetBet])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Bet[] = [targetBet];

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

    const targetBet: Bet = { documentId: "test_id_123", matchId: argument1, isFixed: true, userId: argument2, goalsHome: 2, goalsAway: 1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetBet, targetBet])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Bet[] = [targetBet];
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

    const targetBet: Bet = { documentId: "test_id_123", matchId: argument1, isFixed: true, userId: argument2, goalsHome: 2, goalsAway: 1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetBet], [targetBet])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Bet[] = [targetBet];
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

    const unknownBet: Bet = { documentId: "", matchId: argument1, isFixed: false, userId: argument2, goalsHome: -1, goalsAway: -1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Bet[] = [unknownBet];

    let i: number = 0;
    service["getBet$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getSeasonBet$
  // ---------------------------------------------------------------------------

  it("getSeasonBet$, data available", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 1;
    const argument3: string = "test_user_id";

    const targetBet: SeasonBet = {
      documentId: "test_doc_id_3",
      season: argument1,
      userId: argument3,
      isFixed: true,
      place: argument2,
      teamId: 101,
    };

    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetBet])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValues: SeasonBet[] = [targetBet];

    let i: number = 0;
    service["getSeasonBet$"](argument1, argument2, argument3).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it("getSeasonBet$, same dataset twice", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 1;
    const argument3: string = "test_user_id";

    const targetBet: SeasonBet = {
      documentId: "test_doc_id_3",
      season: argument1,
      userId: argument3,
      isFixed: true,
      place: argument2,
      teamId: 101,
    };

    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetBet, targetBet])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValues: SeasonBet[] = [targetBet];

    let i: number = 0;
    service["getSeasonBet$"](argument1, argument2, argument3).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it("getSeasonBet$, emitting twice", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 2;
    const argument3: string = "test_user_id";

    const targetBet: SeasonBet = {
      documentId: "test_doc_id_3",
      season: argument1,
      userId: argument3,
      isFixed: true,
      place: argument2,
      teamId: 101,
    };

    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetBet], [targetBet])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValues: SeasonBet[] = [targetBet];

    let i: number = 0;
    service["getSeasonBet$"](argument1, argument2, argument3).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it("getSeasonBet$, no dataset available", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = -2;
    const argument3: string = "test_user_id";

    const targetBet: SeasonBet = {
      documentId: "",
      season: argument1,
      userId: argument3,
      isFixed: false,
      place: argument2,
      teamId: -1
    };

    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValues: SeasonBet[] = [targetBet];

    let i: number = 0;
    service["getSeasonBet$"](argument1, argument2, argument3).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getSeasonResults$
  // ---------------------------------------------------------------------------

  it("getSeasonResult$, data available", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = -1;

    const targetResult: SeasonResult = {
      documentId: "test_doc_id_2",
      season: argument1,
      place: argument2,
      teamId: 11,
    };

    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetResult])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValues: SeasonResult[] = [targetResult];

    let i: number = 0;
    service["getSeasonResult$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it("getSeasonResult$, same data twice available", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = -1;

    const targetResult: SeasonResult = {
      documentId: "test_doc_id_2",
      season: argument1,
      place: argument2,
      teamId: 11,
    };

    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetResult, targetResult])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValues: SeasonResult[] = [targetResult];

    let i: number = 0;
    service["getSeasonResult$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it("getSeasonResult$, data emitted twice", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = -1;

    const targetResult: SeasonResult = {
      documentId: "test_doc_id_2",
      season: argument1,
      place: argument2,
      teamId: 11,
    };

    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetResult], [targetResult])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValues: SeasonResult[] = [targetResult];

    let i: number = 0;
    service["getSeasonResult$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it("getSeasonResult$, no data available", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = -1;

    const targetResult: SeasonResult = {
      documentId: "",
      season: argument1,
      place: argument2,
      teamId: -1,
    };

    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValues: SeasonResult[] = [targetResult];

    let i: number = 0;
    service["getSeasonResult$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getResult$
  // ---------------------------------------------------------------------------

  it("getResult$, one dataset", (done: DoneFn) => {
    const argument: number = 9999;

    const targetResult: Result = { documentId: "test_id_123", matchId: argument, goalsHome: 2, goalsAway: 1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetResult])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Result[] = [targetResult];

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

    const targetResult: Result = { documentId: "test_id_123", matchId: argument, goalsHome: 2, goalsAway: 1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetResult, targetResult])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Result[] = [targetResult];

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

    const targetResult: Result = { documentId: "test_id_123", matchId: argument, goalsHome: 2, goalsAway: 1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetResult], [targetResult])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Result[] = [targetResult];

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

    const unknownResult: Result = { documentId: "", matchId: argument, goalsHome: -1, goalsAway: -1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Result[] = [unknownResult];

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

    const match1: Match = { documentId: "test_id_1", season: argument1, matchday: argument2, matchId: 1, timestamp: 1617640000, isFinished: true, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const match2: Match = { documentId: "test_id_2", season: argument1, matchday: argument2, matchId: 2, timestamp: 1617645000, isFinished: false, isTopMatch: false, teamIdHome: 31, teamIdAway: 26 };
    const match3: Match = { documentId: "test_id_3", season: argument1, matchday: argument2, matchId: 3, timestamp: 1617650000, isFinished: false, isTopMatch: false, teamIdHome: 5, teamIdAway: 2 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([match1, match2, match3])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Match[] = [match1, match2, match3];

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

    const match1: Match = { documentId: "test_id_1", season: argument1, matchday: argument2, matchId: 1, timestamp: 1617640000, isFinished: true, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const match2: Match = { documentId: "test_id_2", season: argument1, matchday: argument2, matchId: 2, timestamp: 1617645000, isFinished: false, isTopMatch: false, teamIdHome: 31, teamIdAway: 26 };
    const match3: Match = { documentId: "test_id_3", season: argument1, matchday: argument2, matchId: 3, timestamp: 1617650000, isFinished: false, isTopMatch: false, teamIdHome: 5, teamIdAway: 2 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([match1, match2, match2, match3, match3])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Match[] = [match1, match2, match3];

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

    const match1: Match = { documentId: "test_id_1", season: argument1, matchday: argument2, matchId: 1, timestamp: 1617640000, isFinished: true, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const match2: Match = { documentId: "test_id_2", season: argument1, matchday: argument2, matchId: 2, timestamp: 1617645000, isFinished: false, isTopMatch: false, teamIdHome: 31, teamIdAway: 26 };
    const match3: Match = { documentId: "test_id_3", season: argument1, matchday: argument2, matchId: 3, timestamp: 1617650000, isFinished: false, isTopMatch: false, teamIdHome: 5, teamIdAway: 2 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([match1, match2, match3], [match1, match2, match3])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Match[] = [match1, match2, match3];

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

    const defaultValue: Match = { documentId: "default", season: argument1, matchday: argument2, matchId: -1, timestamp: -1, isFinished: false, isTopMatch: false, teamIdHome: -1, teamIdAway: -1 };
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

    const match1: Match = { documentId: "test_id_1", season: 2020, matchday: 28, matchId: 1, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const match2: Match = { documentId: "test_id_2", season: 2020, matchday: 28, matchId: 2, timestamp: 1617645000, isFinished: false, isTopMatch: false, teamIdHome: 31, teamIdAway: 26 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([match1, match2])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Match[] = [match1, match2];

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

    const match1: Match = { documentId: "test_id_1", season: 2020, matchday: 28, matchId: 1, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([match1, match1, match1])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Match[] = [match1];

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

    const match1: Match = { documentId: "test_id_1", season: 2020, matchday: 28, matchId: 1, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const match2: Match = { documentId: "test_id_2", season: 2020, matchday: 28, matchId: 2, timestamp: 1617645000, isFinished: false, isTopMatch: false, teamIdHome: 31, teamIdAway: 26 };
    const match3: Match = { documentId: "test_id_3", season: 2020, matchday: 29, matchId: 3, timestamp: 1617650000, isFinished: false, isTopMatch: true, teamIdHome: 5, teamIdAway: 2 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([match1, match2, match3], [match1, match2, match3])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Match[] = [match1, match2, match3];

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

    const defaultValue: Match = { documentId: "default", season: -1, matchday: -1, matchId: -1, timestamp: -1, isFinished: false, isTopMatch: false, teamIdHome: -1, teamIdAway: -1 };
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

    const match: Match = { documentId: "test_id", season: 2020, matchday: expectedMatchday, matchId: argument, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
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

    const match: Match = { documentId: "test_id", season: 2020, matchday: expectedMatchday, matchId: argument, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
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

    const match: Match = { documentId: "test_id", season: 2020, matchday: expectedMatchday, matchId: argument, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
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
    const argument: number = 2020;

    const targetMatch: Match = { documentId: "test_id_1", season: 2020, matchday: 28, matchId: 1, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetMatch])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Match[] = [targetMatch];

    let i: number = 0;
    service["getNextMatch$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getNextMatch$, emitting twice", (done: DoneFn) => {
    const argument: number = 2020;

    const targetMatch: Match = { documentId: "test_id_1", season: 2020, matchday: 28, matchId: 1, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetMatch], [targetMatch])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Match[] = [targetMatch];

    let i: number = 0;
    service["getNextMatch$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getNextMatch$, no dataset available", (done: DoneFn) => {
    const argument: number = 2020;

    const unknownMatch: Match = { documentId: "", season: -1, matchday: -1, matchId: -1, timestamp: -1, isFinished: false, isTopMatch: false, teamIdHome: -1, teamIdAway: -1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Match[] = [unknownMatch];

    let i: number = 0;
    service["getNextMatch$"](argument).subscribe(
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
    const argument: number = 2020;

    const targetMatch: Match = { documentId: "test_id_1", season: 2020, matchday: 28, matchId: 1, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetMatch])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Match[] = [targetMatch];

    let i: number = 0;
    service["getLastMatch$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getLastMatch$, emitting twice", (done: DoneFn) => {
    const argument: number = 2020;

    const targetMatch: Match = { documentId: "test_id_1", season: 2020, matchday: 28, matchId: 1, timestamp: 1617640000, isFinished: false, isTopMatch: true, teamIdHome: 10, teamIdAway: 20 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetMatch], [targetMatch])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Match[] = [targetMatch];

    let i: number = 0;
    service["getLastMatch$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getLastMatch$, no dataset available", (done: DoneFn) => {
    const argument: number = 2020;

    const unknownMatch: Match = { documentId: "", season: -1, matchday: -1, matchId: -1, timestamp: -1, isFinished: false, isTopMatch: false, teamIdHome: -1, teamIdAway: -1 };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Match[] = [unknownMatch];

    let i: number = 0;
    service["getLastMatch$"](argument).subscribe(
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

    const team: Team = { documentId: "test_id", id: argument1, nameLong: expectedTeamname, nameShort: "TSV" };
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

    const team: Team = { documentId: "test_id", id: argument1, nameLong: "TSV Handorf", nameShort: expectedTeamname };
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

    const team: Team = { documentId: "test_id", id: argument1, nameLong: expectedTeamname, nameShort: "TSV" };
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

    const team: Team = { documentId: "test_id", id: argument1, nameLong: "TSV Handorf", nameShort: expectedTeamname };
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
  // getTeamByTeamId$
  // ---------------------------------------------------------------------------

  it("getTeamByTeamId$, dataset available", (done: DoneFn) => {
    const argument: number = 10;
    const requestedTeam: Team = {
      documentId: "test_doc_id",
      id: argument,
      nameLong: "TSV Handorf",
      nameShort: "TSV"
    };

    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([requestedTeam])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: Team = requestedTeam;

    service["getTeamByTeamId$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getActiveUserIds$
  // ---------------------------------------------------------------------------

  it("getActiveUserIds$, users available", (done: DoneFn) => {
    const targetUser1: User = { documentId: "test_id_1", isAdmin: true, isActive: true, id: "test_user_id_1", displayName: "Username1", email: "test1@mail.com" };
    const targetUser2: User = { documentId: "test_id_2", isAdmin: true, isActive: true, id: "test_user_id_2", displayName: "Username2", email: "test2@mail.com" };
    const targetUser3: User = { documentId: "test_id_3", isAdmin: true, isActive: true, id: "test_user_id_3", displayName: "Username3", email: "test3@mail.com" };
    const targetUser4: User = { documentId: "test_id_4", isAdmin: true, isActive: true, id: "test_user_id_4", displayName: "Username4", email: "test4@mail.com" };
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
    const targetUser1: User = { documentId: "test_id_1", isAdmin: true, isActive: true, id: "test_user_id_1", displayName: "Username1", email: "test1@mail.com" };
    const targetUser2: User = { documentId: "test_id_2", isAdmin: true, isActive: true, id: "test_user_id_2", displayName: "Username2", email: "test2@mail.com" };
    const targetUser3: User = { documentId: "test_id_3", isAdmin: true, isActive: true, id: "test_user_id_3", displayName: "Username3", email: "test3@mail.com" };
    const targetUser4: User = { documentId: "test_id_4", isAdmin: true, isActive: true, id: "test_user_id_4", displayName: "Username4", email: "test4@mail.com" };
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
    const targetUser1: User = { documentId: "test_id_1", isAdmin: true, isActive: true, id: "test_user_id_1", displayName: "Username1", email: "test1@mail.com" };
    const targetUser2: User = { documentId: "test_id_2", isAdmin: true, isActive: true, id: "test_user_id_2", displayName: "Username2", email: "test2@mail.com" };
    const targetUser3: User = { documentId: "test_id_3", isAdmin: true, isActive: true, id: "test_user_id_3", displayName: "Username3", email: "test3@mail.com" };
    const targetUser4: User = { documentId: "test_id_4", isAdmin: true, isActive: true, id: "test_user_id_4", displayName: "Username4", email: "test4@mail.com" };
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

    const defaultUser: User = { documentId: "", isAdmin: false, isActive: false, id: "default_id", displayName: "", email: "" };
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

    const targetUser: User = { documentId: "test_id_123", isAdmin: true, isActive: true, id: argument, displayName: "Username", email: "test@mail.com" };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetUser])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: User[] = [targetUser];

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

    const targetUser: User = { documentId: "test_id_123", isAdmin: true, isActive: true, id: argument, displayName: "Username", email: "test@mail.com" };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetUser, targetUser])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: User[] = [targetUser];
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

    const targetUser: User = { documentId: "test_id_123", isAdmin: true, isActive: true, id: argument, displayName: "Username", email: "test@mail.com" };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetUser], [targetUser])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: User[] = [targetUser];
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

    const unknownUser: User = { documentId: "", isAdmin: false, isActive: false, id: argument, displayName: "unknown user", email: "" };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: User[] = [unknownUser];

    let i: number = 0;
    service["getUserDataById$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getMatchdayScoreSnapshot$
  // ---------------------------------------------------------------------------

  it("getMatchdayScoreSnapshot$, one dataset", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 17;

    const targetSnap: MatchdayScoreSnapshot = {
      documentId: "target_id",
      season: argument1,
      matchday: argument2,
      userId: ["test_user_id_0", "test_user_id_1"],
      points: [9, 8],
      matches: [6, 5],
      results: [2, 1],
      extraTop: [1, 0],
      extraOutsider: [0, 2],
      extraSeason: [0, 0]
    };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetSnap])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValues: MatchdayScoreSnapshot[] = [targetSnap];

    let i: number = 0;
    service["getMatchdayScoreSnapshot$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it("getMatchdayScoreSnapshot$, dataset available twice", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 17;

    const targetSnap: MatchdayScoreSnapshot = {
      documentId: "target_id",
      season: argument1,
      matchday: argument2,
      userId: ["test_user_id_0", "test_user_id_1"],
      points: [9, 8],
      matches: [6, 5],
      results: [2, 1],
      extraTop: [1, 0],
      extraOutsider: [0, 2],
      extraSeason: [0, 0]
    };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetSnap, targetSnap])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValues: MatchdayScoreSnapshot[] = [targetSnap];

    let i: number = 0;
    service["getMatchdayScoreSnapshot$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it("getMatchdayScoreSnapshot$, dataset emitted twice", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 17;

    const targetSnap: MatchdayScoreSnapshot = {
      documentId: "target_id",
      season: argument1,
      matchday: argument2,
      userId: ["test_user_id_0", "test_user_id_1"],
      points: [9, 8],
      matches: [6, 5],
      results: [2, 1],
      extraTop: [1, 0],
      extraOutsider: [0, 2],
      extraSeason: [0, 0]
    };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetSnap], [targetSnap])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValues: MatchdayScoreSnapshot[] = [targetSnap];

    let i: number = 0;
    service["getMatchdayScoreSnapshot$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it("getMatchdayScoreSnapshot$, no dataset available", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 17;

    const unknownSnap: MatchdayScoreSnapshot = {
      documentId: "",
      season: argument1,
      matchday: argument2,
      userId: [],
      points: [],
      matches: [],
      results: [],
      extraTop: [],
      extraOutsider: [],
      extraSeason: []
    };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValues: MatchdayScoreSnapshot[] = [unknownSnap];

    let i: number = 0;
    service["getMatchdayScoreSnapshot$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getSyncTime$
  // ---------------------------------------------------------------------------

  it("getSyncTime$, one dataset", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 23;

    const targetSyncTime: SyncTime = {
      documentId: "doc_id_0",
      season: argument1,
      matchday: argument2,
      timestamp: 1619980993
    };

    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetSyncTime])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: SyncTime[] = [targetSyncTime];

    let i: number = 0;
    service["getSyncTime$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getSyncTime$, more than one dataset", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 23;

    const targetSyncTime: SyncTime = {
      documentId: "doc_id_0",
      season: argument1,
      matchday: argument2,
      timestamp: 1619980993
    };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetSyncTime, targetSyncTime])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: SyncTime[] = [targetSyncTime];

    let i: number = 0;
    service["getSyncTime$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getSyncTime$, emitting twice", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 23;

    const targetSyncTime: SyncTime = {
      documentId: "doc_id_0",
      season: argument1,
      matchday: argument2,
      timestamp: 1619980993
    };
    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([targetSyncTime], [targetSyncTime])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: SyncTime[] = [targetSyncTime];

    let i: number = 0;
    service["getSyncTime$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("getSyncTime$, no dataset available", (done: DoneFn) => {
    const argument: string = "test_user";

    const argument1: number = 2020;
    const argument2: number = 23;

    const collectionStub: any = { valueChanges: jasmine.createSpy("valueChanges").and.returnValue(of([])) };
    const firestoreStub: any = { collection: jasmine.createSpy("collection").and.returnValue(collectionStub) };

    TestBed.configureTestingModule({ providers: [AppdataAccessFirestoreService, { provide: AngularFirestore, useValue: firestoreStub }] });
    service = TestBed.inject(AppdataAccessFirestoreService);

    const expectedValue: SyncTime[] = [{ documentId: "", season: argument1, matchday: argument2, timestamp: -1 }];

    let i: number = 0;
    service["getSyncTime$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

});
