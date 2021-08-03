import { TestBed } from '@angular/core/testing';

import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { PointCalculatorService } from '../Businessrules/point-calculator.service';
import { FetchBetOverviewService } from './fetch-bet-overview.service';
import { BetOverviewFrameData, BetOverviewUserData, SeasonBetOverviewUserData, SeasonBetOverviewFrameData } from './output_datastructures';
import { Bet, Match, Result, SeasonBet, SeasonResult, User, Team } from '../Businessrules/basic_datastructures';
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
  let teams: Team[];
  let expectedFrameValues: BetOverviewFrameData[];
  let expectedUserValues: BetOverviewUserData[];
  let expectedSeasonFrameValues: SeasonBetOverviewFrameData[];
  let expectedSeasonUserData: SeasonBetOverviewUserData[];
  let defaultFrameValue: BetOverviewFrameData;
  let defaultUserValue: BetOverviewUserData;

  beforeEach(() => {
    appDataSpy = jasmine.createSpyObj(["getActiveUserIds$", "getUserDataById$", "getResult$", "getBet$", "getTeamNameByTeamId$", "getTeamByTeamId$", "getMatchesByMatchday$", "getSeasonBet$", "getSeasonResult$"]);
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

    teams = [
      {
        documentId: "doc_0",
        id: 45,
        nameLong: "team_name_45",
        nameShort: "T00"
      },
      {
        documentId: "doc_1",
        id: 76,
        nameLong: "team_name_76",
        nameShort: "T01"
      },
      {
        documentId: "doc_2",
        id: 122,
        nameLong: "team_name_122",
        nameShort: "T02"
      },
      {
        documentId: "doc_3",
        id: 70,
        nameLong: "team_name_70",
        nameShort: "T03"
      },
      {
        documentId: "doc_4",
        id: 99,
        nameLong: "team_name_99",
        nameShort: "T04"
      },
      {
        documentId: "doc_5",
        id: 32,
        nameLong: "team_name_32",
        nameShort: "T05"
      },
      {
        documentId: "doc_6",
        id: 3,
        nameLong: "team_name_3",
        nameShort: "T06"
      },
      {
        documentId: "doc_7",
        id: 23,
        nameLong: "team_name_23",
        nameShort: "T07"
      },
      {
        documentId: "doc_8",
        id: 87,
        nameLong: "team_name_87",
        nameShort: "T08"
      },
      {
        documentId: "doc_9",
        id: 199,
        nameLong: "team_name_199",
        nameShort: "T09"
      },
      {
        documentId: "doc_10",
        id: 211,
        nameLong: "team_name_211",
        nameShort: "T10"
      },
      {
        documentId: "doc_11",
        id: 93,
        nameLong: "team_name_93",
        nameShort: "T11"
      },
      {
        documentId: "doc_12",
        id: 13,
        nameLong: "team_name_13",
        nameShort: "T12"
      },
      {
        documentId: "doc_13",
        id: 6,
        nameLong: "team_name_6",
        nameShort: "T13"
      },
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
        teamNameHome: teams[10].nameLong,
        teamNameAway: teams[11].nameLong,
        teamNameShortHome: teams[10].nameShort,
        teamNameShortAway: teams[11].nameShort,
        resultGoalsHome: results[0].goalsHome,
        resultGoalsAway: results[0].goalsAway,
        isBetFixed: false
      },
      {
        matchId: matches[1].matchId,
        matchDate: new Date(matches[1].timestamp * 1000),
        isTopMatch: matches[1].isTopMatch,
        teamNameHome: teams[12].nameLong,
        teamNameAway: teams[13].nameLong,
        teamNameShortHome: teams[12].nameShort,
        teamNameShortAway: teams[13].nameShort,
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
        isBetFixed: bets[0].isFixed,
        possibleOutsiderPoints: POINTS_ADDED_OUTSIDER_ONE
      }, // match 58815, user 1
      {
        matchId: matches[0].matchId,
        userName: userData[1].displayName,
        betGoalsHome: bets[1].goalsHome,
        betGoalsAway: bets[1].goalsAway,
        isBetFixed: bets[1].isFixed,
        possibleOutsiderPoints: POINTS_ADDED_OUTSIDER_ONE
      }, // match 58815, user 2
      {
        matchId: matches[1].matchId,
        userName: userData[0].displayName,
        betGoalsHome: bets[2].goalsHome,
        betGoalsAway: bets[2].goalsAway,
        isBetFixed: bets[2].isFixed,
        possibleOutsiderPoints: POINTS_ADDED_OUTSIDER_TWO
      }, // match 58817, user 1
      {
        matchId: matches[1].matchId,
        userName: userData[1].displayName,
        betGoalsHome: bets[3].goalsHome,
        betGoalsAway: bets[3].goalsAway,
        isBetFixed: bets[3].isFixed,
        possibleOutsiderPoints: POINTS_ADDED_OUTSIDER_TWO
      } // match 58817, user 2
    ];

    expectedSeasonUserData = [
      {
        place: seasonBets[0].place,
        userName: userData[0].displayName,
        teamName: teams[0].nameLong,
        isBetFixed: seasonBets[0].isFixed,
      },
      {
        place: seasonBets[1].place,
        userName: userData[0].displayName,
        teamName: teams[1].nameLong,
        isBetFixed: seasonBets[1].isFixed,
      },
      {
        place: seasonBets[2].place,
        userName: userData[0].displayName,
        teamName: teams[2].nameLong,
        isBetFixed: seasonBets[2].isFixed,
      },
      {
        place: seasonBets[3].place,
        userName: userData[0].displayName,
        teamName: teams[3].nameLong,
        isBetFixed: seasonBets[3].isFixed,
      },
      {
        place: seasonBets[4].place,
        userName: userData[0].displayName,
        teamName: teams[4].nameLong,
        isBetFixed: seasonBets[4].isFixed,
      },
      {
        place: seasonBets[5].place,
        userName: userData[1].displayName,
        teamName: teams[5].nameLong,
        isBetFixed: seasonBets[5].isFixed,
      },
      {
        place: seasonBets[6].place,
        userName: userData[1].displayName,
        teamName: teams[6].nameLong,
        isBetFixed: seasonBets[6].isFixed,
      },
      {
        place: seasonBets[7].place,
        userName: userData[1].displayName,
        teamName: teams[7].nameLong,
        isBetFixed: seasonBets[7].isFixed,
      },
      {
        place: seasonBets[8].place,
        userName: userData[1].displayName,
        teamName: teams[8].nameLong,
        isBetFixed: seasonBets[8].isFixed,
      },
      {
        place: seasonBets[9].place,
        userName: userData[1].displayName,
        teamName: teams[9].nameLong,
        isBetFixed: seasonBets[9].isFixed,
      }
    ];

    defaultFrameValue = {
      matchId: -1,
      matchDate: new Date(-1),
      isTopMatch: false,
      teamNameHome: "",
      teamNameAway: "",
      teamNameShortHome: "",
      teamNameShortAway: "",
      resultGoalsHome: -1,
      resultGoalsAway: -1,
      isBetFixed: false
    };

    defaultUserValue = {
      matchId: -1,
      userName: "",
      betGoalsHome: -1,
      betGoalsAway: -1,
      isBetFixed: false,
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
    const argument1: number = 2021;
    const argument2: number = 1;

    spyOn<any>(service, "getAllUserSeasonBets$")
      .withArgs(argument1, 1).and.returnValues(of(seasonBets[0], seasonBets[5]))
      .withArgs(argument1, 2).and.returnValues(of(seasonBets[1], seasonBets[6]))
      .withArgs(argument1, -3).and.returnValues(of(seasonBets[2], seasonBets[7]))
      .withArgs(argument1, -2).and.returnValues(of(seasonBets[3], seasonBets[8]))
      .withArgs(argument1, -1).and.returnValues(of(seasonBets[4], seasonBets[9]));

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

    const expectedValues: SeasonBetOverviewUserData[] = [
      expectedSeasonUserData[0],
      expectedSeasonUserData[5]
    ];

    let i: number = 0;
    service["fetchUserSeasonBetData$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('fetchUserSeasonBetData$, no bets available', (done: DoneFn) => {
    const argument1: number = 2021;
    const argument2: number = 3;

    spyOn<any>(service, "getAllUserSeasonBets$").and.returnValues(from([]));

    const defaultSeasonUserValue: SeasonBetOverviewUserData = {
      place: 0,
      userName: "",
      teamName: "",
      isBetFixed: false
    };

    service["fetchUserSeasonBetData$"](argument1, argument2).pipe(
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

  it('fetchUserBetDataByMatchday$, bets available, argument2 not given', (done: DoneFn) => {
    const argument1: number = matches[0].matchId;

    spyOn<any>(service, "getAllUserBets$").and.returnValues(from(bets));
    spyOn<any>(service, "makeBetData$")
      .withArgs(bets).and.returnValue(from(expectedUserValues));

    let i: number = 0;
    service["fetchUserBetDataByMatchday$"](argument1).subscribe(
      val => {
        expect(val).toEqual(expectedUserValues[i++]);
        expect(service["getAllUserBets$"]).toHaveBeenCalledWith(argument1, undefined);
        done();
      }
    );
  });

  it('fetchUserBetDataByMatchday$, bets available, argument2 given', (done: DoneFn) => {
    const argument1: number = matches[0].matchId;
    const arugment2: string = "test_user_id_1";

    spyOn<any>(service, "getAllUserBets$").and.returnValues(from(bets));
    spyOn<any>(service, "makeBetData$")
      .withArgs(bets).and.returnValue(from(expectedUserValues));

    let i: number = 0;
    service["fetchUserBetDataByMatchday$"](argument1, arugment2).subscribe(
      val => {
        expect(val).toEqual(expectedUserValues[i++]);
        expect(service["getAllUserBets$"]).toHaveBeenCalledWith(argument1, arugment2);
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

    appDataSpy.getTeamByTeamId$
      .withArgs(211).and.returnValue(of(teams[10]))
      .withArgs(93).and.returnValue(of(teams[11]))
      .withArgs(13).and.returnValue(of(teams[12]))
      .withArgs(6).and.returnValue(of(teams[13]));

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

    appDataSpy.getTeamByTeamId$
      .withArgs(211).and.returnValue(of(teams[10], teams[10]))
      .withArgs(93).and.returnValue(of(teams[11], teams[11]))
      .withArgs(13).and.returnValue(of(teams[12], teams[12]))
      .withArgs(6).and.returnValue(of(teams[13], teams[13]));

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

    appDataSpy.getTeamByTeamId$
      .withArgs(211).and.returnValue(of())
      .withArgs(93).and.returnValue(of(teams[11]))
      .withArgs(13).and.returnValue(of(teams[12]))
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

  it('getAllUserBets$, bets available, second argument not given', (done: DoneFn) => {
    const argument1: number = matches[0].matchId;

    appDataSpy.getActiveUserIds$.and.returnValue(of(userData[0].id, userData[1].id));
    appDataSpy.getBet$
      .withArgs(matches[0].matchId, userData[0].id).and.returnValue(of(bets[0]))
      .withArgs(matches[0].matchId, userData[1].id).and.returnValue(of(bets[1]))
      .withArgs(matches[1].matchId, userData[0].id).and.returnValue(of(bets[2]))
      .withArgs(matches[1].matchId, userData[1].id).and.returnValue(of(bets[3]));

    const expectedValues: Bet[] = [bets[0], bets[1]];

    let i: number = 0;
    service["getAllUserBets$"](argument1).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('getAllUserBets$, bets available, second argument given', (done: DoneFn) => {
    const argument1: number = matches[0].matchId;
    const argument2: string = userData[0].id;

    appDataSpy.getActiveUserIds$.and.returnValue(of(userData[0].id, userData[1].id));
    appDataSpy.getBet$
      .withArgs(matches[0].matchId, userData[0].id).and.returnValue(of(bets[0]))
      .withArgs(matches[0].matchId, userData[1].id).and.returnValue(of(bets[1]))
      .withArgs(matches[1].matchId, userData[0].id).and.returnValue(of(bets[2]))
      .withArgs(matches[1].matchId, userData[1].id).and.returnValue(of(bets[3]));

    const dummyBet: Bet = {
      documentId: "",
      matchId: argument1,
      userId: userData[1].id,
      isFixed: false,
      goalsHome: -1,
      goalsAway: -1
    };

    const expectedValues: Bet[] = [bets[0], dummyBet];

    let i: number = 0;
    service["getAllUserBets$"](argument1, argument2).subscribe(
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
    const argument1: number = 2021;
    const argument2: number = -3;

    appDataSpy.getActiveUserIds$.and.returnValue(of(userData[0].id, userData[1].id));
    appDataSpy.getSeasonBet$
      .withArgs(argument1, 1, userData[0].id).and.returnValue(of(seasonBets[0]))
      .withArgs(argument1, 2, userData[0].id).and.returnValue(of(seasonBets[1]))
      .withArgs(argument1, -3, userData[0].id).and.returnValue(of(seasonBets[2]))
      .withArgs(argument1, -2, userData[0].id).and.returnValue(of(seasonBets[3]))
      .withArgs(argument1, -1, userData[0].id).and.returnValue(of(seasonBets[4]))
      .withArgs(argument1, 1, userData[1].id).and.returnValue(of(seasonBets[5]))
      .withArgs(argument1, 2, userData[1].id).and.returnValue(of(seasonBets[6]))
      .withArgs(argument1, -3, userData[1].id).and.returnValue(of(seasonBets[7]))
      .withArgs(argument1, -2, userData[1].id).and.returnValue(of(seasonBets[8]))
      .withArgs(argument1, -1, userData[1].id).and.returnValue(of(seasonBets[9]));


    const expectedValues: SeasonBet[] = [seasonBets[2], seasonBets[7]];

    let i: number = 0;
    service["getAllUserSeasonBets$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('getAllUserSeasonBets$, some bets emitted twice', (done: DoneFn) => {
    const argument1: number = 2021;
    const argument2: number = -3;

    appDataSpy.getActiveUserIds$.and.returnValue(of(userData[0].id, userData[1].id));
    appDataSpy.getSeasonBet$
      .withArgs(argument1, 1, userData[0].id).and.returnValue(of(seasonBets[0]))
      .withArgs(argument1, 2, userData[0].id).and.returnValue(of(seasonBets[1]))
      .withArgs(argument1, -3, userData[0].id).and.returnValue(of(seasonBets[2], seasonBets[2]))
      .withArgs(argument1, -2, userData[0].id).and.returnValue(of(seasonBets[3]))
      .withArgs(argument1, -1, userData[0].id).and.returnValue(of(seasonBets[4]))
      .withArgs(argument1, 1, userData[1].id).and.returnValue(of(seasonBets[5]))
      .withArgs(argument1, 2, userData[1].id).and.returnValue(of(seasonBets[6]))
      .withArgs(argument1, -3, userData[1].id).and.returnValue(of(seasonBets[7]))
      .withArgs(argument1, -2, userData[1].id).and.returnValue(of(seasonBets[8]))
      .withArgs(argument1, -1, userData[1].id).and.returnValue(of(seasonBets[9]));

    const expectedValues: SeasonBet[] = [seasonBets[2], seasonBets[7]];

    let i: number = 0;
    service["getAllUserSeasonBets$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('getAllUserSeasonBets$, no bets emitted', (done: DoneFn) => {
    const argument1: number = 2021;
    const argument2: number = 3;

    appDataSpy.getActiveUserIds$.and.returnValue(of(userData[0].id, userData[1].id));
    appDataSpy.getSeasonBet$.and.returnValue(of());

    const defaultSeasonBet: SeasonBet = {
      documentId: "doc_id_0",
      season: -1,
      userId: "",
      isFixed: false,
      place: 0,
      teamId: -1
    };

    service["getAllUserSeasonBets$"](argument1, argument2).pipe(
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
      .withArgs(argument.teamId).and.returnValue(of(teams[0].nameLong));

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
      .withArgs(argument.teamId).and.returnValue(of(teams[0].nameLong))

    const defaultSeasonUserValue: SeasonBetOverviewUserData = {
      place: 0,
      userName: "",
      teamName: "",
      isBetFixed: false
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
