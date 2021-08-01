import { TestBed } from '@angular/core/testing';

import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { PointCalculatorService } from '../Businessrules/point-calculator.service';
import { FetchBetOverviewService } from './fetch-bet-overview.service';
import { BetOverviewFrameData, BetOverviewUserData, SeasonBetOverviewUserData, SeasonBetOverviewFrameData } from './output_datastructures';
import { Bet, Match, Result, SeasonBet, SeasonResult, User } from '../Businessrules/basic_datastructures';
import { POINTS_ADDED_OUTSIDER_TWO, POINTS_ADDED_OUTSIDER_ONE } from '../Businessrules/rule_defined_values';
import { of, from } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';

describe('FetchBetOverviewService', () => {
  let service: FetchBetOverviewService;
  let appDataSpy: jasmine.SpyObj<AppdataAccessService>;
  let pointCalcSpy: jasmine.SpyObj<PointCalculatorService>;

  let userData: User[];
  let bets: Bet[];
  let results: Result[];
  let matches: Match[];
  let seasonBets: SeasonBet[];
  let seasonResults: SeasonResult[];
  let teamNames: string[];
  let expectedFrameValues: BetOverviewFrameData[];
  let expectedUserValues: BetOverviewUserData[];
  let expectedSeasonFrameValues: SeasonBetOverviewFrameData[];
  let expectedSeasonUserData: SeasonBetOverviewUserData[];
  let defaultFrameValue: BetOverviewFrameData;
  let defaultUserValue: BetOverviewUserData;

  beforeEach(() => {
    appDataSpy = jasmine.createSpyObj(["getActiveUserIds$", "getUserDataById$", "getResult$", "getBet$", "getTeamNameByTeamId$", "getMatchesByMatchday$", "getSeasonBet$", "getSeasonResult$"]);
    pointCalcSpy = jasmine.createSpyObj(["getPotentialOutsiderPoints"]);
    TestBed.configureTestingModule({
      providers: [
        FetchBetOverviewService,
        { provide: AppdataAccessService, useValue: appDataSpy },
        { provide: PointCalculatorService, useValue: pointCalcSpy },
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

    seasonBets = [
      {
        documentId: "doc_id_0",
        season: 2021,
        userId: userData[0].id,
        isFixed: true,
        place: 1,
        teamId: 45
      },
      {
        documentId: "doc_id_1",
        season: 2021,
        userId: userData[0].id,
        isFixed: true,
        place: 2,
        teamId: 76
      },
      {
        documentId: "doc_id_2",
        season: 2021,
        userId: userData[0].id,
        isFixed: true,
        place: -3,
        teamId: 122
      },
      {
        documentId: "doc_id_3",
        season: 2021,
        userId: userData[0].id,
        isFixed: true,
        place: -2,
        teamId: 70
      },
      {
        documentId: "doc_id_4",
        season: 2021,
        userId: userData[0].id,
        isFixed: true,
        place: -1,
        teamId: 99
      },
      {
        documentId: "doc_id_5",
        season: 2021,
        userId: userData[1].id,
        isFixed: true,
        place: 1,
        teamId: 32
      },
      {
        documentId: "doc_id_6",
        season: 2021,
        userId: userData[1].id,
        isFixed: true,
        place: 2,
        teamId: 3
      },
      {
        documentId: "doc_id_7",
        season: 2021,
        userId: userData[1].id,
        isFixed: true,
        place: -3,
        teamId: 23
      },
      {
        documentId: "doc_id_8",
        season: 2021,
        userId: userData[1].id,
        isFixed: true,
        place: -2,
        teamId: 87
      },
      {
        documentId: "doc_id_9",
        season: 2021,
        userId: userData[1].id,
        isFixed: true,
        place: -1,
        teamId: 199
      },
    ];

    teamNames = [
      "team_name_45",
      "team_name_76",
      "team_name_122",
      "team_name_70",
      "team_name_99",
      "team_name_32",
      "team_name_3",
      "team_name_23",
      "team_name_87",
      "team_name_199"
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

    seasonResults = [
      {
        documentId: "result_document_id_0",
        season: 2021,
        place: 1,
        teamId: 101
      },
      {
        documentId: "result_document_id_1",
        season: 2021,
        place: 2,
        teamId: 102
      },
      {
        documentId: "result_document_id_2",
        season: 2021,
        place: -3,
        teamId: 203
      },
      {
        documentId: "result_document_id_3",
        season: 2021,
        place: -2,
        teamId: 202
      },
      {
        documentId: "result_document_id_4",
        season: 2021,
        place: -1,
        teamId: 201
      }
    ];

    expectedFrameValues = [
      // for user 2
      {
        matchId: matches[0].matchId,
        matchDate: new Date(matches[0].timestamp * 1000),
        isTopMatch: matches[0].isTopMatch,
        teamNameHome: "team_name_211",
        teamNameAway: "team_name_93",
        resultGoalsHome: results[0].goalsHome,
        resultGoalsAway: results[0].goalsAway,
        isBetFixed: false
      },
      {
        matchId: matches[1].matchId,
        matchDate: new Date(matches[1].timestamp * 1000),
        isTopMatch: matches[1].isTopMatch,
        teamNameHome: "team_name_13",
        teamNameAway: "team_name_6",
        resultGoalsHome: results[1].goalsHome,
        resultGoalsAway: results[1].goalsAway,
        isBetFixed: true
      }
    ];

    expectedSeasonFrameValues = [
      {
        place: 1,
        resultTeamName: "team_name_101",
        isBetFixed: true,
      },
      {
        place: 2,
        resultTeamName: "team_name_102",
        isBetFixed: true,
      },
      {
        place: -3,
        resultTeamName: "team_name_203",
        isBetFixed: true,
      },
      {
        place: -2,
        resultTeamName: "team_name_202",
        isBetFixed: true,
      },
      {
        place: -1,
        resultTeamName: "team_name_201",
        isBetFixed: true,
      }
    ];

    expectedUserValues = [
      {
        matchId: matches[0].matchId,
        userName: userData[0].displayName,
        betGoalsHome: bets[0].goalsHome,
        betGoalsAway: bets[0].goalsAway,
        possibleOutsiderPoints: POINTS_ADDED_OUTSIDER_ONE
      }, // match 58815, user 1
      {
        matchId: matches[0].matchId,
        userName: userData[1].displayName,
        betGoalsHome: bets[1].goalsHome,
        betGoalsAway: bets[1].goalsAway,
        possibleOutsiderPoints: POINTS_ADDED_OUTSIDER_ONE
      }, // match 58815, user 2
      {
        matchId: matches[1].matchId,
        userName: userData[0].displayName,
        betGoalsHome: bets[2].goalsHome,
        betGoalsAway: bets[2].goalsAway,
        possibleOutsiderPoints: POINTS_ADDED_OUTSIDER_TWO
      }, // match 58817, user 1
      {
        matchId: matches[1].matchId,
        userName: userData[1].displayName,
        betGoalsHome: bets[3].goalsHome,
        betGoalsAway: bets[3].goalsAway,
        possibleOutsiderPoints: POINTS_ADDED_OUTSIDER_TWO
      } // match 58817, user 2
    ];

    expectedSeasonUserData = [
      {
        place: seasonBets[0].place,
        userName: userData[0].displayName,
        teamName: teamNames[0]
      },
      {
        place: seasonBets[1].place,
        userName: userData[0].displayName,
        teamName: teamNames[1]
      },
      {
        place: seasonBets[2].place,
        userName: userData[0].displayName,
        teamName: teamNames[2]
      },
      {
        place: seasonBets[3].place,
        userName: userData[0].displayName,
        teamName: teamNames[3]
      },
      {
        place: seasonBets[4].place,
        userName: userData[0].displayName,
        teamName: teamNames[4]
      },
      {
        place: seasonBets[5].place,
        userName: userData[1].displayName,
        teamName: teamNames[5]
      },
      {
        place: seasonBets[6].place,
        userName: userData[1].displayName,
        teamName: teamNames[6]
      },
      {
        place: seasonBets[7].place,
        userName: userData[1].displayName,
        teamName: teamNames[7]
      },
      {
        place: seasonBets[8].place,
        userName: userData[1].displayName,
        teamName: teamNames[8]
      },
      {
        place: seasonBets[9].place,
        userName: userData[1].displayName,
        teamName: teamNames[9]
      }
    ];

    defaultFrameValue = {
      matchId: -1,
      matchDate: new Date(-1),
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
      betGoalsAway: -1,
      possibleOutsiderPoints: -1
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
  // fetchSeasonFrameData$
  // ---------------------------------------------------------------------------

  it('fetchSeasonFrameData$, data available', (done: DoneFn) => {
    const argument1: number = 2021;
    const argument2: string = "test_user_id";

    spyOn<any>(service, "makeSeasonFrameData$")
      .withArgs(argument1, 1, argument2).and.returnValue(of(expectedSeasonFrameValues[0]))
      .withArgs(argument1, 2, argument2).and.returnValue(of(expectedSeasonFrameValues[1]))
      .withArgs(argument1, -3, argument2).and.returnValue(of(expectedSeasonFrameValues[2]))
      .withArgs(argument1, -2, argument2).and.returnValue(of(expectedSeasonFrameValues[3]))
      .withArgs(argument1, -1, argument2).and.returnValue(of(expectedSeasonFrameValues[4]));

    let i: number = 0;
    service["fetchSeasonFrameData$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedSeasonFrameValues[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // fetchUserSeasonBetData$
  // ---------------------------------------------------------------------------

  it('fetchUserSeasonBetData$, bets available', (done: DoneFn) => {
    const argument: number = 2021;

    spyOn<any>(service, "getAllUserSeasonBets$").and.returnValues(from(seasonBets));
    spyOn<any>(service, "makeSeasonBetData$")
      .withArgs(seasonBets[0]).and.returnValue(of(expectedSeasonUserData[0]))
      .withArgs(seasonBets[1]).and.returnValue(of(expectedSeasonUserData[1]))
      .withArgs(seasonBets[2]).and.returnValue(of(expectedSeasonUserData[2]))
      .withArgs(seasonBets[3]).and.returnValue(of(expectedSeasonUserData[3]))
      .withArgs(seasonBets[4]).and.returnValue(of(expectedSeasonUserData[4]))
      .withArgs(seasonBets[5]).and.returnValue(of(expectedSeasonUserData[5]))
      .withArgs(seasonBets[6]).and.returnValue(of(expectedSeasonUserData[6]))
      .withArgs(seasonBets[7]).and.returnValue(of(expectedSeasonUserData[7]))
      .withArgs(seasonBets[8]).and.returnValue(of(expectedSeasonUserData[8]))
      .withArgs(seasonBets[9]).and.returnValue(of(expectedSeasonUserData[9]));

    let i: number = 0;
    service["fetchUserSeasonBetData$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedSeasonUserData[i++]);
        done();
      }
    );
  });

  it('fetchUserSeasonBetData$, no bets available', (done: DoneFn) => {
    const argument: number = 2021;

    spyOn<any>(service, "getAllUserSeasonBets$").and.returnValues(from([]));

    const defaultSeasonUserValue: SeasonBetOverviewUserData = {
      place: 0,
      userName: "",
      teamName: ""
    };

    service["fetchUserSeasonBetData$"](argument).pipe(
      defaultIfEmpty(defaultSeasonUserValue)).subscribe(
        val => {
          expect(val).toEqual(defaultSeasonUserValue);
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
      .withArgs(bets).and.returnValue(from(expectedUserValues));

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
      .withArgs(bets).and.returnValue(from(expectedUserValues));

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
    const argument1: Match = matches[0]; // match 58815
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
    const argument1: Match = matches[0]; // match 58815
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
    const argument1: Match = matches[0]; // match 58815
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
  // makeSeasonFrameData$
  // ---------------------------------------------------------------------------

  it('makeSeasonFrameData$, bets available', (done: DoneFn) => {
    const argument1: number = 2021;
    const argument2: number = 1;
    const argument3: string = userData[0].id;

    appDataSpy.getSeasonResult$
      .withArgs(argument1, argument2).and.returnValue(of(seasonResults[0]));

    appDataSpy.getSeasonBet$
      .withArgs(argument1, argument2, argument3).and.returnValue(of(seasonBets[0]));

    appDataSpy.getTeamNameByTeamId$
      .withArgs(seasonResults[0].teamId).and.returnValue(of(expectedSeasonFrameValues[0].resultTeamName));

    const expectedValues: SeasonBetOverviewFrameData[] = [expectedSeasonFrameValues[0]];

    let i: number = 0;
    service["makeSeasonFrameData$"](argument1, argument2, argument3).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
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

    const expectedValues: Bet[] = [bets[0], bets[1]];

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

    const expectedValues: Bet[] = [bets[0], bets[1]];

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

    const defaultBet: Bet = {
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
  // getAllUserSeasonBets$
  // ---------------------------------------------------------------------------

  it('getAllUserSeasonBets$, bets available', (done: DoneFn) => {
    const argument: number = 2021;

    appDataSpy.getActiveUserIds$.and.returnValue(of(userData[0].id, userData[1].id));
    appDataSpy.getSeasonBet$
      .withArgs(argument, 1, userData[0].id).and.returnValue(of(seasonBets[0]))
      .withArgs(argument, 2, userData[0].id).and.returnValue(of(seasonBets[1]))
      .withArgs(argument, -3, userData[0].id).and.returnValue(of(seasonBets[2]))
      .withArgs(argument, -2, userData[0].id).and.returnValue(of(seasonBets[3]))
      .withArgs(argument, -1, userData[0].id).and.returnValue(of(seasonBets[4]))
      .withArgs(argument, 1, userData[1].id).and.returnValue(of(seasonBets[5]))
      .withArgs(argument, 2, userData[1].id).and.returnValue(of(seasonBets[6]))
      .withArgs(argument, -3, userData[1].id).and.returnValue(of(seasonBets[7]))
      .withArgs(argument, -2, userData[1].id).and.returnValue(of(seasonBets[8]))
      .withArgs(argument, -1, userData[1].id).and.returnValue(of(seasonBets[9]));


    const expectedValues: SeasonBet[] = seasonBets;

    let i: number = 0;
    service["getAllUserSeasonBets$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('getAllUserSeasonBets$, some bets emitted twice', (done: DoneFn) => {
    const argument: number = 2021;

    appDataSpy.getActiveUserIds$.and.returnValue(of(userData[0].id, userData[1].id));
    appDataSpy.getSeasonBet$
      .withArgs(argument, 1, userData[0].id).and.returnValue(of(seasonBets[0]))
      .withArgs(argument, 2, userData[0].id).and.returnValue(of(seasonBets[1]))
      .withArgs(argument, -3, userData[0].id).and.returnValue(of(seasonBets[2], seasonBets[2]))
      .withArgs(argument, -2, userData[0].id).and.returnValue(of(seasonBets[3]))
      .withArgs(argument, -1, userData[0].id).and.returnValue(of(seasonBets[4]))
      .withArgs(argument, 1, userData[1].id).and.returnValue(of(seasonBets[5]))
      .withArgs(argument, 2, userData[1].id).and.returnValue(of(seasonBets[6], seasonBets[6]))
      .withArgs(argument, -3, userData[1].id).and.returnValue(of(seasonBets[7]))
      .withArgs(argument, -2, userData[1].id).and.returnValue(of(seasonBets[8]))
      .withArgs(argument, -1, userData[1].id).and.returnValue(of(seasonBets[9]));

    const expectedValues: SeasonBet[] = seasonBets;

    let i: number = 0;
    service["getAllUserSeasonBets$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('getAllUserSeasonBets$, no bets emitted', (done: DoneFn) => {
    const argument: number = 2021;

    appDataSpy.getActiveUserIds$.and.returnValue(of(userData[0].id, userData[1].id));
    appDataSpy.getSeasonBet$
      .withArgs(argument, 1, userData[0].id).and.returnValue(of())
      .withArgs(argument, 2, userData[0].id).and.returnValue(of())
      .withArgs(argument, -3, userData[0].id).and.returnValue(of())
      .withArgs(argument, -2, userData[0].id).and.returnValue(of())
      .withArgs(argument, -1, userData[0].id).and.returnValue(of())
      .withArgs(argument, 1, userData[1].id).and.returnValue(of())
      .withArgs(argument, 2, userData[1].id).and.returnValue(of())
      .withArgs(argument, -3, userData[1].id).and.returnValue(of())
      .withArgs(argument, -2, userData[1].id).and.returnValue(of())
      .withArgs(argument, -1, userData[1].id).and.returnValue(of());

    const defaultSeasonBet: SeasonBet = {
      documentId: "doc_id_0",
      season: -1,
      userId: "",
      isFixed: false,
      place: 0,
      teamId: -1
    };

    service["getAllUserSeasonBets$"](argument).pipe(
      defaultIfEmpty(defaultSeasonBet)).subscribe(
        val => {
          expect(val).toEqual(defaultSeasonBet);
          done();
        }
      );
  });

  // ---------------------------------------------------------------------------
  // makeBetData$
  // ---------------------------------------------------------------------------

  it('makeBetData$, data available', (done: DoneFn) => {
    const argument: Bet[] = bets;

    appDataSpy.getUserDataById$
      .withArgs(userData[0].id).and.returnValue(of(userData[0]))
      .withArgs(userData[1].id).and.returnValue(of(userData[1]));

    pointCalcSpy.getPotentialOutsiderPoints
      .withArgs(argument, bets[0]).and.returnValue(POINTS_ADDED_OUTSIDER_ONE)
      .withArgs(argument, bets[1]).and.returnValue(POINTS_ADDED_OUTSIDER_ONE)
      .withArgs(argument, bets[2]).and.returnValue(POINTS_ADDED_OUTSIDER_TWO)
      .withArgs(argument, bets[3]).and.returnValue(POINTS_ADDED_OUTSIDER_TWO);

    let i: number = 0;
    service["makeBetData$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedUserValues[i++]);
        done();
      }
    );
  });

  it('makeBetData$, data not available', (done: DoneFn) => {
    const argument: Bet[] = bets;

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

  // ---------------------------------------------------------------------------
  // makeSeasonBetData$
  // ---------------------------------------------------------------------------

  it('makeSeasonBetData$, data available', (done: DoneFn) => {
    const argument: SeasonBet = seasonBets[0];

    appDataSpy.getUserDataById$
      .withArgs(userData[0].id).and.returnValue(of(userData[0]))
      .withArgs(userData[1].id).and.returnValue(of(userData[1]));

    appDataSpy.getTeamNameByTeamId$
      .withArgs(argument.teamId).and.returnValue(of(teamNames[0]));

    service["makeSeasonBetData$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedSeasonUserData[0]);
        done();
      }
    );
  });

  it('makeSeasonBetData$, user data not available', (done: DoneFn) => {
    const argument: SeasonBet = seasonBets[0];

    appDataSpy.getUserDataById$
      .withArgs(userData[0].id).and.returnValue(of())
      .withArgs(userData[1].id).and.returnValue(of());

    appDataSpy.getTeamNameByTeamId$
      .withArgs(argument.teamId).and.returnValue(of(teamNames[0]))

    const defaultSeasonUserValue: SeasonBetOverviewUserData = {
      place: 0,
      userName: "",
      teamName: ""
    };

    service["makeSeasonBetData$"](argument).pipe(
      defaultIfEmpty(defaultSeasonUserValue)).subscribe(
        val => {
          expect(val).toEqual(defaultSeasonUserValue);
          done();
        }
      );
  });
});
