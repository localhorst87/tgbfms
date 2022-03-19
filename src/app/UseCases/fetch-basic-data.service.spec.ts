import { TestBed } from '@angular/core/testing';
import { of, from } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';
import { FetchBasicDataService } from './fetch-basic-data.service';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { MatchdataAccessService } from '../Dataaccess/matchdata-access.service';
import { PointCalculatorService } from '../Businessrules/point-calculator.service';
import { Bet, Match, Team, SeasonBet } from '../Businessrules/basic_datastructures';
import { MatchInfo } from './output_datastructures';
import { TeamRankingImportData } from '../Dataaccess/import_datastructures';

describe('FetchBasicDataService', () => {
  let service: FetchBasicDataService;
  let appDataSpy: jasmine.SpyObj<AppdataAccessService>;
  let matchDataSpy: jasmine.SpyObj<MatchdataAccessService>;
  let pointCalcSpy: jasmine.SpyObj<PointCalculatorService>;

  beforeEach(() => {
    appDataSpy = jasmine.createSpyObj([
      "getTeamByTeamId$",
      "getActiveUserIds$",
      "getNextMatch$",
      "getTopMatch$",
      "getMatchesByMatchday$",
      "getSeasonBet$",
      "getOpenBets$",
      "getNextMatch$",
      "getLastMatch$",
      "getFirstMatchOfMatchday$"
    ]);
    matchDataSpy = jasmine.createSpyObj([
      "getActiveTeams$",
      "importCurrentTeamRanking$"
    ]);
    pointCalcSpy = jasmine.createSpyObj(["isTendencyCorrect"]);

    TestBed.configureTestingModule({
      providers: [
        FetchBasicDataService,
        { provide: PointCalculatorService, useValue: pointCalcSpy },
        { provide: AppdataAccessService, useValue: appDataSpy },
        { provide: MatchdataAccessService, useValue: matchDataSpy }
      ]
    });
    service = TestBed.inject(FetchBasicDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // fetchNumberOfUsers$
  // ---------------------------------------------------------------------------

  it('fetchNumberOfUsers$, users available', (done: DoneFn) => {
    appDataSpy.getActiveUserIds$.and.returnValue(of("id_1", "id_2", "id_3"));

    const expectedValue: number = 3;

    service["fetchNumberOfUsers$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it('fetchNumberOfUsers$, no users available', (done: DoneFn) => {
    appDataSpy.getActiveUserIds$.and.returnValue(of());

    const expectedValue: number = 0;

    service["fetchNumberOfUsers$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // fetchActiveTeams$
  // ---------------------------------------------------------------------------

  it('fetchActiveTeams$, teams available', (done: DoneFn) => {
    const argument: number = 2020;

    const teamIds: number[] = [56, 70, 7];
    const teams: Team[] = [
      {
        documentId: "doc_0",
        id: teamIds[0],
        nameLong: "team_name_0",
        nameShort: "T_0"
      },
      {
        documentId: "doc_1",
        id: teamIds[1],
        nameLong: "team_name_1",
        nameShort: "T_1"
      },
      {
        documentId: "doc_2",
        id: teamIds[2],
        nameLong: "team_name_2",
        nameShort: "T_2"
      }
    ];

    matchDataSpy.getActiveTeams$.and.returnValue(from(teamIds));
    appDataSpy.getTeamByTeamId$
      .withArgs(teamIds[0]).and.returnValue(of(teams[0]))
      .withArgs(teamIds[1]).and.returnValue(of(teams[1]))
      .withArgs(teamIds[2]).and.returnValue(of(teams[2]));

    const expectedValues: Team[] = teams;

    let i: number = 0;
    service["fetchActiveTeams$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // fetchNextMatchInfos$
  // ---------------------------------------------------------------------------

  it('fetchNextMatchInfos$, no amount given', (done: DoneFn) => {
    const season: number = 2021;
    const userId: string = "test_user_id";

    const nextMatch: Match = {
      documentId: "test_doc_id",
      season: season,
      matchday: 19,
      matchId: 70000,
      timestamp: 123456789,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: 100,
      teamIdAway: 40
    };

    const matchInfo: MatchInfo = {
      matchDate: new Date(123456789000),
      matchday: 19,
      teamNameHome: "FC Hollywood",
      teamNameAway: "Schaise 04",
      teamNameShortHome: "FCH",
      teamNameShortAway: "S04",
      placeHome: 1,
      placeAway: 18,
      pointsHome: 50,
      pointsAway: 6,
      betGoalsHome: 5,
      betGoalsAway: 1,
      isTopMatch: false
    };

    appDataSpy.getNextMatch$.withArgs(season, 1).and.returnValue(of(nextMatch));
    spyOn<any>(service, "makeMatchInfo$").withArgs(nextMatch, userId).and.returnValue(of(matchInfo));

    service["fetchNextMatchInfos$"](season, userId).subscribe(
      val => {
        expect(val).toEqual(matchInfo);
        done();
      }
    );
  });

  it('fetchNextMatchInfos$, amount argument given', (done: DoneFn) => {
    const season: number = 2021;
    const userId: string = "test_user_id";
    const amount: number = 2;

    const nextMatches: Match[] = [
      {
        documentId: "test_doc_id_0",
        season: season,
        matchday: 19,
        matchId: 70000,
        timestamp: 123456789,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 100,
        teamIdAway: 40
      },
      {
        documentId: "test_doc_id_1",
        season: season,
        matchday: 19,
        matchId: 70001,
        timestamp: 123456789,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 17,
        teamIdAway: 35
      },
    ];

    const matchInfos: MatchInfo[] = [
      {
        matchDate: new Date(123456789000),
        matchday: 19,
        teamNameHome: "FC Hollywood",
        teamNameAway: "Schaise 04",
        teamNameShortHome: "FCH",
        teamNameShortAway: "S04",
        placeHome: 1,
        placeAway: 18,
        pointsHome: 50,
        pointsAway: 6,
        betGoalsHome: 5,
        betGoalsAway: 1,
        isTopMatch: false
      },
      {
        matchDate: new Date(123456789000),
        matchday: 19,
        teamNameHome: "TSG Hoppenheim",
        teamNameAway: "TSV Handorf",
        teamNameShortHome: "TSG",
        teamNameShortAway: "TSV",
        placeHome: 5,
        placeAway: 12,
        pointsHome: 37,
        pointsAway: 29,
        betGoalsHome: 0,
        betGoalsAway: 2,
        isTopMatch: false
      }
    ];

    appDataSpy.getNextMatch$.withArgs(season, 2).and.returnValue(from(nextMatches));
    spyOn<any>(service, "makeMatchInfo$")
      .withArgs(nextMatches[0], userId).and.returnValue(of(matchInfos[0]))
      .withArgs(nextMatches[1], userId).and.returnValue(of(matchInfos[1]));

    let i: number = 0;
    service["fetchNextMatchInfos$"](season, userId, amount).subscribe(
      val => {
        expect(val).toEqual(matchInfos[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // fetchTopMatchInfos$
  // ---------------------------------------------------------------------------

  it('fetchTopMatchInfos$, top match available', (done: DoneFn) => {
    const season: number = 2021;
    const userId: string = "test_user_id";
    const matchday: number = 19;

    const topMatch: Match = {
      documentId: "test_doc_id",
      season: season,
      matchday: 19,
      matchId: 70000,
      timestamp: 123456789,
      isFinished: false,
      isTopMatch: true,
      teamIdHome: 100,
      teamIdAway: 40
    };

    const matchInfo: MatchInfo = {
      matchDate: new Date(123456789000),
      matchday: 19,
      teamNameHome: "Bayern",
      teamNameAway: "Dortmund",
      teamNameShortHome: "FCB",
      teamNameShortAway: "BVB",
      placeHome: 1,
      placeAway: 2,
      pointsHome: 50,
      pointsAway: 47,
      betGoalsHome: 1,
      betGoalsAway: 1,
      isTopMatch: true
    };

    appDataSpy.getTopMatch$.withArgs(season, matchday).and.returnValue(of(topMatch));
    spyOn<any>(service, "makeMatchInfo$").withArgs(topMatch, userId).and.returnValue(of(matchInfo));

    service["fetchTopMatchInfos$"](season, userId, matchday).subscribe(
      val => {
        expect(val).toEqual(matchInfo);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // fetchNextFixTime$
  // ---------------------------------------------------------------------------

  it('fetchNextFixTime$', (done: DoneFn) => {
    const season: number = 2021;

    const nextMatch: Match = {
      documentId: "test_doc_id",
      season: season,
      matchday: 19,
      matchId: 70000,
      timestamp: 123456789,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: 100,
      teamIdAway: 40
    };

    appDataSpy.getNextMatch$.withArgs(season).and.returnValue(of(nextMatch));

    service["fetchNextFixTime$"](season).subscribe(
      val => {
        expect(val).toEqual(nextMatch.timestamp);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // fetchOpenOverdueBets$
  // ---------------------------------------------------------------------------

  it('fetchOpenOverdueBets$, bets available from two matches', (done: DoneFn) => {
    const season: number = 2021;
    const matchday: number = 19;

    const matches: Match[] = [
      {
        documentId: "test_doc_id_0",
        season: season,
        matchday: 19,
        matchId: 70000,
        timestamp: 1500,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 100,
        teamIdAway: 40
      },
      {
        documentId: "test_doc_id_1",
        season: season,
        matchday: 19,
        matchId: 70001,
        timestamp: 1000,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 17,
        teamIdAway: 35
      },
      {
        documentId: "test_doc_id_2",
        season: season,
        matchday: 19,
        matchId: 70002,
        timestamp: 1200,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 21,
        teamIdAway: 55
      }
    ];

    const openBets_70001: Bet[] = [
      {
        documentId: "bet_doc_id_0",
        matchId: 70001,
        userId: "test_user_id_0",
        isFixed: false,
        goalsHome: 2,
        goalsAway: 0
      },
      {
        documentId: "bet_doc_id_1",
        matchId: 70001,
        userId: "test_user_id_1",
        isFixed: false,
        goalsHome: 2,
        goalsAway: 2
      }
    ];

    const openBets_70002: Bet[] = [
      {
        documentId: "bet_doc_id_2",
        matchId: 70002,
        userId: "test_user_id_2",
        isFixed: false,
        goalsHome: 4,
        goalsAway: 0
      }
    ];

    appDataSpy.getMatchesByMatchday$.and.returnValue(from(matches));
    appDataSpy.getOpenBets$.withArgs(70001).and.returnValue(from(openBets_70001));
    appDataSpy.getOpenBets$.withArgs(70002).and.returnValue(from(openBets_70002));

    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(1400 * 1000));

    const expectedValue: Bet[] = openBets_70001.concat(openBets_70002);

    let i: number = 0;
    service["fetchOpenOverdueBets$"](season, matchday).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );

    jasmine.clock().uninstall();
  });

  it('fetchOpenOverdueBets$, bets available from one match', (done: DoneFn) => {
    const season: number = 2021;
    const matchday: number = 19;

    const matches: Match[] = [
      {
        documentId: "test_doc_id_0",
        season: season,
        matchday: 19,
        matchId: 70000,
        timestamp: 1500,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 100,
        teamIdAway: 40
      },
      {
        documentId: "test_doc_id_1",
        season: season,
        matchday: 19,
        matchId: 70001,
        timestamp: 1200,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 17,
        teamIdAway: 35
      },
      {
        documentId: "test_doc_id_2",
        season: season,
        matchday: 19,
        matchId: 70002,
        timestamp: 1200,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 21,
        teamIdAway: 55
      }
    ];

    const openBets_70001: Bet[] = [
      {
        documentId: "bet_doc_id_0",
        matchId: 70001,
        userId: "test_user_id_0",
        isFixed: false,
        goalsHome: 2,
        goalsAway: 0
      },
      {
        documentId: "bet_doc_id_1",
        matchId: 70001,
        userId: "test_user_id_1",
        isFixed: false,
        goalsHome: 2,
        goalsAway: 2
      }
    ];

    const openBets_70002: Bet[] = [];

    appDataSpy.getMatchesByMatchday$.and.returnValue(from(matches));
    appDataSpy.getOpenBets$.withArgs(70001).and.returnValue(from(openBets_70001));
    appDataSpy.getOpenBets$.withArgs(70002).and.returnValue(from(openBets_70002));

    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(1400 * 1000));

    const expectedValue: Bet[] = openBets_70001;

    let i: number = 0;
    service["fetchOpenOverdueBets$"](season, matchday).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );

    jasmine.clock().uninstall();
  });

  it('fetchOpenOverdueBets$, no open bets available', (done: DoneFn) => {
    const season: number = 2021;
    const matchday: number = 19;

    const matches: Match[] = [
      {
        documentId: "test_doc_id_0",
        season: season,
        matchday: 19,
        matchId: 70000,
        timestamp: 1500,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 100,
        teamIdAway: 40
      },
      {
        documentId: "test_doc_id_1",
        season: season,
        matchday: 19,
        matchId: 70001,
        timestamp: 1200,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 17,
        teamIdAway: 35
      },
      {
        documentId: "test_doc_id_2",
        season: season,
        matchday: 19,
        matchId: 70002,
        timestamp: 1200,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 21,
        teamIdAway: 55
      }
    ];

    const openBets_70001: Bet[] = [];
    const openBets_70002: Bet[] = [];

    appDataSpy.getMatchesByMatchday$.and.returnValue(from(matches));
    appDataSpy.getOpenBets$.withArgs(70001).and.returnValue(from(openBets_70001));
    appDataSpy.getOpenBets$.withArgs(70002).and.returnValue(from(openBets_70002));

    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(1400 * 1000));

    const defaultValue: Bet = {
      documentId: "default_doc_id",
      matchId: -1,
      userId: "default_user_id",
      isFixed: false,
      goalsHome: -1,
      goalsAway: -1
    };

    let i: number = 0;
    service["fetchOpenOverdueBets$"](season, matchday).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );

    jasmine.clock().uninstall();
  });

  // ---------------------------------------------------------------------------
  // fetchOpenOverdueSeasonBets$
  // ---------------------------------------------------------------------------

  it('fetchOpenOverdueSeasonBets$, open bets available', (done: DoneFn) => {
    const season: number = 2021;

    const seasonBets_user_0: SeasonBet[] = [
      {
        documentId: "doc_0",
        season: season,
        userId: "user_id_0",
        isFixed: false,
        place: 1,
        teamId: 10
      },
      {
        documentId: "doc_1",
        season: season,
        userId: "user_id_0",
        isFixed: true,
        place: 2,
        teamId: 20
      },
      {
        documentId: "doc_2",
        season: season,
        userId: "user_id_0",
        isFixed: true,
        place: 16,
        teamId: 160
      },
      {
        documentId: "doc_3",
        season: season,
        userId: "user_id_0",
        isFixed: false,
        place: 17,
        teamId: 170
      },
      {
        documentId: "doc_4",
        season: season,
        userId: "user_id_0",
        isFixed: false,
        place: 18,
        teamId: 180
      }
    ];

    const seasonBets_user_1: SeasonBet[] = [
      {
        documentId: "doc_0",
        season: season,
        userId: "user_id_1",
        isFixed: true,
        place: 1,
        teamId: 10
      },
      {
        documentId: "doc_1",
        season: season,
        userId: "user_id_1",
        isFixed: false,
        place: 2,
        teamId: 20
      },
      {
        documentId: "doc_2",
        season: season,
        userId: "user_id_1",
        isFixed: true,
        place: 16,
        teamId: 160
      },
      {
        documentId: "doc_3",
        season: season,
        userId: "user_id_1",
        isFixed: true,
        place: 17,
        teamId: 170
      },
      {
        documentId: "doc_4",
        season: season,
        userId: "user_id_1",
        isFixed: true,
        place: 18,
        teamId: 180
      }
    ];

    appDataSpy.getActiveUserIds$.and.returnValue(of("user_id_0", "user_id_1"));
    appDataSpy.getSeasonBet$
      .withArgs(season, 1, "user_id_0").and.returnValue(of(seasonBets_user_0[0]))
      .withArgs(season, 2, "user_id_0").and.returnValue(of(seasonBets_user_0[1]))
      .withArgs(season, -3, "user_id_0").and.returnValue(of(seasonBets_user_0[2]))
      .withArgs(season, -2, "user_id_0").and.returnValue(of(seasonBets_user_0[3]))
      .withArgs(season, -1, "user_id_0").and.returnValue(of(seasonBets_user_0[4]))
      .withArgs(season, 1, "user_id_1").and.returnValue(of(seasonBets_user_1[0]))
      .withArgs(season, 2, "user_id_1").and.returnValue(of(seasonBets_user_1[1]))
      .withArgs(season, -3, "user_id_1").and.returnValue(of(seasonBets_user_1[2]))
      .withArgs(season, -2, "user_id_1").and.returnValue(of(seasonBets_user_1[3]))
      .withArgs(season, -1, "user_id_1").and.returnValue(of(seasonBets_user_1[4]));
    spyOn<any>(service, "getCurrentTimestamp$").and.returnValue(of(1000));
    spyOn<any>(service, "getFirstMatchTimestamp$").and.returnValue(of(999));

    const expectedValues: SeasonBet[] = [
      seasonBets_user_0[0],
      seasonBets_user_0[3],
      seasonBets_user_0[4],
      seasonBets_user_1[1]
    ];

    let i: number = 0;
    service["fetchOpenOverdueSeasonBets$"](season).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getClosestMatchday$
  // ---------------------------------------------------------------------------

  it('getClosestMatchday$, next match closest', (done: DoneFn) => {
    const nextMatch: Match = {
      documentId: "test_id_0",
      season: 2021,
      matchday: 15,
      matchId: 1243,
      timestamp: 1500,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: 10,
      teamIdAway: 35
    };

    const lastMatch: Match = {
      documentId: "test_id_0",
      season: 2021,
      matchday: 14,
      matchId: 1242,
      timestamp: 100,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: 167,
      teamIdAway: 54
    };
    appDataSpy.getNextMatch$.and.returnValue(of(nextMatch));
    appDataSpy.getLastMatch$.and.returnValue(of(lastMatch));
    spyOn<any>(service, "getCurrentTimestamp$").and.returnValue(of(1000));

    let expectedValue: number = nextMatch.matchday;

    service["getClosestMatchday$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it('getClosestMatchday$, last match closest', (done: DoneFn) => {
    const nextMatch: Match = {
      documentId: "test_id_0",
      season: 2021,
      matchday: 15,
      matchId: 1243,
      timestamp: 3000,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: 10,
      teamIdAway: 35
    };

    const lastMatch: Match = {
      documentId: "test_id_0",
      season: 2021,
      matchday: 14,
      matchId: 1242,
      timestamp: 900,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: 167,
      teamIdAway: 54
    };
    appDataSpy.getNextMatch$.and.returnValue(of(nextMatch));
    appDataSpy.getLastMatch$.and.returnValue(of(lastMatch));
    spyOn<any>(service, "getCurrentTimestamp$").and.returnValue(of(1000));

    let expectedValue: number = lastMatch.matchday;

    service["getClosestMatchday$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it('getClosestMatchday$, time difference equals, must return next matchday', (done: DoneFn) => {
    const nextMatch: Match = {
      documentId: "test_id_0",
      season: 2021,
      matchday: 15,
      matchId: 1243,
      timestamp: 1500,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: 10,
      teamIdAway: 35
    };

    const lastMatch: Match = {
      documentId: "test_id_0",
      season: 2021,
      matchday: 14,
      matchId: 1242,
      timestamp: 500,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: 167,
      teamIdAway: 54
    };
    appDataSpy.getNextMatch$.and.returnValue(of(nextMatch));
    appDataSpy.getLastMatch$.and.returnValue(of(lastMatch));
    spyOn<any>(service, "getCurrentTimestamp$").and.returnValue(of(1000));

    let expectedValue: number = nextMatch.matchday;

    service["getClosestMatchday$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // matchdayIsFinished$
  // ---------------------------------------------------------------------------

  it('matchdayIsFinished$, last match not finished', (done: DoneFn) => {
    const matches: Match[] = [
      {
        documentId: "first_match",
        season: 2021,
        matchday: 26,
        matchId: 1234,
        timestamp: 0,
        isFinished: true,
        isTopMatch: false,
        teamIdHome: 10,
        teamIdAway: 35
      },
      {
        documentId: "another_match",
        season: 2021,
        matchday: 26,
        matchId: 1235,
        timestamp: 86400,
        isFinished: true,
        isTopMatch: false,
        teamIdHome: 11,
        teamIdAway: 39
      },
      {
        documentId: "last_match",
        season: 2021,
        matchday: 26,
        matchId: 1236,
        timestamp: 2 * 86400,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 12,
        teamIdAway: 50
      },
    ];

    appDataSpy.getMatchesByMatchday$.and.returnValue(from(matches));

    let expectedValue: boolean = false;

    service["matchdayIsFinished$"](2021, 26).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it('matchdayIsFinished$, last match finished', (done: DoneFn) => {
    const matches: Match[] = [
      {
        documentId: "first_match",
        season: 2021,
        matchday: 26,
        matchId: 1234,
        timestamp: 0,
        isFinished: true,
        isTopMatch: false,
        teamIdHome: 10,
        teamIdAway: 35
      },
      {
        documentId: "another_match",
        season: 2021,
        matchday: 26,
        matchId: 1235,
        timestamp: 86400,
        isFinished: true,
        isTopMatch: false,
        teamIdHome: 11,
        teamIdAway: 39
      },
      {
        documentId: "last_match",
        season: 2021,
        matchday: 26,
        matchId: 1236,
        timestamp: 2 * 86400,
        isFinished: true,
        isTopMatch: false,
        teamIdHome: 12,
        teamIdAway: 50
      },
    ];

    appDataSpy.getMatchesByMatchday$.and.returnValue(from(matches));

    let expectedValue: boolean = true;

    service["matchdayIsFinished$"](2021, 26).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it('matchdayIsFinished$, last match not finished, but postponed', (done: DoneFn) => {
    const matches: Match[] = [
      {
        documentId: "first_match",
        season: 2021,
        matchday: 26,
        matchId: 1234,
        timestamp: 0,
        isFinished: true,
        isTopMatch: false,
        teamIdHome: 10,
        teamIdAway: 35
      },
      {
        documentId: "another_match",
        season: 2021,
        matchday: 26,
        matchId: 1235,
        timestamp: 86400,
        isFinished: true,
        isTopMatch: false,
        teamIdHome: 11,
        teamIdAway: 39
      },
      {
        documentId: "last_match",
        season: 2021,
        matchday: 26,
        matchId: 1236,
        timestamp: 3 * 86400 + 1,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 12,
        teamIdAway: 50
      },
    ];

    appDataSpy.getMatchesByMatchday$.and.returnValue(from(matches));

    let expectedValue: boolean = true;

    service["matchdayIsFinished$"](2021, 26).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // matchdayHasBegun$
  // ---------------------------------------------------------------------------

  it('matchdayHasBegun$, no tolerance, matchday has begun', (done: DoneFn) => {
    const match: Match = {
      documentId: "first_match",
      season: 2021,
      matchday: 26,
      matchId: 1234,
      timestamp: 1500,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: 10,
      teamIdAway: 35
    };

    appDataSpy.getFirstMatchOfMatchday$.and.returnValue(of(match));
    spyOn<any>(service, "getCurrentTimestamp$").and.returnValue(of(2000));

    let expectedValue: boolean = true;

    service["matchdayHasBegun$"](2021, 26).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it('matchdayHasBegun$, no tolerance, matchday time equals current time, expect false', (done: DoneFn) => {
    const match: Match = {
      documentId: "first_match",
      season: 2021,
      matchday: 26,
      matchId: 1234,
      timestamp: 1500,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: 10,
      teamIdAway: 35
    };

    appDataSpy.getFirstMatchOfMatchday$.and.returnValue(of(match));
    spyOn<any>(service, "getCurrentTimestamp$").and.returnValue(of(1500));

    let expectedValue: boolean = false;

    service["matchdayHasBegun$"](2021, 26).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it('matchdayHasBegun$, tolerance given and current time inside tolerance, expect true', (done: DoneFn) => {
    const tolerance: number = 1000;

    const match: Match = {
      documentId: "first_match",
      season: 2021,
      matchday: 26,
      matchId: 1234,
      timestamp: 2000,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: 10,
      teamIdAway: 35
    };

    appDataSpy.getFirstMatchOfMatchday$.and.returnValue(of(match));
    spyOn<any>(service, "getCurrentTimestamp$").and.returnValue(of(1500));

    let expectedValue: boolean = false;

    service["matchdayHasBegun$"](2021, 26, tolerance).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it('matchdayHasBegun$, matchday time -1, expect false', (done: DoneFn) => {
    const match: Match = {
      documentId: "first_match",
      season: 2021,
      matchday: 26,
      matchId: 1234,
      timestamp: -1,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: 10,
      teamIdAway: 35
    };

    appDataSpy.getFirstMatchOfMatchday$.and.returnValue(of(match));
    spyOn<any>(service, "getCurrentTimestamp$").and.returnValue(of(1500));

    let expectedValue: boolean = false;

    service["matchdayHasBegun$"](2021, 26).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getCurrentMatchday$
  // ---------------------------------------------------------------------------

  it('getCurrentMatchday$, normal operation', (done: DoneFn) => {
    // for testing the functionality it's not of importance if 10 or 3
    // matches are returned. Important: More than 1 match returned

    const matches: Match[] = [
      {
        documentId: "dummy_match_0",
        season: 2021,
        matchday: 26,
        matchId: 12345,
        timestamp: 123456789,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 10,
        teamIdAway: 20
      },
      {
        documentId: "dummy_match_1",
        season: 2021,
        matchday: 26,
        matchId: 12346,
        timestamp: 123456789,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 11,
        teamIdAway: 21
      },
      {
        documentId: "dummy_match_2",
        season: 2021,
        matchday: 25,
        matchId: 12344,
        timestamp: 123436700,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 120,
        teamIdAway: 22
      },
    ]

    appDataSpy.getLastMatch$.and.returnValue(from(matches));

    let expectedValue: number = 26;

    service["getCurrentMatchday$"](2021).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it('getCurrentMatchday$, no last matches available (matchday == -1)', (done: DoneFn) => {
    // for testing the functionality it's not of importance if 10 or 3
    // matches are returned. Important: More than 1 match returned

    const matches: Match[] = [
      {
        documentId: "dummy_match_0",
        season: 2021,
        matchday: -1,
        matchId: -1,
        timestamp: -1,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: -1,
        teamIdAway: -1
      }
    ];

    appDataSpy.getLastMatch$.and.returnValue(from(matches));

    let expectedValue: number = 1;

    service["getCurrentMatchday$"](2021).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getFinishedMatchday$
  // ---------------------------------------------------------------------------

  it('getFinishedMatchday$, current matchday = finished matchday', (done: DoneFn) => {
    const currentMatchday: number = 26;

    spyOn<any>(service, "getCurrentMatchday$").and.returnValue(of(currentMatchday));
    spyOn<any>(service, "matchdayIsFinished$").and.returnValue(of(true));

    let expectedValue: number = currentMatchday;

    service["getFinishedMatchday$"](2021).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it('getFinishedMatchday$, current matchday > finished matchday', (done: DoneFn) => {
    const currentMatchday: number = 26;

    spyOn<any>(service, "getCurrentMatchday$").and.returnValue(of(currentMatchday));
    spyOn<any>(service, "matchdayIsFinished$").and.returnValue(of(false));

    let expectedValue: number = currentMatchday - 1;

    service["getFinishedMatchday$"](2021).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it('getFinishedMatchday$, no matches played yet', (done: DoneFn) => {
    const currentMatchday: number = 1;
    const fallbackMatch: Match = {
      documentId: "match_doc_id",
      season: 2021,
      matchday: 26,
      matchId: 1234,
      timestamp: 123456789,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: 10,
      teamIdAway: 35
    };

    spyOn<any>(service, "getCurrentMatchday$").and.returnValue(of(currentMatchday));
    spyOn<any>(service, "matchdayIsFinished$").and.returnValue(of(false));

    let expectedValue: number = 0;

    service["getFinishedMatchday$"](2021).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getTeamStats$
  // ---------------------------------------------------------------------------

  it('getTeamStats$', (done: DoneFn) => {
    const ranking: TeamRankingImportData[] = [
      {
        teamId: 10,
        matches: 26,
        points: 57,
        won: 17,
        draw: 6,
        lost: 3,
        goals: 61,
        goalsAgainst: 30
      },
      {
        teamId: 11,
        matches: 26,
        points: 55,
        won: 16,
        draw: 7,
        lost: 3,
        goals: 54,
        goalsAgainst: 27
      },
      {
        teamId: 12,
        matches: 26,
        points: 50,
        won: 15,
        draw: 5,
        lost: 6,
        goals: 51,
        goalsAgainst: 32
      }
    ];

    matchDataSpy.importCurrentTeamRanking$.and.returnValue(from(ranking));

    let expectedValue: any = {
      place: 2,
      points: 55
    };

    service["getTeamStats$"](11).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // getFirstMatchTimestamp$
  // ---------------------------------------------------------------------------

  it('getFirstMatchTimestamp$, normal operation', (done: DoneFn) => {
    // for testing the functionality it's not of importance if 9 or 3
    // matches are returned. Important: More than 1 match returned

    const matches: Match[] = [
      {
        documentId: "dummy_match_0",
        season: 2021,
        matchday: 26,
        matchId: 12345,
        timestamp: 100,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 10,
        teamIdAway: 20
      },
      {
        documentId: "dummy_match_1",
        season: 2021,
        matchday: 26,
        matchId: 12346,
        timestamp: 123456789,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 11,
        teamIdAway: 21
      },
      {
        documentId: "dummy_match_2",
        season: 2021,
        matchday: 25,
        matchId: 12344,
        timestamp: 123436700,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 120,
        teamIdAway: 22
      },
    ]

    appDataSpy.getMatchesByMatchday$.and.returnValue(from(matches));

    let expectedValue: number = 100;

    service["getFirstMatchTimestamp$"](2021).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });
});
