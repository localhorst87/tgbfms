import { TestBed } from '@angular/core/testing';

import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { FetchBetOverviewService } from './fetch-bet-overview.service';
import { BetOverviewFrameData, BetOverviewUserData } from './output_datastructures';
import { BetExtended, MatchExtended, ResultExtended, UserExtended } from '../Businessrules/basic_datastructures';
import { of, from } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';

describe('FetchBetOverviewService', () => {
  let service: FetchBetOverviewService;
  let appDataSpy: jasmine.SpyObj<AppdataAccessService>;

  let userData: UserExtended[];
  let bets: BetExtended[];
  let results: ResultExtended[];
  let matches: MatchExtended[];
  let expectedFrameValues: BetOverviewFrameData[];
  let expectedUserValues: BetOverviewUserData[]
  let defaultFrameValue: BetOverviewFrameData;
  let defaultUserValue: BetOverviewUserData;

  beforeEach(() => {
    appDataSpy = jasmine.createSpyObj(["getActiveUserIds$", "getUserDataById$", "getResult$", "getBet$", "getTeamNameByTeamId$", "getMatchesByMatchday$"]);

    TestBed.configureTestingModule({
      providers: [
        FetchBetOverviewService, { provide: AppdataAccessService, useValue: appDataSpy }
      ]
    });
    service = TestBed.inject(FetchBetOverviewService);

    userData = [
      {
        documentId: "userdata_document_id_0",
        id: "test_user_id_1",
        email: "user1@email.com",
        displayName: "test_user_id_1",
        isAdmin: false,
        isActive: true
      },
      {
        documentId: "userdata_document_id_0",
        id: "test_user_id_2",
        email: "user1@email.com",
        displayName: "test_user_id_1",
        isAdmin: false,
        isActive: true
      },
    ];

    matches = [
      {
        documentId: "doc_id_0",
        season: 2020,
        matchday: 28,
        matchId: 58815,
        timestamp: 1618240500,
        isFinished: true,
        isTopMatch: false,
        teamIdHome: 211,
        teamIdAway: 93
      },
      {
        documentId: "doc_id_1",
        season: 2020,
        matchday: 28,
        matchId: 58817,
        timestamp: 1618241000,
        isFinished: false,
        isTopMatch: true,
        teamIdHome: 13,
        teamIdAway: 6
      }
    ];

    bets = [
      {
        documentId: "bet_doc_id_0",
        matchId: matches[0].matchId,
        userId: userData[0].id,
        isFixed: true,
        goalsHome: 4,
        goalsAway: 0,
      }, // match 58815, user 1
      {
        documentId: "bet_doc_id_1",
        matchId: matches[0].matchId,
        userId: userData[1].id,
        isFixed: false,
        goalsHome: 1,
        goalsAway: 1,
      }, // match 58815, user 2
      {
        documentId: "bet_doc_id_2",
        matchId: matches[1].matchId,
        userId: userData[0].id,
        isFixed: false,
        goalsHome: 2,
        goalsAway: 3,
      }, // match 58817, user 1
      {
        documentId: "bet_doc_id_3",
        matchId: matches[1].matchId,
        userId: userData[1].id,
        isFixed: true,
        goalsHome: 0,
        goalsAway: 1,
      } // match 58817, user 2
    ];

    results = [
      {
        documentId: "result_document_id_0",
        matchId: matches[0].matchId,
        goalsHome: 2,
        goalsAway: 0
      },
      {
        documentId: "result_document_id_1",
        matchId: matches[1].matchId,
        goalsHome: 0,
        goalsAway: 0
      }
    ];

    expectedFrameValues = [
      // for user 2
      {
        matchId: matches[0].matchId,
        isTopMatch: matches[0].isTopMatch,
        teamNameHome: "team_name_211",
        teamNameAway: "team_name_93",
        resultGoalsHome: results[0].goalsHome,
        resultGoalsAway: results[0].goalsAway,
        isBetFixed: false
      },
      {
        matchId: matches[1].matchId,
        isTopMatch: matches[1].isTopMatch,
        teamNameHome: "team_name_13",
        teamNameAway: "team_name_6",
        resultGoalsHome: results[1].goalsHome,
        resultGoalsAway: results[1].goalsAway,
        isBetFixed: true
      }
    ];

    expectedUserValues = [
      {
        matchId: matches[0].matchId,
        userName: userData[0].displayName,
        betGoalsHome: bets[0].goalsHome,
        betGoalsAway: bets[0].goalsAway
      }, // match 58815, user 1
      {
        matchId: matches[0].matchId,
        userName: userData[1].displayName,
        betGoalsHome: bets[1].goalsHome,
        betGoalsAway: bets[1].goalsAway
      }, // match 58815, user 2
      {
        matchId: matches[1].matchId,
        userName: userData[0].displayName,
        betGoalsHome: bets[2].goalsHome,
        betGoalsAway: bets[2].goalsAway
      }, // match 58817, user 1
      {
        matchId: matches[1].matchId,
        userName: userData[1].displayName,
        betGoalsHome: bets[3].goalsHome,
        betGoalsAway: bets[3].goalsAway
      } // match 58817, user 2
    ];

    defaultFrameValue = {
      matchId: -1,
      isTopMatch: false,
      teamNameHome: "",
      teamNameAway: "",
      resultGoalsHome: -1,
      resultGoalsAway: -1,
      isBetFixed: false
    };

    defaultUserValue = {
      matchId: -1,
      userName: "",
      betGoalsHome: -1,
      betGoalsAway: -1
    };

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // fetchFrameDataByMatchday$
  // ---------------------------------------------------------------------------

  it('fetchFrameDataByMatchday$, matches available', (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 28;
    const argument3: string = "test_user_id";

    appDataSpy.getMatchesByMatchday$.and.returnValue(from(matches));
    spyOn<any>(service, "makeFrameData$")
      .withArgs(matches[0], argument3).and.returnValue(of(expectedFrameValues[0]))
      .withArgs(matches[1], argument3).and.returnValue(of(expectedFrameValues[1]));

    let i: number = 0;
    service["fetchFrameDataByMatchday$"](argument1, argument2, argument3).subscribe(
      val => {
        expect(val).toEqual(expectedFrameValues[i++]);
        done();
      }
    );
  });

  it('fetchFrameDataByMatchday$, emitting FrameData twice', (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 28;
    const argument3: string = "test_user_id";

    appDataSpy.getMatchesByMatchday$.and.returnValue(from(matches));
    spyOn<any>(service, "makeFrameData$")
      .withArgs(matches[0], argument3).and.returnValue(of(expectedFrameValues[0], expectedFrameValues[0]))
      .withArgs(matches[1], argument3).and.returnValue(of(expectedFrameValues[1], expectedFrameValues[1]));

    let i: number = 0;
    service["fetchFrameDataByMatchday$"](argument1, argument2, argument3).subscribe(
      val => {
        expect(val).toEqual(expectedFrameValues[i++]);
        done();
      }
    );
  });

  it('fetchFrameDataByMatchday$, no matches available', (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 28;
    const argument3: string = "test_user_id";

    appDataSpy.getMatchesByMatchday$.and.returnValue(from([]));

    service["fetchFrameDataByMatchday$"](argument1, argument2, argument3).pipe(
      defaultIfEmpty(defaultFrameValue)).subscribe(
        val => {
          expect(val).toEqual(defaultFrameValue);
          done();
        }
      );
  });

  // ---------------------------------------------------------------------------
  // fetchUserBetDataByMatchday$
  // ---------------------------------------------------------------------------

  it('fetchUserBetDataByMatchday$, bets available', (done: DoneFn) => {
    const argument: number = matches[0].matchId;

    spyOn<any>(service, "getAllUserBets$").and.returnValues(from(bets));
    spyOn<any>(service, "makeBetData$")
      .withArgs(bets[0]).and.returnValue(of(expectedUserValues[0]))
      .withArgs(bets[1]).and.returnValue(of(expectedUserValues[1]))
      .withArgs(bets[2]).and.returnValue(of(expectedUserValues[2]))
      .withArgs(bets[3]).and.returnValue(of(expectedUserValues[3]));

    let i: number = 0;
    service["fetchUserBetDataByMatchday$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedUserValues[i++]);
        done();
      }
    );
  });

  it('fetchUserBetDataByMatchday$, emitting BetData twice', (done: DoneFn) => {
    const argument: number = matches[0].matchId;

    spyOn<any>(service, "getAllUserBets$").and.returnValues(from(bets));
    spyOn<any>(service, "makeBetData$")
      .withArgs(bets[0]).and.returnValue(of(expectedUserValues[0]))
      .withArgs(bets[1]).and.returnValue(of(expectedUserValues[1]))
      .withArgs(bets[2]).and.returnValue(of(expectedUserValues[2]))
      .withArgs(bets[3]).and.returnValue(of(expectedUserValues[3]));

    let i: number = 0;
    service["fetchUserBetDataByMatchday$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedUserValues[i++]);
        done();
      }
    );
  });

  it('fetchFrameDataByMatchday$, no bets available', (done: DoneFn) => {
    const argument: number = matches[0].matchId;

    spyOn<any>(service, "getAllUserBets$").and.returnValues(from([]));

    service["fetchUserBetDataByMatchday$"](argument).pipe(
      defaultIfEmpty(defaultUserValue)).subscribe(
        val => {
          expect(val).toEqual(defaultUserValue);
          done();
        }
      );
  });

  // ---------------------------------------------------------------------------
  // makeFrameData$
  // ---------------------------------------------------------------------------

  it('makeFrameData$, bets available', (done: DoneFn) => {
    const argument1: MatchExtended = matches[0]; // match 58815
    const argument2: string = bets[1].userId; // user 2

    appDataSpy.getTeamNameByTeamId$
      .withArgs(211).and.returnValue(of("team_name_211"))
      .withArgs(93).and.returnValue(of("team_name_93"))
      .withArgs(13).and.returnValue(of("team_name_13"))
      .withArgs(6).and.returnValue(of("team_name_6"));

    appDataSpy.getBet$
      .withArgs(bets[0].matchId, bets[0].userId).and.returnValue(of(bets[0]))
      .withArgs(bets[1].matchId, bets[1].userId).and.returnValue(of(bets[1]))
      .withArgs(bets[2].matchId, bets[2].userId).and.returnValue(of(bets[2]))
      .withArgs(bets[3].matchId, bets[3].userId).and.returnValue(of(bets[3]));

    appDataSpy.getResult$
      .withArgs(results[0].matchId).and.returnValue(of(results[0]))
      .withArgs(results[1].matchId).and.returnValue(of(results[1]));

    service["makeFrameData$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedFrameValues[0]);
        done();
      }
    );
  });

  it('makeFrameData$, observables emitting more than one value', (done: DoneFn) => {
    const argument1: MatchExtended = matches[0]; // match 58815
    const argument2: string = bets[1].userId; // user 2

    appDataSpy.getTeamNameByTeamId$
      .withArgs(211).and.returnValue(of("team_name_211", "team_name_211"))
      .withArgs(93).and.returnValue(of("team_name_93", "team_name_93", "team_name_93"))
      .withArgs(13).and.returnValue(of("team_name_13", "team_name_13"))
      .withArgs(6).and.returnValue(of("team_name_6", "team_name_6", "team_name_6"));

    appDataSpy.getBet$
      .withArgs(bets[0].matchId, bets[0].userId).and.returnValue(of(bets[1], bets[0]))
      .withArgs(bets[1].matchId, bets[1].userId).and.returnValue(of(bets[1], bets[1]))
      .withArgs(bets[2].matchId, bets[2].userId).and.returnValue(of(bets[0], bets[1], bets[2]))
      .withArgs(bets[3].matchId, bets[3].userId).and.returnValue(of(bets[3]));

    appDataSpy.getResult$
      .withArgs(results[0].matchId).and.returnValue(of(results[0], results[0]))
      .withArgs(results[1].matchId).and.returnValue(of(results[0], results[1]));

    service["makeFrameData$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedFrameValues[0]);
        done();
      }
    );
  });

  it('makeFrameData$, at least one observable not emitting', (done: DoneFn) => {
    const argument1: MatchExtended = matches[0]; // match 58815
    const argument2: string = bets[1].userId; // user 2

    appDataSpy.getTeamNameByTeamId$
      .withArgs(211).and.returnValue(of())
      .withArgs(93).and.returnValue(of("team_name_93"))
      .withArgs(13).and.returnValue(of("team_name_13"))
      .withArgs(6).and.returnValue(of());

    appDataSpy.getBet$
      .withArgs(bets[0].matchId, bets[0].userId).and.returnValue(of(bets[0]))
      .withArgs(bets[1].matchId, bets[1].userId).and.returnValue(of())
      .withArgs(bets[2].matchId, bets[2].userId).and.returnValue(of(bets[2]))
      .withArgs(bets[3].matchId, bets[3].userId).and.returnValue(of(bets[3]));

    appDataSpy.getResult$
      .withArgs(results[0].matchId).and.returnValue(of(results[0]))
      .withArgs(results[1].matchId).and.returnValue(of(results[1]));

    service["makeFrameData$"](argument1, argument2).pipe(
      defaultIfEmpty(defaultFrameValue)).subscribe(
        val => {
          expect(val).toEqual(defaultFrameValue);
          done();
        }
      );
  });

  // ---------------------------------------------------------------------------
  // getAllUserBets$
  // ---------------------------------------------------------------------------

  it('getAllUserBets$, bets available', (done: DoneFn) => {
    const argument: number = matches[0].matchId;

    appDataSpy.getActiveUserIds$.and.returnValue(of(userData[0].id, userData[1].id));
    appDataSpy.getBet$
      .withArgs(matches[0].matchId, userData[0].id).and.returnValue(of(bets[0]))
      .withArgs(matches[0].matchId, userData[1].id).and.returnValue(of(bets[1]))
      .withArgs(matches[1].matchId, userData[0].id).and.returnValue(of(bets[2]))
      .withArgs(matches[1].matchId, userData[1].id).and.returnValue(of(bets[3]));

    const expectedValues: BetExtended[] = [bets[0], bets[1]];

    let i: number = 0;
    service["getAllUserBets$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('getAllUserBets$, bets emitted twice', (done: DoneFn) => {
    const argument: number = matches[0].matchId;

    appDataSpy.getActiveUserIds$.and.returnValue(of(userData[0].id, userData[1].id));
    appDataSpy.getBet$
      .withArgs(matches[0].matchId, userData[0].id).and.returnValue(of(bets[0], bets[0]))
      .withArgs(matches[0].matchId, userData[1].id).and.returnValue(of(bets[1], bets[1]))
      .withArgs(matches[1].matchId, userData[0].id).and.returnValue(of(bets[2], bets[2]))
      .withArgs(matches[1].matchId, userData[1].id).and.returnValue(of(bets[3], bets[3]));

    const expectedValues: BetExtended[] = [bets[0], bets[1]];

    let i: number = 0;
    service["getAllUserBets$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('getAllUserBets$, no bets emitted', (done: DoneFn) => {
    const argument: number = matches[0].matchId;

    appDataSpy.getActiveUserIds$.and.returnValue(of(userData[0].id, userData[1].id));
    appDataSpy.getBet$
      .withArgs(matches[0].matchId, userData[0].id).and.returnValue(of())
      .withArgs(matches[0].matchId, userData[1].id).and.returnValue(of())
      .withArgs(matches[1].matchId, userData[0].id).and.returnValue(of())
      .withArgs(matches[1].matchId, userData[1].id).and.returnValue(of());

    const defaultBet: BetExtended = {
      documentId: "",
      matchId: -1,
      userId: "",
      isFixed: false,
      goalsHome: -1,
      goalsAway: -1
    };

    service["getAllUserBets$"](argument).pipe(
      defaultIfEmpty(defaultBet)).subscribe(
        val => {
          expect(val).toEqual(defaultBet);
          done();
        }
      );
  });

  // ---------------------------------------------------------------------------
  // makeBetData$
  // ---------------------------------------------------------------------------

  it('makeBetData$, data available', (done: DoneFn) => {
    const argument: BetExtended = bets[3];

    appDataSpy.getUserDataById$
      .withArgs(userData[0].id).and.returnValue(of(userData[0]))
      .withArgs(userData[1].id).and.returnValue(of(userData[1]));

    service["makeBetData$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedUserValues[3]);
        done();
      }
    );
  });

  it('makeBetData$, data not available', (done: DoneFn) => {
    const argument: BetExtended = bets[3];

    appDataSpy.getUserDataById$
      .withArgs(userData[0].id).and.returnValue(of())
      .withArgs(userData[1].id).and.returnValue(of());

    service["makeBetData$"](argument).pipe(
      defaultIfEmpty(defaultUserValue)).subscribe(
        val => {
          expect(val).toEqual(defaultUserValue);
          done();
        }
      );
  });

});
