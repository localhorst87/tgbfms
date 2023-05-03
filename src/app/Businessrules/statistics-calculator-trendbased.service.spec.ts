import { TestBed } from '@angular/core/testing';

import { StatisticsCalculatorTrendbasedService } from './statistics-calculator-trendbased.service';
import { PointCalculatorService } from './point-calculator.service';
import { Bet, Match, Score, SeasonBet, SeasonResult } from './basic_datastructures';

describe('StatisticsCalculatorTrendbasedService', () => {
  let service: StatisticsCalculatorTrendbasedService;
  let pointCalculatorSpy: jasmine.SpyObj<PointCalculatorService>;
  let compareFcnSpy: jasmine.Spy;

  beforeEach(() => {
    pointCalculatorSpy = jasmine.createSpyObj(["calcSingleMatchScore", "countTendencies", "calcSingleSeasonScore"]);
    compareFcnSpy = jasmine.createSpy();

    TestBed.configureTestingModule({
      providers: [
        StatisticsCalculatorTrendbasedService,
        { provide: PointCalculatorService, useValue: pointCalculatorSpy }
      ]
    });
    service = TestBed.inject(StatisticsCalculatorTrendbasedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  // ---------------------------------------------------------------------------
  // calculateForm
  // ---------------------------------------------------------------------------

  it("calculateForm, straight forward", () => {

    const points: number[] = [5, 8, 9];
    const pointsOpp: number[][] = [[12, 7, 2, 2], [6, 6, 5, 4], [9, 9, 7, 4]];
    const weights: number[] = [0.8, 1.0, 1.2]

    const expectedValue: number = 5.5;

    expect(service["calculateForm"](points, pointsOpp, weights)).toEqual(expectedValue);
  });

  it("calculateForm, pointsOpponents all 0", () => {

    const argument1: number[] = [5, 8, 9];
    const argument2: number[][] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    const argument3: number[] = [0.8, 1.0, 1.2]

    const expectedValue: number = 8.6;

    expect(service["calculateForm"](argument1, argument2, argument3)).toEqual(expectedValue);
  });

  it("calculateForm, pointsUser all 0", () => {

    const argument1: number[] = [0, 0, 0];
    const argument2: number[][] = [[12, 7, 2, 2], [6, 6, 5, 4], [9, 9, 7, 4]];
    const argument3: number[] = [0.8, 1.0, 1.2]

    const expectedValue: number = -10.0;

    expect(service["calculateForm"](argument1, argument2, argument3)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // makePositions
  // ---------------------------------------------------------------------------

  it("makePosition, straight forward", () => {

    const argument: Score[] = [
      {
        userId: "test_user_id_3",
        points: 31,
        matches: 18,
        results: 6,
        extraTop: 3,
        extraOutsider: 2,
        extraSeason: 2
      },
      {
        userId: "test_user_id_1",
        points: 32,
        matches: 20,
        results: 5,
        extraTop: 3,
        extraOutsider: 2,
        extraSeason: 2
      },
      {
        userId: "test_user_id_2",
        points: 31,
        matches: 19,
        results: 5,
        extraTop: 3,
        extraOutsider: 2,
        extraSeason: 2
      }
    ];

    compareFcnSpy
      .withArgs(argument[0], argument[1]).and.returnValue(1)
      .withArgs(argument[1], argument[0]).and.returnValue(-1)
      .withArgs(argument[0], argument[2]).and.returnValue(1)
      .withArgs(argument[2], argument[0]).and.returnValue(-1)
      .withArgs(argument[1], argument[2]).and.returnValue(-1)
      .withArgs(argument[2], argument[1]).and.returnValue(1);

    const expectedValue: number[] = [1, 2, 3]

    expect(service["makePositions"](argument, compareFcnSpy)).toEqual(expectedValue);
  });

  it("makePositions, all equal", () => {

    const argument: Score[] = [
      {
        userId: "test_user_id_3",
        points: 31,
        matches: 18,
        results: 6,
        extraTop: 3,
        extraOutsider: 2,
        extraSeason: 2
      },
      {
        userId: "test_user_id_2",
        points: 31,
        matches: 18,
        results: 6,
        extraTop: 3,
        extraOutsider: 2,
        extraSeason: 2
      },
      {
        userId: "test_user_id_1",
        points: 31,
        matches: 18,
        results: 6,
        extraTop: 3,
        extraOutsider: 2,
        extraSeason: 2
      }
    ];

    compareFcnSpy
      .withArgs(argument[0], argument[1]).and.returnValue(0)
      .withArgs(argument[1], argument[0]).and.returnValue(0)
      .withArgs(argument[0], argument[2]).and.returnValue(0)
      .withArgs(argument[2], argument[0]).and.returnValue(0)
      .withArgs(argument[1], argument[2]).and.returnValue(0)
      .withArgs(argument[2], argument[1]).and.returnValue(0);

    const expectedValue: number[] = [1, 1, 1]

    expect(service["makePositions"](argument, compareFcnSpy)).toEqual(expectedValue);
  });

  it("makePositions, two arguments with same valuation", () => {

    const argument: Score[] = [
      {
        userId: "test_user_id_3",
        points: 35,
        matches: 22,
        results: 6,
        extraTop: 3,
        extraOutsider: 2,
        extraSeason: 2
      },
      {
        userId: "test_user_id_1",
        points: 32,
        matches: 20,
        results: 5,
        extraTop: 3,
        extraOutsider: 2,
        extraSeason: 2
      },
      {
        userId: "test_user_id_2",
        points: 31,
        matches: 19,
        results: 5,
        extraTop: 3,
        extraOutsider: 2,
        extraSeason: 2
      },
      {
        userId: "test_user_id_4",
        points: 32,
        matches: 20,
        results: 5,
        extraTop: 1,
        extraOutsider: 2,
        extraSeason: 4
      }
    ];

    compareFcnSpy
      .withArgs(argument[0], argument[1]).and.returnValue(-1)
      .withArgs(argument[0], argument[2]).and.returnValue(-1)
      .withArgs(argument[0], argument[3]).and.returnValue(-1)
      .withArgs(argument[1], argument[0]).and.returnValue(1)
      .withArgs(argument[1], argument[2]).and.returnValue(-1)
      .withArgs(argument[1], argument[3]).and.returnValue(0)
      .withArgs(argument[2], argument[0]).and.returnValue(1)
      .withArgs(argument[2], argument[1]).and.returnValue(1)
      .withArgs(argument[2], argument[3]).and.returnValue(1)
      .withArgs(argument[3], argument[0]).and.returnValue(1)
      .withArgs(argument[3], argument[1]).and.returnValue(0)
      .withArgs(argument[3], argument[2]).and.returnValue(-1);

    const expectedValue: number[] = [1, 2, 2, 4]

    expect(service["makePositions"](argument, compareFcnSpy)).toEqual(expectedValue);
  });

  it("empty score array", () => {
    const argument: Score[] = [];

    compareFcnSpy.and.returnValue(0);
    const expectedValue: number[] = [];

    expect(service["makePositions"](argument, compareFcnSpy)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // compareScores
  // ---------------------------------------------------------------------------

  it("points 1st > points 2nd", () => {

    const firstEl: Score = {
      userId: "test_user_id_1",
      points: 35,
      matches: 23,
      results: 5,
      extraTop: 3,
      extraOutsider: 2,
      extraSeason: 2
    };
    const secondEl: Score = {
      userId: "test_user_id_2",
      points: 32,
      matches: 20,
      results: 5,
      extraTop: 3,
      extraOutsider: 2,
      extraSeason: 2
    };

    expect(service["compareScores"](firstEl, secondEl)).toBeLessThan(0);
  });

  it("points 1st < points 2nd", () => {
    const firstEl: Score = {
      userId: "test_user_id_1",
      points: 30,
      matches: 18,
      results: 5,
      extraTop: 3,
      extraOutsider: 2,
      extraSeason: 2
    };
    const secondEl: Score = {
      userId: "test_user_id_2",
      points: 32,
      matches: 20,
      results: 5,
      extraTop: 3,
      extraOutsider: 2,
      extraSeason: 2
    };

    expect(service["compareScores"](firstEl, secondEl)).toBeGreaterThan(0);
  });

  it("points 1st == points 2nd, matches 1st > matches 2nd", () => {
    const firstEl: Score = {
      userId: "test_user_id_1",
      points: 30,
      matches: 20,
      results: 5,
      extraTop: 3,
      extraOutsider: 2,
      extraSeason: 0
    };
    const secondEl: Score = {
      userId: "test_user_id_2",
      points: 30,
      matches: 18,
      results: 5,
      extraTop: 3,
      extraOutsider: 2,
      extraSeason: 2
    };

    expect(service["compareScores"](firstEl, secondEl)).toBeLessThan(0);
  });

  it("points 1st == points 2nd, matches 1st < matches 2nd", () => {
    const firstEl: Score = {
      userId: "test_user_id_1",
      points: 30,
      matches: 17,
      results: 5,
      extraTop: 3,
      extraOutsider: 3,
      extraSeason: 2
    };
    const secondEl: Score = {
      userId: "test_user_id_2",
      points: 30,
      matches: 18,
      results: 5,
      extraTop: 3,
      extraOutsider: 2,
      extraSeason: 2
    };

    expect(service["compareScores"](firstEl, secondEl)).toBeGreaterThan(0);
  });

  it("points 1st == points 2nd, matches 1st == matches 2nd, results 1st > results 2nd", () => {
    const firstEl: Score = {
      userId: "test_user_id_1",
      points: 30,
      matches: 20,
      results: 6,
      extraTop: 3,
      extraOutsider: 1,
      extraSeason: 0
    };
    const secondEl: Score = {
      userId: "test_user_id_2",
      points: 30,
      matches: 20,
      results: 5,
      extraTop: 3,
      extraOutsider: 2,
      extraSeason: 0
    };

    expect(service["compareScores"](firstEl, secondEl)).toBeLessThan(0);
  });

  it("points 1st == points 2nd, matches 1st == matches 2nd, results 1st < results 2nd", () => {
    const firstEl: Score = {
      userId: "test_user_id_1",
      points: 30,
      matches: 20,
      results: 6,
      extraTop: 2,
      extraOutsider: 2,
      extraSeason: 0
    };
    const secondEl: Score = {
      userId: "test_user_id_2",
      points: 30,
      matches: 20,
      results: 7,
      extraTop: 3,
      extraOutsider: 0,
      extraSeason: 0
    };

    expect(service["compareScores"](firstEl, secondEl)).toBeGreaterThan(0);
  });

  it("data totally equal", () => {
    const firstEl: Score = {
      userId: "test_user_id_1",
      points: 30,
      matches: 20,
      results: 6,
      extraTop: 2,
      extraOutsider: 2,
      extraSeason: 0
    };
    const secondEl: Score = firstEl;

    expect(service["compareScores"](firstEl, secondEl)).toBe(0);
  });


  // ---------------------------------------------------------------------------
  // identifyUsers
  // ---------------------------------------------------------------------------

  it("identifyUsers, one argument. Objects with duplicated user IDs", () => {
    const argument1: Bet[] = [
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_1",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_1",
        isFixed: true,
        goalsHome: 4,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 1
      }
    ];

    const expectedValue: string[] = ["test_user_id_1", "test_user_id_2", "test_user_id_3"];
    expect(service["identifyUsers"](argument1)).toEqual(expectedValue);
  });

  it("identifyUsers, bet array empty, no offset given", () => {
    const argument1: Bet[] = [];
    const argument2: Score[] = [];

    const expectedValue: string[] = [];
    expect(service["identifyUsers"](argument1, argument2)).toEqual(expectedValue);
  });

  it("identifyUsers, first argument empty, second argument given", () => {
    const argument1: Score[] = [];
    const argument2: Score[] = [
      {
        userId: "test_user_id_3",
        points: 39,
        matches: 25,
        results: 4,
        extraTop: 5,
        extraOutsider: 2,
        extraSeason: 3
      },
      {
        userId: "test_user_id_1",
        points: 42,
        matches: 28,
        results: 8,
        extraTop: 3,
        extraOutsider: 2,
        extraSeason: 1
      },
      {
        userId: "test_user_id_2",
        points: 42,
        matches: 26,
        results: 6,
        extraTop: 5,
        extraOutsider: 4,
        extraSeason: 1
      }
    ];

    const expectedValue: string[] = ["test_user_id_1", "test_user_id_2", "test_user_id_3"];
    expect(service["identifyUsers"](argument1, argument2)).toEqual(expectedValue);
  });

  it("identifyUsers, two arguments given, same users present", () => {
    const argument1: Bet[] = [
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_1",
        isFixed: false,
        goalsHome: -1,
        goalsAway: -1
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 4,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 2
      }
    ];

    const argument2: Score[] = [
      {
        userId: "test_user_id_1",
        points: 42,
        matches: 28,
        results: 8,
        extraTop: 3,
        extraOutsider: 2,
        extraSeason: 1
      },
      {
        userId: "test_user_id_2",
        points: 42,
        matches: 26,
        results: 6,
        extraTop: 3,
        extraOutsider: 6,
        extraSeason: 1
      },
      {
        userId: "test_user_id_3",
        points: 39,
        matches: 25,
        results: 4,
        extraTop: 5,
        extraOutsider: 5,
        extraSeason: 0
      }
    ];

    const expectedValue: string[] = ["test_user_id_1", "test_user_id_2", "test_user_id_3"];
    expect(service["identifyUsers"](argument1, argument2)).toEqual(expectedValue);
  });

  it("identifyUsers, two inputs given, minimal intersection", () => {
    const argument1: SeasonBet[] = [
      {
        documentId: "test_id",
        season: 2020,
        userId: "test_user_id_3",
        isFixed: true,
        place: 1,
        teamId: 14
      },
      {
        documentId: "test_id",
        season: 2020,
        userId: "test_user_id_2",
        isFixed: true,
        place: 1,
        teamId: 35
      },
    ];

    const argument2: Score[] = [
      {
        userId: "test_user_id_1",
        points: 42,
        matches: 28,
        results: 8,
        extraTop: 3,
        extraOutsider: 2,
        extraSeason: 1
      },
      {
        userId: "test_user_id_2",
        points: 42,
        matches: 26,
        results: 6,
        extraTop: 4,
        extraOutsider: 4,
        extraSeason: 2
      }
    ];

    const expectedValue: string[] = ["test_user_id_1", "test_user_id_2", "test_user_id_3"];
    expect(service["identifyUsers"](argument1, argument2)).toEqual(expectedValue);
  });

  it("identifyUsers, three inputs given, with intersecting and adding elements", () => {
    const argument1: SeasonBet[] = [
      {
        documentId: "test_id",
        season: 2020,
        userId: "test_user_id_3",
        isFixed: true,
        place: 1,
        teamId: 14
      },
      {
        documentId: "test_id",
        season: 2020,
        userId: "test_user_id_2",
        isFixed: true,
        place: 1,
        teamId: 35
      },
    ];

    const argument2: Score[] = [
      {
        userId: "test_user_id_1",
        points: 42,
        matches: 28,
        results: 8,
        extraTop: 3,
        extraOutsider: 2,
        extraSeason: 1
      },
      {
        userId: "test_user_id_2",
        points: 42,
        matches: 26,
        results: 6,
        extraTop: 4,
        extraOutsider: 4,
        extraSeason: 2
      }
    ];

    const argument3: Bet[] = [
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: false,
        goalsHome: -1,
        goalsAway: -1
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 4,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_5",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 2
      }
    ];

    const expectedValue: string[] = ["test_user_id_1", "test_user_id_2", "test_user_id_3", "test_user_id_4", "test_user_id_5"];
    expect(service["identifyUsers"](argument1, argument2, argument3)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // initScore
  // ---------------------------------------------------------------------------

  it("initScore, user available in offset data", () => {
    const argument1: string = "test_user_id_3";
    const argument2: Score[] = [
      {
        userId: "test_user_id_1",
        points: 35,
        matches: 23,
        results: 5,
        extraTop: 3,
        extraOutsider: 4,
        extraSeason: 0
      },
      {
        userId: "test_user_id_2",
        points: 41,
        matches: 27,
        results: 8,
        extraTop: 2,
        extraOutsider: 4,
        extraSeason: 0
      },
      {
        userId: "test_user_id_3",
        points: 40,
        matches: 25,
        results: 5,
        extraTop: 5,
        extraOutsider: 2,
        extraSeason: 3
      },
      {
        userId: "test_user_id_4",
        points: 32,
        matches: 23,
        results: 3,
        extraTop: 0,
        extraOutsider: 1,
        extraSeason: 5
      }
    ];
    const expectedValue: Score = argument2[2];
    expect(service["initScore"](argument1, argument2)).toEqual(expectedValue);
  });

  it("initScore, user not available in offset data", () => {
    const argument1: string = "test_user_id_12";
    const argument2: Score[] = [
      {
        userId: "test_user_id_1",
        points: 35,
        matches: 23,
        results: 5,
        extraTop: 3,
        extraOutsider: 4,
        extraSeason: 0
      },
      {
        userId: "test_user_id_2",
        points: 41,
        matches: 27,
        results: 8,
        extraTop: 3,
        extraOutsider: 3,
        extraSeason: 0
      },
      {
        userId: "test_user_id_3",
        points: 40,
        matches: 25,
        results: 5,
        extraTop: 9,
        extraOutsider: 0,
        extraSeason: 1
      },
      {
        userId: "test_user_id_4",
        points: 32,
        matches: 23,
        results: 3,
        extraTop: 1,
        extraOutsider: 5,
        extraSeason: 0
      }
    ];

    const expectedValue: Score = {
      userId: argument1,
      points: 0,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 0
    };

    expect(service["initScore"](argument1, argument2)).toEqual(expectedValue);
  });

  it("initScore, offset empty", () => {
    const argument1: string = "test_user_id_1";
    const argument2: Score[] = [];

    const expectedValue: Score = {
      userId: argument1,
      points: 0,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 0
    };

    expect(service["initScore"](argument1, argument2)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // extractScore
  // ---------------------------------------------------------------------------

  it("extractScore, target score in array available", () => {
    const argument1: Score[] = [
      {
        userId: "test_user_id_0",
        points: 35,
        matches: 23,
        results: 5,
        extraTop: 3,
        extraOutsider: 4,
        extraSeason: 0
      },
      {
        userId: "test_user_id_1",
        points: 41,
        matches: 27,
        results: 8,
        extraTop: 3,
        extraOutsider: 3,
        extraSeason: 0
      },
      {
        userId: "test_user_id_2",
        points: 40,
        matches: 25,
        results: 5,
        extraTop: 9,
        extraOutsider: 0,
        extraSeason: 1
      },
      {
        userId: "test_user_id_3",
        points: 32,
        matches: 23,
        results: 3,
        extraTop: 1,
        extraOutsider: 5,
        extraSeason: 0
      }
    ];

    const argument2: string = "test_user_id_0";

    const expectedValue: Score = argument1[0];
    expect(service["extractScore"](argument1, argument2)).toEqual(expectedValue);
  });

  it("extractScore, target score not available in array", () => {
    const argument1: Score[] = [
      {
        userId: "test_user_id_0",
        points: 35,
        matches: 23,
        results: 5,
        extraTop: 3,
        extraOutsider: 4,
        extraSeason: 0
      },
      {
        userId: "test_user_id_1",
        points: 41,
        matches: 27,
        results: 8,
        extraTop: 3,
        extraOutsider: 3,
        extraSeason: 0
      },
      {
        userId: "test_user_id_2",
        points: 40,
        matches: 25,
        results: 5,
        extraTop: 9,
        extraOutsider: 0,
        extraSeason: 1
      },
      {
        userId: "test_user_id_3",
        points: 32,
        matches: 23,
        results: 3,
        extraTop: 1,
        extraOutsider: 5,
        extraSeason: 0
      }
    ];

    const argument2: string = "test_user_id_4";

    const expectedValue: Score = {
      userId: argument2,
      points: 0,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 0
    };
    expect(service["extractScore"](argument1, argument2)).toEqual(expectedValue);
  });

  it("extractScore, Score array empty", () => {
    const argument1: Score[] = [];
    const argument2: string = "test_user_id_0";

    const expectedValue: Score = {
      userId: argument2,
      points: 0,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 0
    };
    expect(service["extractScore"](argument1, argument2)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // extractBet
  // ---------------------------------------------------------------------------

  it("extractBet, bet available", () => {
    const argument1: Bet[] = [
      {
        documentId: "test_id",
        matchId: 31,
        userId: "test_user_id_1",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2,
      },
      {
        documentId: "test_id",
        matchId: 1642,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 4,
        goalsAway: 1,
      },
      {
        documentId: "target",
        matchId: 1642,
        userId: "test_user_id_1",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2,
      },
      {
        documentId: "test_id",
        matchId: 12,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 1,
      }
    ];
    const argument2: number = 1642;
    const argument3: string = "test_user_id_1";

    const expectedValue: Bet = argument1[2];

    expect(service["extractBet"](argument1, argument2, argument3)).toEqual(expectedValue);
  });

  it("extractBet, bet not available", () => {
    const argument1: Bet[] = [
      {
        documentId: "test_id",
        matchId: 31,
        userId: "test_user_id_1",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2,
      },
      {
        documentId: "test_id",
        matchId: 1642,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 4,
        goalsAway: 1,
      },
      {
        documentId: "target",
        matchId: 1643,
        userId: "test_user_id_1",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2,
      },
      {
        documentId: "test_id",
        matchId: 12,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 1,
      }
    ];
    const argument2: number = 1642;
    const argument3: string = "test_user_id_1";

    const expectedValue: Bet = {
      documentId: "",
      matchId: argument2,
      userId: argument3,
      isFixed: false,
      goalsHome: -1,
      goalsAway: -1,
    };

    expect(service["extractBet"](argument1, argument2, argument3)).toEqual(expectedValue);
  });

  it("extractBet, bet array empty", () => {
    const argument1: Bet[] = [];
    const argument2: number = 12;
    const argument3: string = "test_user_id_1";

    const expectedValue: Bet = {
      documentId: "",
      matchId: argument2,
      userId: argument3,
      isFixed: false,
      goalsHome: -1,
      goalsAway: -1,
    };

    expect(service["extractBet"](argument1, argument2, argument3)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // extractResult
  // ---------------------------------------------------------------------------

  it("extractResult, result available", () => {
    const argument1: Result[] = [
      {
        documentId: "test_id",
        matchId: 16,
        goalsHome: 2,
        goalsAway: 1
      },
      {
        documentId: "target",
        matchId: 113,
        goalsHome: 1,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 116,
        goalsHome: 2,
        goalsAway: 0
      }
    ];
    const argument2: number = 113;

    const expectedValue: Result = argument1[1];
    expect(service["extractResult"](argument1, argument2)).toEqual(expectedValue);
  });

  it("extractResult, result not available", () => {
    const argument1: Result[] = [
      {
        documentId: "test_id",
        matchId: 16,
        goalsHome: 2,
        goalsAway: 1
      },
      {
        documentId: "target",
        matchId: 114,
        goalsHome: 1,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 116,
        goalsHome: 2,
        goalsAway: 0
      }
    ];
    const argument2: number = 113;

    const expectedValue: Result = {
      documentId: "",
      matchId: argument2,
      goalsHome: -1,
      goalsAway: -1
    };

    expect(service["extractResult"](argument1, argument2)).toEqual(expectedValue);
  });

  it("extractResult, result array empty", () => {
    const argument1: Result[] = [];
    const argument2: number = 113;

    const expectedValue: Result = {
      documentId: "",
      matchId: argument2,
      goalsHome: -1,
      goalsAway: -1
    };

    expect(service["extractResult"](argument1, argument2)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // getScoreArray
  // ---------------------------------------------------------------------------

  it("getScoreArray, optimal conditions", () => {
    const argument1: Match[] = [
      {
        documentId: "test_id",
        season: 2020,
        matchday: 4,
        matchId: 1,
        timestamp: 123456789,
        isFinished: true,
        isTopMatch: false,
        teamIdHome: 15,
        teamIdAway: 67
      },
      {
        documentId: "test_id",
        season: 2020,
        matchday: 4,
        matchId: 2,
        timestamp: 123456789,
        isFinished: false,
        isTopMatch: true,
        teamIdHome: 19,
        teamIdAway: 33
      }
    ];

    const argument2: Bet[] = [
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_1",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_1",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 4,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 1
      },
    ];
    const argument3: Result[] = [
      {
        documentId: "test_id",
        matchId: 1,
        goalsHome: 2,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 2,
        goalsHome: 1,
        goalsAway: 1
      }
    ];

    const initialScore: Score[] = [
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
      },
      {
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_4",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    pointCalculatorSpy.calcSingleMatchScore
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ userId: "test_user_id_1", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ userId: "test_user_id_1", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_2", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ userId: "test_user_id_2", points: 1, matches: 1, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_2", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ userId: "test_user_id_2", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ userId: "test_user_id_3", points: 2, matches: 1, results: 1, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ userId: "test_user_id_3", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ userId: "test_user_id_4", points: 1, matches: 1, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ userId: "test_user_id_4", points: 6, matches: 1, results: 1, extraTop: 2, extraOutsider: 2, extraSeason: 0 });

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_2", "test_user_id_3", "test_user_id_4"]);

    spyOn<any>(service, "initScore")
      .withArgs("test_user_id_1").and.returnValue(initialScore[0])
      .withArgs("test_user_id_2").and.returnValue(initialScore[1])
      .withArgs("test_user_id_3").and.returnValue(initialScore[2])
      .withArgs("test_user_id_4").and.returnValue(initialScore[3]);

    spyOn<any>(service, "extractBet")
      .withArgs(argument2, 1, "test_user_id_1").and.returnValue(argument2[0])
      .withArgs(argument2, 2, "test_user_id_1").and.returnValue(argument2[1])
      .withArgs(argument2, 1, "test_user_id_2").and.returnValue(argument2[2])
      .withArgs(argument2, 2, "test_user_id_2").and.returnValue(argument2[3])
      .withArgs(argument2, 1, "test_user_id_3").and.returnValue(argument2[4])
      .withArgs(argument2, 2, "test_user_id_3").and.returnValue(argument2[5])
      .withArgs(argument2, 1, "test_user_id_4").and.returnValue(argument2[6])
      .withArgs(argument2, 2, "test_user_id_4").and.returnValue(argument2[7]);

    spyOn<any>(service, "extractResult")
      .withArgs(argument3, 1).and.returnValue(argument3[0])
      .withArgs(argument3, 2).and.returnValue(argument3[1]);

    const expectedValue: Score[] = [
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
        points: 1,
        matches: 1,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_3",
        points: 2,
        matches: 1,
        results: 1,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_4",
        points: 7,
        matches: 2,
        results: 1,
        extraTop: 2,
        extraOutsider: 2,
        extraSeason: 0
      }
    ];

    expect(service["getScoreArray"](argument1, argument2, argument3)).toEqual(expectedValue);
  });

  it("getScoreArray, one result missing", () => {
    const argument1: Match[] = [
      {
        documentId: "test_id",
        season: 2020,
        matchday: 4,
        matchId: 1,
        timestamp: 123456789,
        isFinished: true,
        isTopMatch: false,
        teamIdHome: 15,
        teamIdAway: 67
      },
      {
        documentId: "test_id",
        season: 2020,
        matchday: 4,
        matchId: 2,
        timestamp: 123456789,
        isFinished: false,
        isTopMatch: true,
        teamIdHome: 19,
        teamIdAway: 33
      }
    ];

    const argument2: Bet[] = [
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_1",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_1",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 4,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 1
      },
    ];
    const argument3: Result[] = [
      {
        documentId: "test_id",
        matchId: 2,
        goalsHome: 1,
        goalsAway: 1
      }
    ];

    const initialScore: Score[] = [
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
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_4",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      }];

    const defaultResult: Result = {
      documentId: "",
      matchId: 1,
      goalsHome: -1,
      goalsAway: -1
    };

    pointCalculatorSpy.calcSingleMatchScore
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 1), defaultResult, argument1[0])
      .and.returnValue({ userId: "test_user_id_1", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 2), argument3[0], argument1[1])
      .and.returnValue({ userId: "test_user_id_1", points: 3, matches: 1, results: 0, extraTop: 1, extraOutsider: 1, extraSeason: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 1), defaultResult, argument1[0])
      .and.returnValue({ userId: "test_user_id_3", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 2), argument3[0], argument1[1])
      .and.returnValue({ userId: "test_user_id_3", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 1), defaultResult, argument1[0])
      .and.returnValue({ userId: "test_user_id_4", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 2), argument3[0], argument1[1])
      .and.returnValue({ userId: "test_user_id_4", points: 5, matches: 1, results: 1, extraTop: 2, extraOutsider: 1, extraSeason: 0 })

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_3", "test_user_id_4"]);

    spyOn<any>(service, "initScore")
      .withArgs("test_user_id_1").and.returnValue(initialScore[0])
      .withArgs("test_user_id_3").and.returnValue(initialScore[1])
      .withArgs("test_user_id_4").and.returnValue(initialScore[2]);

    spyOn<any>(service, "extractBet")
      .withArgs(argument2, 1, "test_user_id_1").and.returnValue(argument2[0])
      .withArgs(argument2, 2, "test_user_id_1").and.returnValue(argument2[1])
      .withArgs(argument2, 1, "test_user_id_3").and.returnValue(argument2[2])
      .withArgs(argument2, 2, "test_user_id_3").and.returnValue(argument2[3])
      .withArgs(argument2, 1, "test_user_id_4").and.returnValue(argument2[4])
      .withArgs(argument2, 2, "test_user_id_4").and.returnValue(argument2[5]);

    spyOn<any>(service, "extractResult")
      .withArgs(argument3, 1).and.returnValue(defaultResult)
      .withArgs(argument3, 2).and.returnValue(argument3[0]);

    const expectedValue: Score[] = [
      {
        userId: "test_user_id_1",
        points: 3,
        matches: 1,
        results: 0,
        extraTop: 1,
        extraOutsider: 1,
        extraSeason: 0
      },
      {
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_4",
        points: 5,
        matches: 1,
        results: 1,
        extraTop: 2,
        extraOutsider: 1,
        extraSeason: 0
      }
    ];

    expect(service["getScoreArray"](argument1, argument2, argument3)).toEqual(expectedValue);
  });

  it("getScoreArray, one result empty", () => {
    const argument1: Match[] = [
      {
        documentId: "test_id",
        season: 2020,
        matchday: 4,
        matchId: 1,
        timestamp: 123456789,
        isFinished: true,
        isTopMatch: false,
        teamIdHome: 15,
        teamIdAway: 67
      },
      {
        documentId: "test_id",
        season: 2020,
        matchday: 4,
        matchId: 2,
        timestamp: 123456789,
        isFinished: false,
        isTopMatch: true,
        teamIdHome: 19,
        teamIdAway: 33
      }
    ];

    const argument2: Bet[] = [
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_1",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_1",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 4,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 1
      },
    ];
    const argument3: Result[] = [
      {
        documentId: "test_id",
        matchId: 1,
        goalsHome: -1,
        goalsAway: -1
      },
      {
        documentId: "test_id",
        matchId: 2,
        goalsHome: 1,
        goalsAway: 1
      }
    ];

    const initialScore: Score[] = [
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
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_4",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      }];

    pointCalculatorSpy.calcSingleMatchScore
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ userId: "test_user_id_1", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ userId: "test_user_id_1", points: 3, matches: 1, results: 0, extraTop: 1, extraOutsider: 1, extraSeason: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ userId: "test_user_id_3", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ userId: "test_user_id_3", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ userId: "test_user_id_4", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ userId: "test_user_id_4", points: 5, matches: 1, results: 1, extraTop: 2, extraOutsider: 1, extraSeason: 0 })

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_3", "test_user_id_4"]);

    spyOn<any>(service, "initScore")
      .withArgs("test_user_id_1").and.returnValue(initialScore[0])
      .withArgs("test_user_id_3").and.returnValue(initialScore[1])
      .withArgs("test_user_id_4").and.returnValue(initialScore[2]);

    spyOn<any>(service, "extractBet")
      .withArgs(argument2, 1, "test_user_id_1").and.returnValue(argument2[0])
      .withArgs(argument2, 2, "test_user_id_1").and.returnValue(argument2[1])
      .withArgs(argument2, 1, "test_user_id_3").and.returnValue(argument2[2])
      .withArgs(argument2, 2, "test_user_id_3").and.returnValue(argument2[3])
      .withArgs(argument2, 1, "test_user_id_4").and.returnValue(argument2[4])
      .withArgs(argument2, 2, "test_user_id_4").and.returnValue(argument2[5]);

    spyOn<any>(service, "extractResult")
      .withArgs(argument3, 1).and.returnValue(argument3[0])
      .withArgs(argument3, 2).and.returnValue(argument3[1]);

    const expectedValue: Score[] = [
      {
        userId: "test_user_id_1",
        points: 3,
        matches: 1,
        results: 0,
        extraTop: 1,
        extraOutsider: 1,
        extraSeason: 0
      },
      {
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_4",
        points: 5,
        matches: 1,
        results: 1,
        extraTop: 2,
        extraOutsider: 1,
        extraSeason: 0
      }
    ];

    expect(service["getScoreArray"](argument1, argument2, argument3)).toEqual(expectedValue);
  });

  it("getScoreArray, bets of one user empty", () => {
    const argument1: Match[] = [
      {
        documentId: "test_id",
        season: 2020,
        matchday: 4,
        matchId: 1,
        timestamp: 123456789,
        isFinished: true,
        isTopMatch: false,
        teamIdHome: 15,
        teamIdAway: 67
      },
      {
        documentId: "test_id",
        season: 2020,
        matchday: 4,
        matchId: 2,
        timestamp: 123456789,
        isFinished: false,
        isTopMatch: true,
        teamIdHome: 19,
        teamIdAway: 33
      }
    ];

    const argument2: Bet[] = [
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_1",
        isFixed: false,
        goalsHome: -1,
        goalsAway: -1
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_1",
        isFixed: false,
        goalsHome: -1,
        goalsAway: -1
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 4,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 1
      },
    ];
    const argument3: Result[] = [
      {
        documentId: "test_id",
        matchId: 1,
        goalsHome: 2,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 2,
        goalsHome: 1,
        goalsAway: 1
      }
    ];

    const initialScore: Score[] = [
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
      },
      {
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_4",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    pointCalculatorSpy.calcSingleMatchScore
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ userId: "test_user_id_1", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ userId: "test_user_id_1", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_2", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ userId: "test_user_id_2", points: 1, matches: 1, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_2", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ userId: "test_user_id_2", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ userId: "test_user_id_3", points: 2, matches: 1, results: 1, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ userId: "test_user_id_3", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ userId: "test_user_id_4", points: 1, matches: 1, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ userId: "test_user_id_4", points: 6, matches: 1, results: 1, extraTop: 2, extraOutsider: 2, extraSeason: 0 });

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_2", "test_user_id_3", "test_user_id_4"]);

    spyOn<any>(service, "initScore")
      .withArgs("test_user_id_1").and.returnValue(initialScore[0])
      .withArgs("test_user_id_2").and.returnValue(initialScore[1])
      .withArgs("test_user_id_3").and.returnValue(initialScore[2])
      .withArgs("test_user_id_4").and.returnValue(initialScore[3]);

    spyOn<any>(service, "extractBet")
      .withArgs(argument2, 1, "test_user_id_1").and.returnValue(argument2[0])
      .withArgs(argument2, 2, "test_user_id_1").and.returnValue(argument2[1])
      .withArgs(argument2, 1, "test_user_id_2").and.returnValue(argument2[2])
      .withArgs(argument2, 2, "test_user_id_2").and.returnValue(argument2[3])
      .withArgs(argument2, 1, "test_user_id_3").and.returnValue(argument2[4])
      .withArgs(argument2, 2, "test_user_id_3").and.returnValue(argument2[5])
      .withArgs(argument2, 1, "test_user_id_4").and.returnValue(argument2[6])
      .withArgs(argument2, 2, "test_user_id_4").and.returnValue(argument2[7]);

    spyOn<any>(service, "extractResult")
      .withArgs(argument3, 1).and.returnValue(argument3[0])
      .withArgs(argument3, 2).and.returnValue(argument3[1]);

    const expectedValue: Score[] = [
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
        points: 1,
        matches: 1,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_3",
        points: 2,
        matches: 1,
        results: 1,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_4",
        points: 7,
        matches: 2,
        results: 1,
        extraTop: 2,
        extraOutsider: 2,
        extraSeason: 0
      }
    ];

    expect(service["getScoreArray"](argument1, argument2, argument3)).toEqual(expectedValue);
  });

  it("getScoreArray, match array empty", () => {
    const argument1: Match[] = [];

    const argument2: Bet[] = [
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_1",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_1",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 4,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 2,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 1
      },
    ];
    const argument3: Result[] = [
      {
        documentId: "test_id",
        matchId: 1,
        goalsHome: 2,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 2,
        goalsHome: 1,
        goalsAway: 1
      }
    ];

    const initialScore: Score[] = [
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
      },
      {
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_4",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_2", "test_user_id_3", "test_user_id_4"]);

    spyOn<any>(service, "initScore")
      .withArgs("test_user_id_1").and.returnValue(initialScore[0])
      .withArgs("test_user_id_2").and.returnValue(initialScore[1])
      .withArgs("test_user_id_3").and.returnValue(initialScore[2])
      .withArgs("test_user_id_4").and.returnValue(initialScore[3]);

    const expectedValue: Score[] = initialScore;

    expect(service["getScoreArray"](argument1, argument2, argument3)).toEqual(expectedValue);
  });

  it("getScoreArray, all input arrays empty", () => {
    const argument1: Match[] = [];
    const argument2: Bet[] = [];
    const argument3: Result[] = [];

    spyOn<any>(service, "identifyUsers")
      .and.returnValue([]);

    const expectedValue: Score[] = []

    expect(service["getScoreArray"](argument1, argument2, argument3)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // getSeasonScoreArray
  // ---------------------------------------------------------------------------

  it("getSeasonScoreArray, straight forward", () => {
    const argument1: SeasonBet[] = [
      {
        documentId: "test_doc_id_0",
        season: 2020,
        userId: "test_user_id_2",
        isFixed: true,
        place: 1,
        teamId: 100
      },
      {
        documentId: "test_doc_id_1",
        season: 2020,
        userId: "test_user_id_2",
        isFixed: true,
        place: 2,
        teamId: 200
      },
      {
        documentId: "test_doc_id_2",
        season: 2020,
        userId: "test_user_id_2",
        isFixed: true,
        place: -1,
        teamId: 121
      },
      {
        documentId: "test_doc_id_3",
        season: 2020,
        userId: "test_user_id_2",
        isFixed: true,
        place: -2,
        teamId: 164
      },
      {
        documentId: "test_doc_id_4",
        season: 2020,
        userId: "test_user_id_2",
        isFixed: true,
        place: -3,
        teamId: 106
      },
      {
        documentId: "test_doc_id_0",
        season: 2020,
        userId: "test_user_id_1",
        isFixed: true,
        place: 1,
        teamId: 101
      },
      {
        documentId: "test_doc_id_1",
        season: 2020,
        userId: "test_user_id_1",
        isFixed: true,
        place: 2,
        teamId: 201
      },
      {
        documentId: "test_doc_id_2",
        season: 2020,
        userId: "test_user_id_1",
        isFixed: true,
        place: -1,
        teamId: 121
      },
      {
        documentId: "test_doc_id_3",
        season: 2020,
        userId: "test_user_id_1",
        isFixed: true,
        place: -2,
        teamId: 165
      },
      {
        documentId: "test_doc_id_4",
        season: 2020,
        userId: "test_user_id_1",
        isFixed: true,
        place: -3,
        teamId: 107
      }
    ];

    const argument2: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: 101
      },
      {
        documentId: "test_doc_id_11",
        season: 2020,
        place: 2,
        teamId: 200
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: 164
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: 121
      },
      {
        documentId: "test_doc_id_14",
        season: 2020,
        place: -3,
        teamId: 106
      }
    ];

    const initialScore: Score[] = [
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

    const singleSeasonScore: Score[] = [
      {
        userId: "test_user_id_1",
        points: 4,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 4
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

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_2"]);

    spyOn<any>(service, "initScore")
      .withArgs("test_user_id_1").and.returnValue(initialScore[0])
      .withArgs("test_user_id_2").and.returnValue(initialScore[1]);

    pointCalculatorSpy.calcSingleSeasonScore
      .withArgs(argument1.filter(bet => bet.userId == "test_user_id_1"), argument2).and.returnValue(singleSeasonScore[0])
      .withArgs(argument1.filter(bet => bet.userId == "test_user_id_2"), argument2).and.returnValue(singleSeasonScore[1]);

    const expectedValue: Score[] = singleSeasonScore;

    expect(service["getSeasonScoreArray"](argument1, argument2)).toEqual(expectedValue);
  });

  it("getSeasonScoreArray, betArray empty", () => {
    const argument1: SeasonBet[] = [];
    const argument2: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: 101
      },
      {
        documentId: "test_doc_id_11",
        season: 2020,
        place: 2,
        teamId: 200
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: 164
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: 121
      },
      {
        documentId: "test_doc_id_14",
        season: 2020,
        place: -3,
        teamId: 106
      }
    ];

    spyOn<any>(service, "identifyUsers")
      .and.returnValue([]);

    const expectedValue: Score[] = [];

    expect(service["getSeasonScoreArray"](argument1, argument2)).toEqual(expectedValue);
  });

  it("getSeasonScoreArray, resultArray empty", () => {
    const argument1: SeasonBet[] = [
      {
        documentId: "test_doc_id_0",
        season: 2020,
        userId: "test_user_id_2",
        isFixed: true,
        place: 1,
        teamId: 100
      },
      {
        documentId: "test_doc_id_1",
        season: 2020,
        userId: "test_user_id_2",
        isFixed: true,
        place: 2,
        teamId: 200
      },
      {
        documentId: "test_doc_id_2",
        season: 2020,
        userId: "test_user_id_2",
        isFixed: true,
        place: -1,
        teamId: 121
      },
      {
        documentId: "test_doc_id_3",
        season: 2020,
        userId: "test_user_id_2",
        isFixed: true,
        place: -2,
        teamId: 164
      },
      {
        documentId: "test_doc_id_4",
        season: 2020,
        userId: "test_user_id_2",
        isFixed: true,
        place: -3,
        teamId: 106
      },
      {
        documentId: "test_doc_id_0",
        season: 2020,
        userId: "test_user_id_1",
        isFixed: true,
        place: 1,
        teamId: 101
      },
      {
        documentId: "test_doc_id_1",
        season: 2020,
        userId: "test_user_id_1",
        isFixed: true,
        place: 2,
        teamId: 201
      },
      {
        documentId: "test_doc_id_2",
        season: 2020,
        userId: "test_user_id_1",
        isFixed: true,
        place: -1,
        teamId: 121
      },
      {
        documentId: "test_doc_id_3",
        season: 2020,
        userId: "test_user_id_1",
        isFixed: true,
        place: -2,
        teamId: 165
      },
      {
        documentId: "test_doc_id_4",
        season: 2020,
        userId: "test_user_id_1",
        isFixed: true,
        place: -3,
        teamId: 107
      }
    ];

    const argument2: SeasonResult[] = [];

    const initialScore: Score[] = [
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
      },
      {
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    const singleSeasonScore: Score = {
      userId: "",
      points: 0,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 0
    };

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_2", "test_user_id_3"]);

    spyOn<any>(service, "initScore")
      .withArgs("test_user_id_1").and.returnValue(initialScore[0])
      .withArgs("test_user_id_2").and.returnValue(initialScore[1])
      .withArgs("test_user_id_3").and.returnValue(initialScore[2]);

    pointCalculatorSpy.calcSingleSeasonScore
      .withArgs(argument1.filter(bet => bet.userId == "test_user_id_1"), []).and.returnValue(singleSeasonScore)
      .withArgs(argument1.filter(bet => bet.userId == "test_user_id_2"), []).and.returnValue(singleSeasonScore)
      .withArgs(argument1.filter(bet => bet.userId == "test_user_id_3"), []).and.returnValue(singleSeasonScore);

    const expectedValue: Score[] = initialScore;

    expect(service["getSeasonScoreArray"](argument1, argument2)).toEqual(expectedValue);
  });

  it("getSeasonScoreArray, all inputs empty", () => {
    const argument1: SeasonBet[] = [];
    const argument2: SeasonResult[] = [];

    spyOn<any>(service, "identifyUsers").and.returnValue([]);

    const expectedValue: Score[] = [];

    expect(service["getSeasonScoreArray"](argument1, argument2)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // addScoreArrays
  // ---------------------------------------------------------------------------

  it("addScoreArrays, only one argument given", () => {

    const argument1: Score[] = [
      {
        userId: "test_user_id_3",
        points: 10,
        matches: 6,
        results: 2,
        extraTop: 1,
        extraOutsider: 1,
        extraSeason: 0
      },
      {
        userId: "test_user_id_1",
        points: 12,
        matches: 7,
        results: 2,
        extraTop: 0,
        extraOutsider: 2,
        extraSeason: 1
      },
      {
        userId: "test_user_id_2",
        points: 8,
        matches: 4,
        results: 2,
        extraTop: 2,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_2", "test_user_id_3"]);

    spyOn<any>(service, "initScore")
      .withArgs("test_user_id_1", argument1).and.returnValue(argument1[1])
      .withArgs("test_user_id_2", argument1).and.returnValue(argument1[2])
      .withArgs("test_user_id_3", argument1).and.returnValue(argument1[0]);

    const expectedValue: Score[] = [
      argument1[1],
      argument1[2],
      argument1[0]
    ];

    expect(service["addScoreArrays"](argument1)).toEqual(expectedValue);
  });

  it("addScoreArrays, two arguments given, same user IDs", () => {

    const argument1: Score[] = [
      {
        userId: "test_user_id_3",
        points: 10,
        matches: 6,
        results: 2,
        extraTop: 1,
        extraOutsider: 1,
        extraSeason: 0
      },
      {
        userId: "test_user_id_1",
        points: 12,
        matches: 7,
        results: 2,
        extraTop: 0,
        extraOutsider: 2,
        extraSeason: 1
      },
      {
        userId: "test_user_id_2",
        points: 8,
        matches: 4,
        results: 2,
        extraTop: 2,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    const argument2: Score[] = [
      {
        userId: "test_user_id_1",
        points: 3,
        matches: 3,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_3",
        points: 5,
        matches: 4,
        results: 0,
        extraTop: 1,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_2",
        points: 3,
        matches: 1,
        results: 1,
        extraTop: 1,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_2", "test_user_id_3"]);

    spyOn<any>(service, "initScore")
      .withArgs("test_user_id_1", argument1).and.returnValue(argument1[1])
      .withArgs("test_user_id_2", argument1).and.returnValue(argument1[2])
      .withArgs("test_user_id_3", argument1).and.returnValue(argument1[0]);

    spyOn<any>(service, "extractScore")
      .withArgs(argument2, "test_user_id_1").and.returnValue(argument2[0])
      .withArgs(argument2, "test_user_id_2").and.returnValue(argument2[2])
      .withArgs(argument2, "test_user_id_3").and.returnValue(argument2[1]);

    const expectedValue: Score[] = [
      {
        userId: "test_user_id_1",
        points: 15,
        matches: 10,
        results: 2,
        extraTop: 0,
        extraOutsider: 2,
        extraSeason: 1
      },
      {
        userId: "test_user_id_2",
        points: 11,
        matches: 5,
        results: 3,
        extraTop: 3,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_3",
        points: 15,
        matches: 10,
        results: 2,
        extraTop: 2,
        extraOutsider: 1,
        extraSeason: 0
      }
    ];

    expect(service["addScoreArrays"](argument1, argument2)).toEqual(expectedValue);
  });

  it("addScoreArrays, three arguments given, intersecting and different user IDs", () => {

    const argument1: Score[] = [
      {
        userId: "test_user_id_3",
        points: 10,
        matches: 6,
        results: 2,
        extraTop: 1,
        extraOutsider: 1,
        extraSeason: 0
      },
      {
        userId: "test_user_id_1",
        points: 12,
        matches: 7,
        results: 2,
        extraTop: 0,
        extraOutsider: 2,
        extraSeason: 1
      },
      {
        userId: "test_user_id_2",
        points: 8,
        matches: 4,
        results: 2,
        extraTop: 2,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    const argument2: Score[] = [
      {
        userId: "test_user_id_1",
        points: 3,
        matches: 3,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_3",
        points: 5,
        matches: 4,
        results: 0,
        extraTop: 1,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_2",
        points: 3,
        matches: 1,
        results: 1,
        extraTop: 1,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    const argument3: Score[] = [
      {
        userId: "test_user_id_1",
        points: 3,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 3
      },
      {
        userId: "test_user_id_4",
        points: 4,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 4
      },
    ];

    const defaultScores: Score[] = [
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
      },
      {
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_4",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_2", "test_user_id_3", "test_user_id_4"]);

    spyOn<any>(service, "initScore")
      .withArgs("test_user_id_1", argument1).and.returnValue(argument1[1])
      .withArgs("test_user_id_2", argument1).and.returnValue(argument1[2])
      .withArgs("test_user_id_3", argument1).and.returnValue(argument1[0])
      .withArgs("test_user_id_4", argument1).and.returnValue(defaultScores[3])

    spyOn<any>(service, "extractScore")
      .withArgs(argument2, "test_user_id_1").and.returnValue(argument2[0])
      .withArgs(argument2, "test_user_id_2").and.returnValue(argument2[2])
      .withArgs(argument2, "test_user_id_3").and.returnValue(argument2[1])
      .withArgs(argument2, "test_user_id_4").and.returnValue(defaultScores[3])
      .withArgs(argument3, "test_user_id_1").and.returnValue(argument3[0])
      .withArgs(argument3, "test_user_id_2").and.returnValue(defaultScores[1])
      .withArgs(argument3, "test_user_id_3").and.returnValue(defaultScores[2])
      .withArgs(argument3, "test_user_id_4").and.returnValue(argument3[1]);

    const expectedValue: Score[] = [
      {
        userId: "test_user_id_1",
        points: 18,
        matches: 10,
        results: 2,
        extraTop: 0,
        extraOutsider: 2,
        extraSeason: 4
      },
      {
        userId: "test_user_id_2",
        points: 11,
        matches: 5,
        results: 3,
        extraTop: 3,
        extraOutsider: 0,
        extraSeason: 0
      },
      {
        userId: "test_user_id_3",
        points: 15,
        matches: 10,
        results: 2,
        extraTop: 2,
        extraOutsider: 1,
        extraSeason: 0
      },
      {
        userId: "test_user_id_4",
        points: 4,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 4
      }
    ];

    expect(service["addScoreArrays"](argument1, argument2, argument3)).toEqual(expectedValue);
  });

  it("addScoreArrays, one argument as empty array given", () => {
    const argument1: Score[] = [];
    spyOn<any>(service, "identifyUsers").and.returnValue([]);

    const expectedValue: Score[] = [];
    expect(service["addScoreArrays"](argument1)).toEqual(expectedValue);
  });

  it("addScoreArrays, two arguments given, second argument is an empty array", () => {
    const argument1: Score[] = [
      {
        userId: "test_user_id_3",
        points: 10,
        matches: 6,
        results: 2,
        extraTop: 1,
        extraOutsider: 1,
        extraSeason: 0
      },
      {
        userId: "test_user_id_1",
        points: 12,
        matches: 7,
        results: 2,
        extraTop: 0,
        extraOutsider: 2,
        extraSeason: 1
      },
      {
        userId: "test_user_id_2",
        points: 8,
        matches: 4,
        results: 2,
        extraTop: 2,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    const argument2: Score[] = [];
    const defaultScores: Score[] = [
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
      },
      {
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extraTop: 0,
        extraOutsider: 0,
        extraSeason: 0
      }
    ];

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_2", "test_user_id_3"]);

    spyOn<any>(service, "initScore")
      .withArgs("test_user_id_1", argument1).and.returnValue(argument1[1])
      .withArgs("test_user_id_2", argument1).and.returnValue(argument1[2])
      .withArgs("test_user_id_3", argument1).and.returnValue(argument1[0]);

    spyOn<any>(service, "extractScore")
      .withArgs(argument2, "test_user_id_1").and.returnValue(defaultScores[0])
      .withArgs(argument2, "test_user_id_2").and.returnValue(defaultScores[1])
      .withArgs(argument2, "test_user_id_3").and.returnValue(defaultScores[2]);

    const expectedValue: Score[] = [
      argument1[1],
      argument1[2],
      argument1[0]
    ];

    expect(service["addScoreArrays"](argument1, argument2)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // addScores
  // ---------------------------------------------------------------------------

  it("getSeasonScoreArray, straight forward", () => {
    const argument1: Score = {
      userId: "test_user_id_1",
      points: 30,
      matches: 18,
      results: 5,
      extraTop: 3,
      extraOutsider: 3,
      extraSeason: 1
    };
    const argument2: Score = {
      userId: "test_user_id_1",
      points: 4,
      matches: 2,
      results: 1,
      extraTop: 0,
      extraOutsider: 1,
      extraSeason: 0
    };
    const expectedValue: Score = {
      userId: "test_user_id_1",
      points: 34,
      matches: 20,
      results: 6,
      extraTop: 3,
      extraOutsider: 4,
      extraSeason: 1
    };

    expect(service["addScores"](argument1, argument2)).toEqual(expectedValue);
  });

  it("getSeasonScoreArray, different user names", () => {
    const argument1: Score = {
      userId: "test_user_id_1",
      points: 30,
      matches: 18,
      results: 5,
      extraTop: 3,
      extraOutsider: 3,
      extraSeason: 1
    };
    const argument2: Score = {
      userId: "test_user_id_2",
      points: 4,
      matches: 2,
      results: 1,
      extraTop: 0,
      extraOutsider: 1,
      extraSeason: 0
    };
    const expectedValue: Score = {
      userId: "test_user_id_1",
      points: 34,
      matches: 20,
      results: 6,
      extraTop: 3,
      extraOutsider: 4,
      extraSeason: 1
    };

    expect(service["addScores"](argument1, argument2)).toEqual(expectedValue);
  });
});
