import { TestBed } from '@angular/core/testing';

import { Observable, of, from } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';
import { FetchTableService } from './fetch-table.service';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { StatisticsCalculatorService } from '../Businessrules/statistics-calculator.service';
import { Score, SeasonBet, SeasonResult, User } from '../Businessrules/basic_datastructures';
import { MatchdayScoreSnapshot } from '../Dataaccess/import_datastructures';
import { TableData } from './output_datastructures';

describe('FetchTableService', () => {
  let service: FetchTableService;
  let appDataSpy: jasmine.SpyObj<AppdataAccessService>;
  let statCalcSpy: jasmine.SpyObj<StatisticsCalculatorService>;

  beforeEach(() => {
    appDataSpy = jasmine.createSpyObj(["getMatchdayScoreSnapshot$", "getActiveUserIds$", "getSeasonBet$", "getSeasonResult$", "getUserDataById$"]);
    statCalcSpy = jasmine.createSpyObj(["addScoreArrays", "getSeasonScoreArray", "compareScores", "makePositions"]);

    TestBed.configureTestingModule({
      providers: [
        FetchTableService,
        { provide: AppdataAccessService, useValue: appDataSpy },
        { provide: StatisticsCalculatorService, useValue: statCalcSpy }
      ]
    });

    service = TestBed.inject(FetchTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // fetchSeasonScoreArray$
  // ---------------------------------------------------------------------------

  it('fetchSeasonScoreArray$, all data available', (done: DoneFn) => {
    const argument: number = 2020;

    const seasonBets: SeasonBet[] = [
      {
        documentId: "doc_01",
        season: argument,
        userId: "test_user_id_0",
        isFixed: true,
        place: 1,
        teamId: 1
      },
      {
        documentId: "doc_02",
        season: argument,
        userId: "test_user_id_0",
        isFixed: true,
        place: 2,
        teamId: 45
      },
      {
        documentId: "doc_0m1",
        season: argument,
        userId: "test_user_id_0",
        isFixed: true,
        place: -1,
        teamId: 10
      },
      {
        documentId: "doc_0m2",
        season: argument,
        userId: "test_user_id_0",
        isFixed: true,
        place: -2,
        teamId: 30
      },
      {
        documentId: "doc_0m3",
        season: argument,
        userId: "test_user_id_0",
        isFixed: true,
        place: -3,
        teamId: 67
      },
      {
        documentId: "doc_11",
        season: argument,
        userId: "test_user_id_1",
        isFixed: true,
        place: 1,
        teamId: 1
      },
      {
        documentId: "doc_12",
        season: argument,
        userId: "test_user_id_1",
        isFixed: true,
        place: 2,
        teamId: 2
      },
      {
        documentId: "doc_1m1",
        season: argument,
        userId: "test_user_id_1",
        isFixed: true,
        place: -1,
        teamId: 78
      },
      {
        documentId: "doc_1m2",
        season: argument,
        userId: "test_user_id_1",
        isFixed: true,
        place: -2,
        teamId: 1633
      },
      {
        documentId: "doc_1m3",
        season: argument,
        userId: "test_user_id_1",
        isFixed: true,
        place: -3,
        teamId: 123
      },
      {
        documentId: "doc_21",
        season: argument,
        userId: "test_user_id_2",
        isFixed: true,
        place: 1,
        teamId: 12
      },
      {
        documentId: "doc_22",
        season: argument,
        userId: "test_user_id_2",
        isFixed: true,
        place: 2,
        teamId: 2
      },
      {
        documentId: "doc_2m1",
        season: argument,
        userId: "test_user_id_2",
        isFixed: true,
        place: -1,
        teamId: 10
      },
      {
        documentId: "doc_2m2",
        season: argument,
        userId: "test_user_id_2",
        isFixed: true,
        place: -2,
        teamId: 20
      },
      {
        documentId: "doc_2m3",
        season: argument,
        userId: "test_user_id_2",
        isFixed: true,
        place: -3,
        teamId: 56
      }
    ];

    const seasonResults: SeasonResult[] = [
      {
        documentId: "doc_r1",
        season: argument,
        place: 1,
        teamId: 1
      },
      {
        documentId: "doc_r2",
        season: argument,
        place: 2,
        teamId: 2
      },
      {
        documentId: "doc_rm1",
        season: argument,
        place: -1,
        teamId: 10
      },
      {
        documentId: "doc_rm2",
        season: argument,
        place: -2,
        teamId: 20
      },
      {
        documentId: "doc_rm3",
        season: argument,
        place: -3,
        teamId: 30
      }
    ];

    const seasonScores: Score[] = [
      {
        userId: "test_user_id_0",
        points: 8,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 8
      },
      {
        userId: "test_user_id_1",
        points: 5,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 5
      },
      {
        userId: "test_user_id_2",
        points: 6,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 6
      }
    ];

    const expectedValues: Score[] = seasonScores;

    spyOn<any>(service, "fetchSeasonBetArray$").and.returnValue(of(seasonBets));
    spyOn<any>(service, "fetchSeasonResultArray$").and.returnValue(of(seasonResults));
    statCalcSpy.getSeasonScoreArray.and.returnValue(seasonScores);

    let i: number = 0;
    service["fetchSeasonScoreArray$"](argument).subscribe(
      val => {
        expect(statCalcSpy.getSeasonScoreArray).toHaveBeenCalledWith(seasonBets, seasonResults);
        expect(val).toEqual(expectedValues);
        done();
      }
    );
  });

  it('fetchSeasonScoreArray$, fetchSeasonBetArray returns empty array', (done: DoneFn) => {
    const argument: number = 2020;
    const seasonResults: SeasonResult[] = [
      {
        documentId: "doc_r1",
        season: argument,
        place: 1,
        teamId: 1
      },
      {
        documentId: "doc_r2",
        season: argument,
        place: 2,
        teamId: 2
      },
      {
        documentId: "doc_rm1",
        season: argument,
        place: -1,
        teamId: 10
      },
      {
        documentId: "doc_rm2",
        season: argument,
        place: -2,
        teamId: 20
      },
      {
        documentId: "doc_rm3",
        season: argument,
        place: -3,
        teamId: 30
      }
    ];

    const expectedValues: Score[] = [];

    spyOn<any>(service, "fetchSeasonBetArray$").and.returnValue(of([]));
    spyOn<any>(service, "fetchSeasonResultArray$").and.returnValue(of(seasonResults));
    statCalcSpy.getSeasonScoreArray.and.returnValue([]);

    let i: number = 0;
    service["fetchSeasonScoreArray$"](argument).subscribe(
      val => {
        expect(statCalcSpy.getSeasonScoreArray).toHaveBeenCalledWith([], seasonResults);
        expect(val).toEqual(expectedValues);
        done();
      }
    );
  });

  it('fetchSeasonScoreArray$, fetchSeasonResultArray returns empty array', (done: DoneFn) => {
    const argument: number = 2020;

    const seasonBets: SeasonBet[] = [
      {
        documentId: "doc_01",
        season: argument,
        userId: "test_user_id_0",
        isFixed: true,
        place: 1,
        teamId: 1
      },
      {
        documentId: "doc_02",
        season: argument,
        userId: "test_user_id_0",
        isFixed: true,
        place: 2,
        teamId: 45
      },
      {
        documentId: "doc_0m1",
        season: argument,
        userId: "test_user_id_0",
        isFixed: true,
        place: -1,
        teamId: 10
      },
      {
        documentId: "doc_0m2",
        season: argument,
        userId: "test_user_id_0",
        isFixed: true,
        place: -2,
        teamId: 30
      },
      {
        documentId: "doc_0m3",
        season: argument,
        userId: "test_user_id_0",
        isFixed: true,
        place: -3,
        teamId: 67
      },
      {
        documentId: "doc_11",
        season: argument,
        userId: "test_user_id_1",
        isFixed: true,
        place: 1,
        teamId: 1
      },
      {
        documentId: "doc_12",
        season: argument,
        userId: "test_user_id_1",
        isFixed: true,
        place: 2,
        teamId: 2
      },
      {
        documentId: "doc_1m1",
        season: argument,
        userId: "test_user_id_1",
        isFixed: true,
        place: -1,
        teamId: 78
      },
      {
        documentId: "doc_1m2",
        season: argument,
        userId: "test_user_id_1",
        isFixed: true,
        place: -2,
        teamId: 1633
      },
      {
        documentId: "doc_1m3",
        season: argument,
        userId: "test_user_id_1",
        isFixed: true,
        place: -3,
        teamId: 123
      },
      {
        documentId: "doc_21",
        season: argument,
        userId: "test_user_id_2",
        isFixed: true,
        place: 1,
        teamId: 12
      },
      {
        documentId: "doc_22",
        season: argument,
        userId: "test_user_id_2",
        isFixed: true,
        place: 2,
        teamId: 2
      },
      {
        documentId: "doc_2m1",
        season: argument,
        userId: "test_user_id_2",
        isFixed: true,
        place: -1,
        teamId: 10
      },
      {
        documentId: "doc_2m2",
        season: argument,
        userId: "test_user_id_2",
        isFixed: true,
        place: -2,
        teamId: 20
      },
      {
        documentId: "doc_2m3",
        season: argument,
        userId: "test_user_id_2",
        isFixed: true,
        place: -3,
        teamId: 56
      }
    ];

    const expectedValues: Score[] = [];

    spyOn<any>(service, "fetchSeasonBetArray$").and.returnValue(of(seasonBets));
    spyOn<any>(service, "fetchSeasonResultArray$").and.returnValue(of([]));
    statCalcSpy.getSeasonScoreArray.and.returnValue([]);

    let i: number = 0;
    service["fetchSeasonScoreArray$"](argument).subscribe(
      val => {
        expect(statCalcSpy.getSeasonScoreArray).toHaveBeenCalledWith(seasonBets, []);
        expect(val).toEqual(expectedValues);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // fetchSeasonBetArray$
  // ---------------------------------------------------------------------------

  it('fetchSeasonBetArray$, data available', (done: DoneFn) => {
    const argument: number = 2020;

    const seasonBetsUser0: SeasonBet[] = [
      {
        documentId: "doc_01",
        season: argument,
        userId: "test_user_id_0",
        isFixed: true,
        place: 1,
        teamId: 1
      },
      {
        documentId: "doc_02",
        season: argument,
        userId: "test_user_id_0",
        isFixed: true,
        place: 2,
        teamId: 45
      },
      {
        documentId: "doc_0m1",
        season: argument,
        userId: "test_user_id_0",
        isFixed: true,
        place: -3,
        teamId: 10
      },
      {
        documentId: "doc_0m2",
        season: argument,
        userId: "test_user_id_0",
        isFixed: true,
        place: -2,
        teamId: 30
      },
      {
        documentId: "doc_0m3",
        season: argument,
        userId: "test_user_id_0",
        isFixed: true,
        place: -1,
        teamId: 67
      }
    ];

    const seasonBetsUser1: SeasonBet[] = [
      {
        documentId: "doc_11",
        season: argument,
        userId: "test_user_id_1",
        isFixed: true,
        place: 1,
        teamId: 1
      },
      {
        documentId: "doc_12",
        season: argument,
        userId: "test_user_id_1",
        isFixed: true,
        place: 2,
        teamId: 2
      },
      {
        documentId: "doc_1m1",
        season: argument,
        userId: "test_user_id_1",
        isFixed: true,
        place: -3,
        teamId: 78
      },
      {
        documentId: "doc_1m2",
        season: argument,
        userId: "test_user_id_1",
        isFixed: true,
        place: -2,
        teamId: 1633
      },
      {
        documentId: "doc_1m3",
        season: argument,
        userId: "test_user_id_1",
        isFixed: true,
        place: -1,
        teamId: 123
      }
    ];

    const seasonBetsUser2: SeasonBet[] = [
      {
        documentId: "doc_21",
        season: argument,
        userId: "test_user_id_2",
        isFixed: true,
        place: 1,
        teamId: 12
      },
      {
        documentId: "doc_22",
        season: argument,
        userId: "test_user_id_2",
        isFixed: true,
        place: 2,
        teamId: 2
      },
      {
        documentId: "doc_2m1",
        season: argument,
        userId: "test_user_id_2",
        isFixed: true,
        place: -3,
        teamId: 10
      },
      {
        documentId: "doc_2m2",
        season: argument,
        userId: "test_user_id_2",
        isFixed: true,
        place: -2,
        teamId: 20
      },
      {
        documentId: "doc_2m3",
        season: argument,
        userId: "test_user_id_2",
        isFixed: true,
        place: -1,
        teamId: 56
      }
    ];

    const expectedValues: SeasonBet[] = seasonBetsUser0.concat(seasonBetsUser1).concat(seasonBetsUser2);

    appDataSpy.getActiveUserIds$.and.returnValue(of("test_user_id_0", "test_user_id_1", "test_user_id_2"));
    appDataSpy.getSeasonBet$
      .withArgs(argument, 1, "test_user_id_0").and.returnValue(of(seasonBetsUser0[0]))
      .withArgs(argument, 2, "test_user_id_0").and.returnValue(of(seasonBetsUser0[1]))
      .withArgs(argument, -3, "test_user_id_0").and.returnValue(of(seasonBetsUser0[2]))
      .withArgs(argument, -2, "test_user_id_0").and.returnValue(of(seasonBetsUser0[3]))
      .withArgs(argument, -1, "test_user_id_0").and.returnValue(of(seasonBetsUser0[4]))
      .withArgs(argument, 1, "test_user_id_1").and.returnValue(of(seasonBetsUser1[0]))
      .withArgs(argument, 2, "test_user_id_1").and.returnValue(of(seasonBetsUser1[1]))
      .withArgs(argument, -3, "test_user_id_1").and.returnValue(of(seasonBetsUser1[2]))
      .withArgs(argument, -2, "test_user_id_1").and.returnValue(of(seasonBetsUser1[3]))
      .withArgs(argument, -1, "test_user_id_1").and.returnValue(of(seasonBetsUser1[4]))
      .withArgs(argument, 1, "test_user_id_2").and.returnValue(of(seasonBetsUser2[0]))
      .withArgs(argument, 2, "test_user_id_2").and.returnValue(of(seasonBetsUser2[1]))
      .withArgs(argument, -3, "test_user_id_2").and.returnValue(of(seasonBetsUser2[2]))
      .withArgs(argument, -2, "test_user_id_2").and.returnValue(of(seasonBetsUser2[3]))
      .withArgs(argument, -1, "test_user_id_2").and.returnValue(of(seasonBetsUser2[4]));

    service["fetchSeasonBetArray$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValues);
        done();
      }
    );
  });

  it('fetchSeasonBetArray$, getActiveUserIds$ returns empty Observable', (done: DoneFn) => {
    const argument: number = 2020;

    const expectedValues: SeasonBet[] = [];

    appDataSpy.getActiveUserIds$.and.returnValue(from([]));

    service["fetchSeasonBetArray$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValues);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // fetchSeasonResultArray$
  // ---------------------------------------------------------------------------#

  it('fetchSeasonResultArray$, data available', (done: DoneFn) => {
    const argument: number = 2020;

    const seasonResults: SeasonResult[] = [
      {
        documentId: "doc_r1",
        season: argument,
        place: 1,
        teamId: 1
      },
      {
        documentId: "doc_r2",
        season: argument,
        place: 2,
        teamId: 2
      },
      {
        documentId: "doc_rm1",
        season: argument,
        place: -1,
        teamId: 10
      },
      {
        documentId: "doc_rm2",
        season: argument,
        place: -2,
        teamId: 20
      },
      {
        documentId: "doc_rm3",
        season: argument,
        place: -3,
        teamId: 30
      }
    ];

    appDataSpy.getSeasonResult$
      .withArgs(argument, 1).and.returnValue(of(seasonResults[0]))
      .withArgs(argument, 2).and.returnValue(of(seasonResults[1]))
      .withArgs(argument, -3).and.returnValue(of(seasonResults[2]))
      .withArgs(argument, -2).and.returnValue(of(seasonResults[3]))
      .withArgs(argument, -1).and.returnValue(of(seasonResults[4]));

    const expectedValues: SeasonResult[] = seasonResults;

    service["fetchSeasonResultArray$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValues);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // scoreSnapToScoreArray$
  // ---------------------------------------------------------------------------

  it('scoreSnapToScoreArray, data available', () => {

    const argument: MatchdayScoreSnapshot = {
      documentId: "doc_0",
      season: 2020,
      matchday: 18,
      userId: ["test_user_id_2", "test_user_id_0", "test_user_id_1"],
      points: [9, 8, 5],
      matches: [6, 5, 4],
      results: [2, 1, 1],
      extraTop: [1, 0, 0],
      extraOutsider: [0, 2, 0],
      extraSeason: [0, 0, 0]
    };

    const expectedValue: Score[] =
      [
        {
          userId: "test_user_id_2",
          points: 9,
          matches: 6,
          results: 2,
          extraTop: 1,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_0",
          points: 8,
          matches: 5,
          results: 1,
          extraTop: 0,
          extraOutsider: 2,
          extraSeason: 0
        },
        {
          userId: "test_user_id_1",
          points: 5,
          matches: 4,
          results: 1,
          extraTop: 0,
          extraOutsider: 0,
          extraSeason: 0
        }
      ];

    expect(service["scoreSnapToScoreArray"](argument)).toEqual(expectedValue);
  });

  it('scoreSnapToScoreArray, array lengths diverge', () => {

    const argument: MatchdayScoreSnapshot = {
      documentId: "doc_0",
      season: 2020,
      matchday: 18,
      userId: ["test_user_id_2", "test_user_id_0", "test_user_id_1"],
      points: [9, 8], // array length smaller !
      matches: [6, 5, 4],
      results: [2, 1, 1],
      extraTop: [1, 0, 0],
      extraOutsider: [0, 2, 0],
      extraSeason: [0, 0, 0]
    };

    const expectedValue: Score[] = [];

    expect(service["scoreSnapToScoreArray"](argument)).toEqual(expectedValue);
  });

  it('scoreSnapToScoreArray, arrays empty', () => {

    const argument: MatchdayScoreSnapshot = {
      documentId: "doc_0",
      season: 2020,
      matchday: 18,
      userId: [],
      points: [],
      matches: [],
      results: [],
      extraTop: [],
      extraOutsider: [],
      extraSeason: []
    };

    const expectedValue: Score[] = [];

    expect(service["scoreSnapToScoreArray"](argument)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // initScoreArray$
  // ---------------------------------------------------------------------------

  it('initScoreArray$, data available', (done: DoneFn) => {

    const userIds: string[] = ["test_user_id_0", "test_user_id_1", "test_user_id_2"];
    const expectedValues: Score[] = [
      {
        userId: userIds[0],
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0,
      },
      {
        userId: userIds[1],
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0,
      },
      {
        userId: userIds[2],
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0,
      }
    ];

    appDataSpy.getActiveUserIds$.and.returnValue(from(userIds));

    service["initScoreArray$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValues);
        done();
      }
    );
  });

  it('initScoreArray$, empty userId array available', (done: DoneFn) => {

    const userIds: string[] = [];
    const expectedValues: Score[] = [];

    appDataSpy.getActiveUserIds$.and.returnValue(from(userIds));

    service["initScoreArray$"]().subscribe(
      val => {
        expect(val).toEqual(expectedValues);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // makeTableData$
  // ---------------------------------------------------------------------------

  it('makeTableData$, data available', (done: DoneFn) => {

    const argument: Score[] = [
      {
        userId: "test_user_id_0",
        points: 8,
        matches: 5,
        results: 1,
        extraTop: 0,
        extraOutsider: 2,
        extraSeason: 0
      },
      {
        userId: "test_user_id_1",
        points: 5,
        matches: 4,
        results: 1,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_2",
        points: 9,
        matches: 6,
        results: 2,
        extraTop: 1,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    const userData: User[] = [
      {
        documentId: "doc_02",
        id: "test_user_id_2",
        email: "user.two@mail.com",
        displayName: "user_name_2",
        isAdmin: false,
        isActive: true
      },
      {
        documentId: "doc_00",
        id: "test_user_id_0",
        email: "user.zero@mail.com",
        displayName: "user_name_0",
        isAdmin: false,
        isActive: true
      },
      {
        documentId: "doc_01",
        id: "test_user_id_1",
        email: "user.one@mail.com",
        displayName: "user_name_1",
        isAdmin: false,
        isActive: true
      }
    ];

    const expectedValues: TableData[] = [
      {
        position: 1,
        userName: userData[0].displayName,
        points: argument[2].points,
        matches: argument[2].matches,
        results: argument[2].results,
        extraTop: argument[2].extraTop,
        extraOutsider: argument[2].extraOutsider,
        extraSeason: argument[2].extraSeason
      },
      {
        position: 2,
        userName: userData[1].displayName,
        points: argument[0].points,
        matches: argument[0].matches,
        results: argument[0].results,
        extraTop: argument[0].extraTop,
        extraOutsider: argument[0].extraOutsider,
        extraSeason: argument[0].extraSeason
      },
      {
        position: 3,
        userName: userData[2].displayName,
        points: argument[1].points,
        matches: argument[1].matches,
        results: argument[1].results,
        extraTop: argument[1].extraTop,
        extraOutsider: argument[1].extraOutsider,
        extraSeason: argument[1].extraSeason
      }
    ];

    statCalcSpy.compareScores.and.callFake(
      (a: Score, b: Score): number => {
        if (a.points != b.points) {
          return b.points - a.points;
        }
        else if (a.matches != b.matches) {
          return b.matches - a.matches;
        }
        else if (a.results != b.results) {
          return b.results - a.results;
        }
        else {
          return 0;
        }
      }
    );

    statCalcSpy.makePositions.and.returnValue([1, 2, 3]);

    appDataSpy.getUserDataById$
      .withArgs(userData[0].id).and.returnValue(of(userData[0]))
      .withArgs(userData[1].id).and.returnValue(of(userData[1]))
      .withArgs(userData[2].id).and.returnValue(of(userData[2]));

    let i: number = 0;
    service["makeTableData$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('makeTableData$, Score array empty', (done: DoneFn) => {

    const argument: Score[] = [];

    const expectedValues: TableData[] = [];

    statCalcSpy.compareScores.and.callFake(
      (a: Score, b: Score): number => {
        if (a.points != b.points) {
          return b.points - a.points;
        }
        else if (a.matches != b.matches) {
          return b.matches - a.matches;
        }
        else if (a.results != b.results) {
          return b.results - a.results;
        }
        else {
          return 0;
        }
      }
    );

    statCalcSpy.makePositions.and.returnValue([]);

    const defaultValue: TableData = {
      position: -1,
      userName: "DEFAULT_USER",
      points: -1,
      matches: -1,
      results: -1,
      extraTop: -1,
      extraOutsider: -1,
      extraSeason: -1
    }

    let i: number = 0;
    service["makeTableData$"](argument).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );

  });

  // ---------------------------------------------------------------------------
  // fetchTableByMatchdays$
  // ---------------------------------------------------------------------------

  it('fetchTableByMatchdays$, all data available, no including of seasonScore', (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number[] = [1, 2, 3];

    const scoreSnaps: MatchdayScoreSnapshot[] = [
      {
        documentId: "doc_0",
        season: argument1,
        matchday: argument2[0],
        userId: ["test_user_id_2", "test_user_id_0", "test_user_id_1"],
        points: [9, 8, 5],
        matches: [6, 5, 4],
        results: [2, 1, 1],
        extraTop: [1, 0, 0],
        extraOutsider: [0, 2, 0],
        extraSeason: [0, 0, 0]
      },
      {
        documentId: "doc_1",
        season: argument1,
        matchday: argument2[1],
        userId: ["test_user_id_1", "test_user_id_2", "test_user_id_0"],
        points: [4, 4, 6],
        matches: [4, 2, 4],
        results: [0, 1, 0],
        extraTop: [0, 1, 1],
        extraOutsider: [0, 0, 1],
        extraSeason: [0, 0, 0]
      },
      {
        documentId: "doc_2",
        season: argument1,
        matchday: argument2[2],
        userId: ["test_user_id_0", "test_user_id_1", "test_user_id_2"],
        points: [12, 5, 7],
        matches: [6, 3, 5],
        results: [3, 1, 1],
        extraTop: [2, 1, 0],
        extraOutsider: [1, 0, 1],
        extraSeason: [0, 0, 0]
      }
    ];

    const initialScoreArray: Score[] = [
      {
        userId: "test_user_id_0",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_1",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_2",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    const convertedScores: Score[][] = [
      [
        {
          userId: "test_user_id_2",
          points: 9,
          matches: 6,
          results: 2,
          extraTop: 1,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_0",
          points: 8,
          matches: 5,
          results: 1,
          extraTop: 0,
          extraOutsider: 2,
          extraSeason: 0
        },
        {
          userId: "test_user_id_1",
          points: 5,
          matches: 4,
          results: 1,
          extraTop: 0,
          extraOutsider: 0,
          extraSeason: 0
        }
      ],
      [
        {
          userId: "test_user_id_1",
          points: 4,
          matches: 4,
          results: 0,
          extraTop: 0,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_2",
          points: 4,
          matches: 2,
          results: 1,
          extraTop: 1,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_0",
          points: 6,
          matches: 4,
          results: 0,
          extraTop: 1,
          extraOutsider: 1,
          extraSeason: 0
        }
      ],
      [
        {
          userId: "test_user_id_0",
          points: 12,
          matches: 6,
          results: 3,
          extraTop: 2,
          extraOutsider: 1,
          extraSeason: 0
        },
        {
          userId: "test_user_id_1",
          points: 5,
          matches: 3,
          results: 1,
          extraTop: 1,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_2",
          points: 7,
          matches: 5,
          results: 1,
          extraTop: 0,
          extraOutsider: 1,
          extraSeason: 0
        }
      ]
    ];

    const addedScoreArrays: Score[][] = [
      [
        {
          userId: "test_user_id_0",
          points: 8,
          matches: 5,
          results: 1,
          extraTop: 0,
          extraOutsider: 2,
          extraSeason: 0
        },
        {
          userId: "test_user_id_1",
          points: 5,
          matches: 4,
          results: 1,
          extraTop: 0,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_2",
          points: 9,
          matches: 6,
          results: 2,
          extraTop: 1,
          extraOutsider: 0,
          extraSeason: 0
        }
      ],
      [
        {
          userId: "test_user_id_0",
          points: 14,
          matches: 9,
          results: 1,
          extraTop: 1,
          extraOutsider: 3,
          extraSeason: 0
        },
        {
          userId: "test_user_id_1",
          points: 9,
          matches: 8,
          results: 1,
          extraTop: 0,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_2",
          points: 13,
          matches: 8,
          results: 3,
          extraTop: 2,
          extraOutsider: 0,
          extraSeason: 0
        }
      ],
      [
        {
          userId: "test_user_id_0",
          points: 26,
          matches: 15,
          results: 4,
          extraTop: 3,
          extraOutsider: 4,
          extraSeason: 0
        },
        {
          userId: "test_user_id_1",
          points: 14,
          matches: 11,
          results: 2,
          extraTop: 1,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_2",
          points: 20,
          matches: 13,
          results: 4,
          extraTop: 2,
          extraOutsider: 1,
          extraSeason: 0
        }
      ],
      [
        {
          userId: "test_user_id_0",
          points: 30,
          matches: 15,
          results: 4,
          extraTop: 3,
          extraOutsider: 4,
          extraSeason: 4
        },
        {
          userId: "test_user_id_1",
          points: 14,
          matches: 11,
          results: 2,
          extraTop: 1,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_2",
          points: 23,
          matches: 13,
          results: 4,
          extraTop: 2,
          extraOutsider: 1,
          extraSeason: 3
        }
      ]
    ];

    const seasonScoreArray: Score[] = [
      {
        userId: "test_user_id_2",
        points: 3,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 3
      },
      {
        userId: "test_user_id_0",
        points: 4,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 4
      },
      {
        userId: "test_user_id_1",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    const expectedValues: TableData[] = [
      {
        position: 1,
        userName: "user_name_0",
        points: 26,
        matches: 15,
        results: 4,
        extraTop: 3,
        extraOutsider: 4,
        extraSeason: 0
      },
      {
        position: 2,
        userName: "user_name_2",
        points: 20,
        matches: 13,
        results: 4,
        extraTop: 2,
        extraOutsider: 1,
        extraSeason: 0
      },
      {
        position: 3,
        userName: "user_name_1",
        points: 14,
        matches: 11,
        results: 2,
        extraTop: 1,
        extraOutsider: 0,
        extraSeason: 0
      },
    ];

    appDataSpy.getMatchdayScoreSnapshot$
      .withArgs(argument1, argument2[0]).and.returnValue(of(scoreSnaps[0]))
      .withArgs(argument1, argument2[1]).and.returnValue(of(scoreSnaps[1]))
      .withArgs(argument1, argument2[2]).and.returnValue(of(scoreSnaps[2]));

    appDataSpy.getActiveUserIds$.and.returnValue(of("test_user_id_0", "test_user_id_1", "test_user_id_2"));

    spyOn<any>(service, "scoreSnapToScoreArray")
      .withArgs(scoreSnaps[0]).and.returnValue(convertedScores[0])
      .withArgs(scoreSnaps[1]).and.returnValue(convertedScores[1])
      .withArgs(scoreSnaps[2]).and.returnValue(convertedScores[2]);

    statCalcSpy.addScoreArrays
      .withArgs([], convertedScores[0]).and.returnValue(addedScoreArrays[0])
      .withArgs(addedScoreArrays[0], convertedScores[1]).and.returnValue(addedScoreArrays[1])
      .withArgs(addedScoreArrays[1], convertedScores[2]).and.returnValue(addedScoreArrays[2])
      .withArgs(initialScoreArray, addedScoreArrays[2]).and.returnValue(addedScoreArrays[2])
      .withArgs(initialScoreArray, addedScoreArrays[2], seasonScoreArray).and.returnValue(addedScoreArrays[3]);

    spyOn<any>(service, "fetchSeasonScoreArray$").withArgs(argument1).and.returnValue(of(seasonScoreArray));
    spyOn<any>(service, "initScoreArray$").and.returnValue(of(initialScoreArray));
    spyOn<any>(service, "makeTableData$").withArgs(addedScoreArrays[2]).and.returnValue(from(expectedValues));

    let i: number = 0;
    service["fetchTableByMatchdays$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('fetchTableByMatchdays$, all data available, includes seasonScore', (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number[] = [1, 2, 3];
    const argument3: boolean = true;

    const scoreSnaps: MatchdayScoreSnapshot[] = [
      {
        documentId: "doc_0",
        season: argument1,
        matchday: argument2[0],
        userId: ["test_user_id_2", "test_user_id_0", "test_user_id_1"],
        points: [9, 8, 5],
        matches: [6, 5, 4],
        results: [2, 1, 1],
        extraTop: [1, 0, 0],
        extraOutsider: [0, 2, 0],
        extraSeason: [0, 0, 0]
      },
      {
        documentId: "doc_1",
        season: argument1,
        matchday: argument2[1],
        userId: ["test_user_id_1", "test_user_id_2", "test_user_id_0"],
        points: [4, 4, 6],
        matches: [4, 2, 4],
        results: [0, 1, 0],
        extraTop: [0, 1, 1],
        extraOutsider: [0, 0, 1],
        extraSeason: [0, 0, 0]
      },
      {
        documentId: "doc_2",
        season: argument1,
        matchday: argument2[2],
        userId: ["test_user_id_0", "test_user_id_1", "test_user_id_2"],
        points: [12, 5, 7],
        matches: [6, 3, 5],
        results: [3, 1, 1],
        extraTop: [2, 1, 0],
        extraOutsider: [1, 0, 1],
        extraSeason: [0, 0, 0]
      }
    ];

    const initialScoreArray: Score[] = [
      {
        userId: "test_user_id_0",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_1",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_2",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    const convertedScores: Score[][] = [
      [
        {
          userId: "test_user_id_2",
          points: 9,
          matches: 6,
          results: 2,
          extraTop: 1,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_0",
          points: 8,
          matches: 5,
          results: 1,
          extraTop: 0,
          extraOutsider: 2,
          extraSeason: 0
        },
        {
          userId: "test_user_id_1",
          points: 5,
          matches: 4,
          results: 1,
          extraTop: 0,
          extraOutsider: 0,
          extraSeason: 0
        }
      ],
      [
        {
          userId: "test_user_id_1",
          points: 4,
          matches: 4,
          results: 0,
          extraTop: 0,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_2",
          points: 4,
          matches: 2,
          results: 1,
          extraTop: 1,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_0",
          points: 6,
          matches: 4,
          results: 0,
          extraTop: 1,
          extraOutsider: 1,
          extraSeason: 0
        }
      ],
      [
        {
          userId: "test_user_id_0",
          points: 12,
          matches: 6,
          results: 3,
          extraTop: 2,
          extraOutsider: 1,
          extraSeason: 0
        },
        {
          userId: "test_user_id_1",
          points: 5,
          matches: 3,
          results: 1,
          extraTop: 1,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_2",
          points: 7,
          matches: 5,
          results: 1,
          extraTop: 0,
          extraOutsider: 1,
          extraSeason: 0
        }
      ]
    ];

    const addedScoreArrays: Score[][] = [
      [
        {
          userId: "test_user_id_0",
          points: 8,
          matches: 5,
          results: 1,
          extraTop: 0,
          extraOutsider: 2,
          extraSeason: 0
        },
        {
          userId: "test_user_id_1",
          points: 5,
          matches: 4,
          results: 1,
          extraTop: 0,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_2",
          points: 9,
          matches: 6,
          results: 2,
          extraTop: 1,
          extraOutsider: 0,
          extraSeason: 0
        }
      ],
      [
        {
          userId: "test_user_id_0",
          points: 14,
          matches: 9,
          results: 1,
          extraTop: 1,
          extraOutsider: 3,
          extraSeason: 0
        },
        {
          userId: "test_user_id_1",
          points: 9,
          matches: 8,
          results: 1,
          extraTop: 0,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_2",
          points: 13,
          matches: 8,
          results: 3,
          extraTop: 2,
          extraOutsider: 0,
          extraSeason: 0
        }
      ],
      [
        {
          userId: "test_user_id_0",
          points: 26,
          matches: 15,
          results: 4,
          extraTop: 3,
          extraOutsider: 4,
          extraSeason: 0
        },
        {
          userId: "test_user_id_1",
          points: 14,
          matches: 11,
          results: 2,
          extraTop: 1,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_2",
          points: 20,
          matches: 13,
          results: 4,
          extraTop: 2,
          extraOutsider: 1,
          extraSeason: 0
        }
      ],
      [
        {
          userId: "test_user_id_0",
          points: 30,
          matches: 15,
          results: 4,
          extraTop: 3,
          extraOutsider: 4,
          extraSeason: 4
        },
        {
          userId: "test_user_id_1",
          points: 14,
          matches: 11,
          results: 2,
          extraTop: 1,
          extraOutsider: 0,
          extraSeason: 0
        },
        {
          userId: "test_user_id_2",
          points: 23,
          matches: 13,
          results: 4,
          extraTop: 2,
          extraOutsider: 1,
          extraSeason: 3
        }
      ]
    ];

    const seasonScoreArray: Score[] = [
      {
        userId: "test_user_id_2",
        points: 3,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 3
      },
      {
        userId: "test_user_id_0",
        points: 4,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 4
      },
      {
        userId: "test_user_id_1",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    const expectedValues: TableData[] = [
      {
        position: 1,
        userName: "user_name_0",
        points: 30,
        matches: 15,
        results: 4,
        extraTop: 3,
        extraOutsider: 4,
        extraSeason: 4
      },
      {
        position: 2,
        userName: "user_name_2",
        points: 23,
        matches: 13,
        results: 4,
        extraTop: 2,
        extraOutsider: 1,
        extraSeason: 3
      },
      {
        position: 3,
        userName: "user_name_1",
        points: 14,
        matches: 11,
        results: 2,
        extraTop: 1,
        extraOutsider: 0,
        extraSeason: 0
      },
    ];

    appDataSpy.getMatchdayScoreSnapshot$
      .withArgs(argument1, argument2[0]).and.returnValue(of(scoreSnaps[0]))
      .withArgs(argument1, argument2[1]).and.returnValue(of(scoreSnaps[1]))
      .withArgs(argument1, argument2[2]).and.returnValue(of(scoreSnaps[2]));

    appDataSpy.getActiveUserIds$.and.returnValue(of("test_user_id_0", "test_user_id_1", "test_user_id_2"));

    spyOn<any>(service, "scoreSnapToScoreArray")
      .withArgs(scoreSnaps[0]).and.returnValue(convertedScores[0])
      .withArgs(scoreSnaps[1]).and.returnValue(convertedScores[1])
      .withArgs(scoreSnaps[2]).and.returnValue(convertedScores[2]);

    statCalcSpy.addScoreArrays
      .withArgs([], convertedScores[0]).and.returnValue(addedScoreArrays[0])
      .withArgs(addedScoreArrays[0], convertedScores[1]).and.returnValue(addedScoreArrays[1])
      .withArgs(addedScoreArrays[1], convertedScores[2]).and.returnValue(addedScoreArrays[2])
      .withArgs(initialScoreArray, addedScoreArrays[2]).and.returnValue(addedScoreArrays[2])
      .withArgs(initialScoreArray, addedScoreArrays[2], seasonScoreArray).and.returnValue(addedScoreArrays[3]);

    spyOn<any>(service, "fetchSeasonScoreArray$").withArgs(argument1).and.returnValue(of(seasonScoreArray));
    spyOn<any>(service, "initScoreArray$").and.returnValue(of(initialScoreArray));
    spyOn<any>(service, "makeTableData$").withArgs(addedScoreArrays[3]).and.returnValue(from(expectedValues));

    let i: number = 0;
    service["fetchTableByMatchdays$"](argument1, argument2, argument3).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('fetchTableByMatchdays$, scoreSnap is empty, includes seasonScore, one users bets not available in seasonScore', (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number[] = [1, 2, 3];
    const argument3: boolean = true;

    const scoreSnaps: MatchdayScoreSnapshot[] = [
      {
        documentId: "",
        season: argument1,
        matchday: argument2[0],
        userId: [],
        points: [],
        matches: [],
        results: [],
        extraTop: [],
        extraOutsider: [],
        extraSeason: []
      },
      {
        documentId: "",
        season: argument1,
        matchday: argument2[1],
        userId: [],
        points: [],
        matches: [],
        results: [],
        extraTop: [],
        extraOutsider: [],
        extraSeason: []
      },
      {
        documentId: "",
        season: argument1,
        matchday: argument2[2],
        userId: [],
        points: [],
        matches: [],
        results: [],
        extraTop: [],
        extraOutsider: [],
        extraSeason: []
      },
    ];

    const initialScoreArray: Score[] = [
      {
        userId: "test_user_id_0",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_1",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_2",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    const seasonScoreArray: Score[] = [
      {
        userId: "test_user_id_2",
        points: 3,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 3
      },
      {
        userId: "test_user_id_0",
        points: 4,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 4
      }
    ];

    const addedScoreArray: Score[] = [
      {
        userId: "test_user_id_0",
        points: 4,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 4
      },
      {
        userId: "test_user_id_1",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_2",
        points: 3,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 3
      }
    ];

    const expectedValues: TableData[] = [
      {
        position: 1,
        userName: "user_name_0",
        points: 4,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 4
      },
      {
        position: 2,
        userName: "user_name_2",
        points: 3,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 3
      },
      {
        position: 3,
        userName: "user_name_1",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
    ];

    appDataSpy.getMatchdayScoreSnapshot$
      .withArgs(argument1, argument2[0]).and.returnValue(of(scoreSnaps[0]))
      .withArgs(argument1, argument2[1]).and.returnValue(of(scoreSnaps[1]))
      .withArgs(argument1, argument2[2]).and.returnValue(of(scoreSnaps[2]));

    appDataSpy.getActiveUserIds$.and.returnValue(of("test_user_id_0", "test_user_id_1", "test_user_id_2"));

    spyOn<any>(service, "scoreSnapToScoreArray")
      .withArgs(scoreSnaps[0]).and.returnValue([])
      .withArgs(scoreSnaps[1]).and.returnValue([])
      .withArgs(scoreSnaps[2]).and.returnValue([]);

    statCalcSpy.addScoreArrays
      .withArgs([], []).and.returnValue([])
      .withArgs(initialScoreArray, []).and.returnValue(initialScoreArray)
      .withArgs(initialScoreArray, [], seasonScoreArray).and.returnValue(addedScoreArray);

    spyOn<any>(service, "fetchSeasonScoreArray$").withArgs(argument1).and.returnValue(of(seasonScoreArray));
    spyOn<any>(service, "makeTableData$").withArgs(addedScoreArray).and.returnValue(from(expectedValues));
    spyOn<any>(service, "initScoreArray$").and.returnValue(of(initialScoreArray));

    let i: number = 0;
    service["fetchTableByMatchdays$"](argument1, argument2, argument3).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('fetchTableByMatchdays$, no matchdays given, no including of seasonScore', (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number[] = [];

    const scoreSnap: MatchdayScoreSnapshot =
    {
      documentId: "",
      season: argument1,
      matchday: -1,
      userId: [],
      points: [],
      matches: [],
      results: [],
      extraTop: [],
      extraOutsider: [],
      extraSeason: []
    };

    const initialScoreArray: Score[] = [
      {
        userId: "test_user_id_0",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_1",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_2",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    const expectedValues: TableData[] = [
      {
        position: 1,
        userName: "user_name_0",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        position: 1,
        userName: "user_name_1",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        position: 1,
        userName: "user_name_2",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
    ];

    appDataSpy.getMatchdayScoreSnapshot$.withArgs(argument1, -1).and.returnValue(of(scoreSnap));
    appDataSpy.getActiveUserIds$.and.returnValue(of("test_user_id_0", "test_user_id_1", "test_user_id_2"));

    statCalcSpy.addScoreArrays
      .withArgs([], []).and.returnValue([])
      .withArgs(initialScoreArray, []).and.returnValue(initialScoreArray);

    spyOn<any>(service, "fetchSeasonScoreArray$").withArgs(argument1).and.returnValue(of([]));
    spyOn<any>(service, "initScoreArray$").and.returnValue(of(initialScoreArray));
    spyOn<any>(service, "makeTableData$").withArgs(initialScoreArray).and.returnValue(from(expectedValues));

    let i: number = 0;
    service["fetchTableByMatchdays$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it('fetchTableByMatchdays$, no matchdays given, include seasonScore', (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number[] = [];
    const argument3: boolean = true;

    const scoreSnap: MatchdayScoreSnapshot =
    {
      documentId: "",
      season: argument1,
      matchday: -1,
      userId: [],
      points: [],
      matches: [],
      results: [],
      extraTop: [],
      extraOutsider: [],
      extraSeason: []
    };

    const initialScoreArray: Score[] = [
      {
        userId: "test_user_id_0",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_1",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_2",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    const seasonScoreArray: Score[] = [
      {
        userId: "test_user_id_2",
        points: 3,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 3
      },
      {
        userId: "test_user_id_0",
        points: 4,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 4
      },
      {
        userId: "test_user_id_1",
        points: 1,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 1
      }
    ];

    const addedScoreArray: Score[] = [
      seasonScoreArray[1],
      seasonScoreArray[2],
      seasonScoreArray[0],
    ];

    const expectedValues: TableData[] = [
      {
        position: 1,
        userName: "user_name_0",
        points: 4,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 4
      },
      {
        position: 2,
        userName: "user_name_2",
        points: 3,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 3
      },
      {
        position: 3,
        userName: "user_name_1",
        points: 1,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 1
      },
    ];

    appDataSpy.getMatchdayScoreSnapshot$.withArgs(argument1, -1).and.returnValue(of(scoreSnap));
    appDataSpy.getActiveUserIds$.and.returnValue(of("test_user_id_0", "test_user_id_1", "test_user_id_2"));

    statCalcSpy.addScoreArrays
      .withArgs([], []).and.returnValue([])
      .withArgs(initialScoreArray, [], seasonScoreArray).and.returnValue(addedScoreArray);

    spyOn<any>(service, "fetchSeasonScoreArray$").withArgs(argument1).and.returnValue(of(seasonScoreArray));
    spyOn<any>(service, "initScoreArray$").and.returnValue(of(initialScoreArray));
    spyOn<any>(service, "makeTableData$").withArgs(addedScoreArray).and.returnValue(from(expectedValues));

    let i: number = 0;
    service["fetchTableByMatchdays$"](argument1, argument2, argument3).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

});
