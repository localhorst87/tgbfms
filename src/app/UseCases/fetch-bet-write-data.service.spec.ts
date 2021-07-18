import { TestBed } from '@angular/core/testing';

import { of, from } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';
import { FetchBetWriteDataService } from './fetch-bet-write-data.service';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { Bet, Match, Result, SeasonBet } from '../Businessrules/basic_datastructures';
import { BetWriteData, SeasonBetWriteData } from './output_datastructures';

describe('FetchBetWriteDataService', () => {
  let service: FetchBetWriteDataService;
  let appDataSpy: jasmine.SpyObj<AppdataAccessService>;
  let bets: Bet[];
  let matches: Match[];

  beforeEach(() => {
    appDataSpy = jasmine.createSpyObj(["createDocumentId", "getTeamNameByTeamId$", "getBet$", "getNextMatchesByTime$", "getMatchesByMatchday$", "getSeasonBet$"]);

    TestBed.configureTestingModule({
      providers: [
        FetchBetWriteDataService, { provide: AppdataAccessService, useValue: appDataSpy }
      ]
    });
    service = TestBed.inject(FetchBetWriteDataService);

    bets = [
      {
        documentId: "bet_doc_id_0",
        matchId: 58815,
        userId: "test_user_id",
        isFixed: true,
        goalsHome: 4,
        goalsAway: 0,
      },
      {
        documentId: "bet_doc_id_1",
        matchId: 58817,
        userId: "test_user_id",
        isFixed: false,
        goalsHome: 1,
        goalsAway: 1,
      }
    ];

    matches = [
      {
        documentId: "doc_id_0",
        season: 2020,
        matchday: 28,
        matchId: bets[0].matchId,
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
        matchId: bets[1].matchId,
        timestamp: 1618241000,
        isFinished: false,
        isTopMatch: true,
        teamIdHome: 13,
        teamIdAway: 6
      }
    ];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // fetchSeasonData$
  // ---------------------------------------------------------------------------

  it('fetchSeasonData$, bets available', (done: DoneFn) => {
    const argument1: number = 2021;
    const argument2: string = "test_user_id";

    const seasonBets: SeasonBet[] = [
      {
        documentId: "doc_id_0",
        season: argument1,
        userId: argument2,
        isFixed: true,
        place: 1,
        teamId: 45
      },
      {
        documentId: "doc_id_1",
        season: argument1,
        userId: argument2,
        isFixed: true,
        place: 2,
        teamId: 76
      },
      {
        documentId: "doc_id_2",
        season: argument1,
        userId: argument2,
        isFixed: true,
        place: -3,
        teamId: 99
      },
      {
        documentId: "doc_id_3",
        season: argument1,
        userId: argument2,
        isFixed: true,
        place: -2,
        teamId: 111
      },
      {
        documentId: "doc_id_4",
        season: argument1,
        userId: argument2,
        isFixed: false,
        place: -1,
        teamId: 122
      }
    ];

    const teamNames: string[] = [
      "team_name_45",
      "team_name_76",
      "team_name_99",
      "team_name_111",
      "team_name_122"
    ];

    const expectedValues: SeasonBetWriteData[] = [
      {
        season: seasonBets[0].season,
        place: seasonBets[0].place,
        teamName: teamNames[0],
        isBetFixed: seasonBets[0].isFixed,
        betDocumentId: seasonBets[0].documentId
      },
      {
        season: seasonBets[1].season,
        place: seasonBets[1].place,
        teamName: teamNames[1],
        isBetFixed: seasonBets[1].isFixed,
        betDocumentId: seasonBets[1].documentId
      },
      {
        season: seasonBets[2].season,
        place: seasonBets[2].place,
        teamName: teamNames[2],
        isBetFixed: seasonBets[2].isFixed,
        betDocumentId: seasonBets[2].documentId
      },
      {
        season: seasonBets[3].season,
        place: seasonBets[3].place,
        teamName: teamNames[3],
        isBetFixed: seasonBets[3].isFixed,
        betDocumentId: seasonBets[3].documentId
      },
      {
        season: seasonBets[4].season,
        place: seasonBets[4].place,
        teamName: teamNames[4],
        isBetFixed: seasonBets[4].isFixed,
        betDocumentId: seasonBets[4].documentId
      }
    ];

    appDataSpy.getSeasonBet$
      .withArgs(argument1, 1, argument2).and.returnValue(of(seasonBets[0]))
      .withArgs(argument1, 2, argument2).and.returnValue(of(seasonBets[1]))
      .withArgs(argument1, -3, argument2).and.returnValue(of(seasonBets[2]))
      .withArgs(argument1, -2, argument2).and.returnValue(of(seasonBets[3]))
      .withArgs(argument1, -1, argument2).and.returnValue(of(seasonBets[4]));

    spyOn<any>(service, "makeSeasonBetWriteData$")
      .withArgs(seasonBets[0]).and.returnValue(of(expectedValues[0]))
      .withArgs(seasonBets[1]).and.returnValue(of(expectedValues[1]))
      .withArgs(seasonBets[2]).and.returnValue(of(expectedValues[2]))
      .withArgs(seasonBets[3]).and.returnValue(of(expectedValues[3]))
      .withArgs(seasonBets[4]).and.returnValue(of(expectedValues[4]));

    let i: number = 0;
    service["fetchSeasonData$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // fetchDataByMatchday$
  // ---------------------------------------------------------------------------

  it('fetchDataByMatchday$, matches available', (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 28;
    const argument3: string = "test_user_id";

    let expectedValues: BetWriteData[] = [
      {
        matchId: matches[0].matchId,
        matchTimestamp: matches[0].timestamp,
        isTopMatch: matches[0].isTopMatch,
        teamIdHome: matches[0].teamIdHome,
        teamIdAway: matches[0].teamIdAway,
        teamNameHome: "home_team_name_0",
        teamNameAway: "away_team_name_0",
        teamNameShortHome: "HT0",
        teamNameShortAway: "AW0",
        betGoalsHome: bets[0].goalsHome,
        betGoalsAway: bets[0].goalsAway,
        isBetFixed: bets[0].isFixed,
        betDocumentId: bets[0].documentId
      },
      {
        matchId: matches[1].matchId,
        matchTimestamp: matches[1].timestamp,
        isTopMatch: matches[1].isTopMatch,
        teamIdHome: matches[1].teamIdHome,
        teamIdAway: matches[1].teamIdAway,
        teamNameHome: "home_team_name_1",
        teamNameAway: "away_team_name_1",
        teamNameShortHome: "HT1",
        teamNameShortAway: "AW1",
        betGoalsHome: bets[1].goalsHome,
        betGoalsAway: bets[1].goalsAway,
        isBetFixed: bets[1].isFixed,
        betDocumentId: bets[1].documentId
      }
    ];

    appDataSpy.getMatchesByMatchday$.and.returnValue(from(matches));
    spyOn<any>(service, "makeBetWriteData$")
      .withArgs(matches[0], argument3).and.returnValue(of(expectedValues[0]))
      .withArgs(matches[1], argument3).and.returnValue(of(expectedValues[1]));

    let i: number = 0;
    service["fetchDataByMatchday$"](argument1, argument2, argument3).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('fetchDataByMatchday$, emitting BetWriteData twice', (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 28;
    const argument3: string = "test_user_id";

    let expectedValues: BetWriteData[] = [
      {
        matchId: matches[0].matchId,
        matchTimestamp: matches[0].timestamp,
        isTopMatch: matches[0].isTopMatch,
        teamIdHome: matches[0].teamIdHome,
        teamIdAway: matches[0].teamIdAway,
        teamNameHome: "home_team_name_0",
        teamNameAway: "away_team_name_0",
        teamNameShortHome: "HT0",
        teamNameShortAway: "AW0",
        betGoalsHome: bets[0].goalsHome,
        betGoalsAway: bets[0].goalsAway,
        isBetFixed: bets[0].isFixed,
        betDocumentId: bets[0].documentId
      },
      {
        matchId: matches[1].matchId,
        matchTimestamp: matches[1].timestamp,
        isTopMatch: matches[1].isTopMatch,
        teamIdHome: matches[1].teamIdHome,
        teamIdAway: matches[1].teamIdAway,
        teamNameHome: "home_team_name_1",
        teamNameAway: "away_team_name_1",
        teamNameShortHome: "HT1",
        teamNameShortAway: "AW1",
        betGoalsHome: bets[1].goalsHome,
        betGoalsAway: bets[1].goalsAway,
        isBetFixed: bets[1].isFixed,
        betDocumentId: bets[1].documentId
      }
    ];

    appDataSpy.getMatchesByMatchday$.and.returnValue(from(matches));
    spyOn<any>(service, "makeBetWriteData$")
      .withArgs(matches[0], argument3).and.returnValue(of(expectedValues[0], expectedValues[0]))
      .withArgs(matches[1], argument3).and.returnValue(of(expectedValues[1], expectedValues[1]));

    let i: number = 0;
    service["fetchDataByMatchday$"](argument1, argument2, argument3).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('fetchDataByMatchday$, no matches available', (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 28;
    const argument3: string = "test_user_id";

    let defaultValue: BetWriteData = {
      matchId: -1,
      matchTimestamp: -1,
      isTopMatch: false,
      teamIdHome: -1,
      teamIdAway: -1,
      teamNameHome: "",
      teamNameAway: "",
      teamNameShortHome: "",
      teamNameShortAway: "",
      betGoalsHome: -1,
      betGoalsAway: -1,
      isBetFixed: false,
      betDocumentId: ""
    };

    appDataSpy.getMatchesByMatchday$.and.returnValue(from([]));

    service["fetchDataByMatchday$"](argument1, argument2, argument3).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );
  });

  // ---------------------------------------------------------------------------
  // fetchDataByTime$
  // ---------------------------------------------------------------------------

  it('fetchDataByTime$, matches available', (done: DoneFn) => {
    const argument1: number = 2;
    const argument2: string = "test_user_id";

    let expectedValues: BetWriteData[] = [
      {
        matchId: matches[0].matchId,
        matchTimestamp: matches[0].timestamp,
        isTopMatch: matches[0].isTopMatch,
        teamIdHome: matches[0].teamIdHome,
        teamIdAway: matches[0].teamIdAway,
        teamNameHome: "home_team_name_0",
        teamNameAway: "away_team_name_0",
        teamNameShortHome: "HT0",
        teamNameShortAway: "AW0",
        betGoalsHome: bets[0].goalsHome,
        betGoalsAway: bets[0].goalsAway,
        isBetFixed: bets[0].isFixed,
        betDocumentId: bets[0].documentId
      },
      {
        matchId: matches[1].matchId,
        matchTimestamp: matches[1].timestamp,
        isTopMatch: matches[1].isTopMatch,
        teamIdHome: matches[1].teamIdHome,
        teamIdAway: matches[1].teamIdAway,
        teamNameHome: "home_team_name_1",
        teamNameAway: "away_team_name_1",
        teamNameShortHome: "HT1",
        teamNameShortAway: "AW1",
        betGoalsHome: bets[1].goalsHome,
        betGoalsAway: bets[1].goalsAway,
        isBetFixed: bets[1].isFixed,
        betDocumentId: bets[1].documentId
      }
    ];

    appDataSpy.getNextMatchesByTime$.and.returnValue(from(matches));
    spyOn<any>(service, "makeBetWriteData$")
      .withArgs(matches[0], argument2).and.returnValue(of(expectedValues[0]))
      .withArgs(matches[1], argument2).and.returnValue(of(expectedValues[1]));

    let i: number = 0;
    service["fetchDataByTime$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('fetchDataByTime$, negative argument', (done: DoneFn) => {
    const argument1: number = -1;
    const argument2: string = "test_user_id";

    let expectedValues: BetWriteData[] = [
      {
        matchId: matches[0].matchId,
        matchTimestamp: matches[0].timestamp,
        isTopMatch: matches[0].isTopMatch,
        teamIdHome: matches[0].teamIdHome,
        teamIdAway: matches[0].teamIdAway,
        teamNameHome: "home_team_name_0",
        teamNameAway: "away_team_name_0",
        teamNameShortHome: "HT0",
        teamNameShortAway: "AW0",
        betGoalsHome: bets[0].goalsHome,
        betGoalsAway: bets[0].goalsAway,
        isBetFixed: bets[0].isFixed,
        betDocumentId: bets[0].documentId
      },
      {
        matchId: matches[1].matchId,
        matchTimestamp: matches[1].timestamp,
        isTopMatch: matches[1].isTopMatch,
        teamIdHome: matches[1].teamIdHome,
        teamIdAway: matches[1].teamIdAway,
        teamNameHome: "home_team_name_1",
        teamNameAway: "away_team_name_1",
        teamNameShortHome: "HT1",
        teamNameShortAway: "AW1",
        betGoalsHome: bets[1].goalsHome,
        betGoalsAway: bets[1].goalsAway,
        isBetFixed: bets[1].isFixed,
        betDocumentId: bets[1].documentId
      }
    ];

    appDataSpy.getNextMatchesByTime$.and.returnValue(from(matches));
    spyOn<any>(service, "makeBetWriteData$")
      .withArgs(matches[0], argument2).and.returnValue(of(expectedValues[0]))
      .withArgs(matches[1], argument2).and.returnValue(of(expectedValues[1]));

    service["fetchDataByTime$"](argument1, argument2).subscribe(
      val => {
        expect(appDataSpy.getNextMatchesByTime$).toHaveBeenCalledWith(0);
        done();
      }
    );

  });

  it('fetchDataByTime$, emitting BetWriteData twice', (done: DoneFn) => {
    const argument1: number = 2;
    const argument2: string = "test_user_id";

    let expectedValues: BetWriteData[] = [
      {
        matchId: matches[0].matchId,
        matchTimestamp: matches[0].timestamp,
        isTopMatch: matches[0].isTopMatch,
        teamIdHome: matches[0].teamIdHome,
        teamIdAway: matches[0].teamIdAway,
        teamNameHome: "home_team_name_0",
        teamNameAway: "away_team_name_0",
        teamNameShortHome: "HT0",
        teamNameShortAway: "AW0",
        betGoalsHome: bets[0].goalsHome,
        betGoalsAway: bets[0].goalsAway,
        isBetFixed: bets[0].isFixed,
        betDocumentId: bets[0].documentId
      },
      {
        matchId: matches[1].matchId,
        matchTimestamp: matches[1].timestamp,
        isTopMatch: matches[1].isTopMatch,
        teamIdHome: matches[1].teamIdHome,
        teamIdAway: matches[1].teamIdAway,
        teamNameHome: "home_team_name_1",
        teamNameAway: "away_team_name_1",
        teamNameShortHome: "HT1",
        teamNameShortAway: "AW1",
        betGoalsHome: bets[1].goalsHome,
        betGoalsAway: bets[1].goalsAway,
        isBetFixed: bets[1].isFixed,
        betDocumentId: bets[1].documentId
      }
    ];

    appDataSpy.getNextMatchesByTime$.and.returnValue(from(matches));
    spyOn<any>(service, "makeBetWriteData$")
      .withArgs(matches[0], argument2).and.returnValue(of(expectedValues[0], expectedValues[0]))
      .withArgs(matches[1], argument2).and.returnValue(of(expectedValues[1], expectedValues[1]));

    let i: number = 0;
    service["fetchDataByTime$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('fetchDataByTime$, no matches available', (done: DoneFn) => {
    const argument1: number = 2;
    const argument2: string = "test_user_id";

    let defaultValue: BetWriteData = {
      matchId: -1,
      matchTimestamp: -1,
      isTopMatch: false,
      teamIdHome: -1,
      teamIdAway: -1,
      teamNameHome: "",
      teamNameAway: "",
      teamNameShortHome: "",
      teamNameShortAway: "",
      betGoalsHome: -1,
      betGoalsAway: -1,
      isBetFixed: false,
      betDocumentId: ""
    };

    appDataSpy.getNextMatchesByTime$.and.returnValue(from([]));

    service["fetchDataByTime$"](argument1, argument2).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );
  });

  // ---------------------------------------------------------------------------
  // makeSeasonBetWriteData$
  // ---------------------------------------------------------------------------

  it('makeSeasonBetWriteData$, service is emitting data', (done: DoneFn) => {
    const seasonBets: SeasonBet[] = [
      {
        documentId: "doc_id_0",
        season: 2021,
        userId: "test_user_id",
        isFixed: true,
        place: 1,
        teamId: 45
      },
      {
        documentId: "doc_id_1",
        season: 2021,
        userId: "test_user_id",
        isFixed: true,
        place: 2,
        teamId: 76
      },
      {
        documentId: "doc_id_2",
        season: 2021,
        userId: "test_user_id",
        isFixed: false,
        place: 18,
        teamId: 122
      }
    ];

    const argument: SeasonBet = seasonBets[0];

    const teamNames: string[] = [
      "team_name_45",
      "team_name_76",
      "team_name_122"
    ];

    const expectedValue: SeasonBetWriteData =
    {
      season: seasonBets[0].season,
      place: seasonBets[0].place,
      teamName: teamNames[0],
      isBetFixed: seasonBets[0].isFixed,
      betDocumentId: seasonBets[0].documentId
    };

    appDataSpy.getTeamNameByTeamId$
      .withArgs(seasonBets[0].teamId).and.returnValue(of(teamNames[0]))
      .withArgs(seasonBets[1].teamId).and.returnValue(of(teamNames[1]))
      .withArgs(seasonBets[2].teamId).and.returnValue(of(teamNames[2]));

    service["makeSeasonBetWriteData$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it('makeSeasonBetWriteData$, service is not emitting data', (done: DoneFn) => {
    const seasonBets: SeasonBet[] = [
      {
        documentId: "doc_id_0",
        season: 2021,
        userId: "test_user_id",
        isFixed: true,
        place: 1,
        teamId: 45
      },
      {
        documentId: "doc_id_1",
        season: 2021,
        userId: "test_user_id",
        isFixed: true,
        place: 2,
        teamId: 76
      },
      {
        documentId: "doc_id_2",
        season: 2021,
        userId: "test_user_id",
        isFixed: false,
        place: 18,
        teamId: 122
      }
    ];

    const argument: SeasonBet = seasonBets[1];

    const teamNames: string[] = [
      "team_name_45",
      "team_name_76",
      "team_name_122"
    ];

    const defaultValue: SeasonBetWriteData =
    {
      season: -1,
      place: 0,
      teamName: "",
      isBetFixed: false,
      betDocumentId: ""
    };

    appDataSpy.getTeamNameByTeamId$
      .withArgs(seasonBets[0].teamId).and.returnValue(of())
      .withArgs(seasonBets[1].teamId).and.returnValue(of())
      .withArgs(seasonBets[2].teamId).and.returnValue(of());

    service["makeSeasonBetWriteData$"](argument).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );
  });

  // ---------------------------------------------------------------------------
  // makeBetWriteData$
  // ---------------------------------------------------------------------------

  it('makeBetWriteData$, all services emitting', (done: DoneFn) => {
    const argument1: Match = matches[0];
    const argument2: string = "test_user_id";

    let expectedValue: BetWriteData = {
      matchId: matches[0].matchId,
      matchTimestamp: matches[0].timestamp,
      isTopMatch: matches[0].isTopMatch,
      teamIdHome: matches[0].teamIdHome,
      teamIdAway: matches[0].teamIdAway,
      teamNameHome: "home_team_name_0",
      teamNameAway: "away_team_name_0",
      teamNameShortHome: "HT0",
      teamNameShortAway: "AW0",
      betGoalsHome: bets[0].goalsHome,
      betGoalsAway: bets[0].goalsAway,
      isBetFixed: bets[0].isFixed,
      betDocumentId: bets[0].documentId
    };

    appDataSpy.getTeamNameByTeamId$
      .withArgs(matches[0].teamIdHome).and.returnValue(of(expectedValue.teamNameHome))
      .withArgs(matches[0].teamIdAway).and.returnValue(of(expectedValue.teamNameAway))
      .withArgs(matches[0].teamIdHome, true).and.returnValue(of(expectedValue.teamNameShortHome))
      .withArgs(matches[0].teamIdAway, true).and.returnValue(of(expectedValue.teamNameShortAway));

    appDataSpy.getBet$.and.returnValue(of(bets[0]));

    service["makeBetWriteData$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it('makeBetWriteData$, all services emitting, documentId empty', (done: DoneFn) => {
    const argument1: Match = matches[0];
    const argument2: string = "test_user_id";

    const unknownBet: Bet = {
      documentId: "",
      matchId: 58815,
      userId: "test_user_id",
      isFixed: false,
      goalsHome: -1,
      goalsAway: -1,
    };

    const createdId: string = "created_test_id";

    let expectedValue: BetWriteData = {
      matchId: matches[0].matchId,
      matchTimestamp: matches[0].timestamp,
      isTopMatch: matches[0].isTopMatch,
      teamIdHome: matches[0].teamIdHome,
      teamIdAway: matches[0].teamIdAway,
      teamNameHome: "home_team_name_0",
      teamNameAway: "away_team_name_0",
      teamNameShortHome: "HT0",
      teamNameShortAway: "AW0",
      betGoalsHome: unknownBet.goalsHome,
      betGoalsAway: unknownBet.goalsAway,
      isBetFixed: unknownBet.isFixed,
      betDocumentId: createdId
    };

    appDataSpy.getTeamNameByTeamId$
      .withArgs(matches[0].teamIdHome).and.returnValue(of(expectedValue.teamNameHome))
      .withArgs(matches[0].teamIdAway).and.returnValue(of(expectedValue.teamNameAway))
      .withArgs(matches[0].teamIdHome, true).and.returnValue(of(expectedValue.teamNameShortHome))
      .withArgs(matches[0].teamIdAway, true).and.returnValue(of(expectedValue.teamNameShortAway));

    appDataSpy.getBet$.and.returnValue(of(unknownBet));
    appDataSpy.createDocumentId.and.returnValue(createdId);

    service["makeBetWriteData$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it('makeBetWriteData$, one data service not emitting', (done: DoneFn) => {
    const argument1: Match = matches[0];
    const argument2: string = "test_user_id";

    let expectedValue: BetWriteData = {
      matchId: matches[0].matchId,
      matchTimestamp: matches[0].timestamp,
      isTopMatch: matches[0].isTopMatch,
      teamIdHome: matches[0].teamIdHome,
      teamIdAway: matches[0].teamIdAway,
      teamNameHome: "home_team_name_0",
      teamNameAway: "away_team_name_0",
      teamNameShortHome: "HT0",
      teamNameShortAway: "AW0",
      betGoalsHome: bets[0].goalsHome,
      betGoalsAway: bets[0].goalsAway,
      isBetFixed: bets[0].isFixed,
      betDocumentId: bets[0].documentId
    };

    let defaultValue: BetWriteData = {
      matchId: -1,
      matchTimestamp: -1,
      isTopMatch: false,
      teamIdHome: -1,
      teamIdAway: -1,
      teamNameHome: "",
      teamNameAway: "",
      teamNameShortHome: "",
      teamNameShortAway: "",
      betGoalsHome: -1,
      betGoalsAway: -1,
      isBetFixed: false,
      betDocumentId: ""
    };

    appDataSpy.getTeamNameByTeamId$
      .withArgs(matches[0].teamIdHome).and.returnValue(of(expectedValue.teamNameHome))
      .withArgs(matches[0].teamIdAway).and.returnValue(of(expectedValue.teamNameAway))
      .withArgs(matches[0].teamIdHome, true).and.returnValue(of(expectedValue.teamNameShortHome))
      .withArgs(matches[0].teamIdAway, true).and.returnValue(of(expectedValue.teamNameShortAway));

    appDataSpy.getBet$.and.returnValue(of());

    service["makeBetWriteData$"](argument1, argument2).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );
  });

  it('makeBetWriteData$, one service emitting multiple values', (done: DoneFn) => {
    const argument1: Match = matches[1];
    const argument2: string = "test_user_id";

    let expectedValue: BetWriteData = {
      matchId: matches[1].matchId,
      matchTimestamp: matches[1].timestamp,
      isTopMatch: matches[1].isTopMatch,
      teamIdHome: matches[1].teamIdHome,
      teamIdAway: matches[1].teamIdAway,
      teamNameHome: "home_team_name_1",
      teamNameAway: "away_team_name_1",
      teamNameShortHome: "HT1",
      teamNameShortAway: "AW1",
      betGoalsHome: bets[1].goalsHome,
      betGoalsAway: bets[1].goalsAway,
      isBetFixed: bets[1].isFixed,
      betDocumentId: bets[1].documentId
    };

    appDataSpy.getTeamNameByTeamId$
      .withArgs(matches[1].teamIdHome).and.returnValue(from([expectedValue.teamNameHome, expectedValue.teamNameHome]))
      .withArgs(matches[1].teamIdAway).and.returnValue(of(expectedValue.teamNameAway))
      .withArgs(matches[1].teamIdHome, true).and.returnValue(of(expectedValue.teamNameShortHome))
      .withArgs(matches[1].teamIdAway, true).and.returnValue(of(expectedValue.teamNameShortAway));

    appDataSpy.getBet$.and.returnValue(of(bets[1]));

    service["makeBetWriteData$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

});
