import { TestBed } from '@angular/core/testing';

import { StatisticsCalculatorTrendbasedService } from './statistics-calculator-trendbased.service';
import { PointCalculatorService } from './point-calculator.service';
import { TableData, BetExtended, ResultExtended, MatchExtended, Score } from './basic_datastructures';

describe('StatisticsCalculatorTrendbasedService', () => {
  let service: StatisticsCalculatorTrendbasedService;
  let pointCalculatorSpy: jasmine.SpyObj<PointCalculatorService>;

  beforeEach(() => {
    pointCalculatorSpy = jasmine.createSpyObj(["getMatchPoints", "countTendencies", "getSeasonPoints"]);

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
  // compareTableData
  // ---------------------------------------------------------------------------

  it("points 1st > points 2nd", () => {

    const firstEl: TableData = {
      userId: "test_user_id_1",
      points: 35,
      matches: 23,
      results: 5,
      extra: 7
    };
    const secondEl: TableData = {
      userId: "test_user_id_2",
      points: 32,
      matches: 20,
      results: 5,
      extra: 7
    };

    expect(service["compareTableData"](firstEl, secondEl)).toBeLessThan(0);
  });

  it("points 1st < points 2nd", () => {
    const firstEl: TableData = {
      userId: "test_user_id_1",
      points: 30,
      matches: 18,
      results: 5,
      extra: 7
    };
    const secondEl: TableData = {
      userId: "test_user_id_2",
      points: 32,
      matches: 20,
      results: 5,
      extra: 7
    };

    expect(service["compareTableData"](firstEl, secondEl)).toBeGreaterThan(0);
  });

  it("points 1st == points 2nd, matches 1st > matches 2nd", () => {
    const firstEl: TableData = {
      userId: "test_user_id_1",
      points: 30,
      matches: 20,
      results: 5,
      extra: 5
    };
    const secondEl: TableData = {
      userId: "test_user_id_2",
      points: 30,
      matches: 18,
      results: 5,
      extra: 7
    };

    expect(service["compareTableData"](firstEl, secondEl)).toBeLessThan(0);
  });

  it("points 1st == points 2nd, matches 1st < matches 2nd", () => {
    const firstEl: TableData = {
      userId: "test_user_id_1",
      points: 30,
      matches: 17,
      results: 5,
      extra: 8
    };
    const secondEl: TableData = {
      userId: "test_user_id_2",
      points: 30,
      matches: 18,
      results: 5,
      extra: 7
    };

    expect(service["compareTableData"](firstEl, secondEl)).toBeGreaterThan(0);
  });

  it("points 1st == points 2nd, matches 1st == matches 2nd, results 1st > results 2nd", () => {
    const firstEl: TableData = {
      userId: "test_user_id_1",
      points: 30,
      matches: 20,
      results: 6,
      extra: 4
    };
    const secondEl: TableData = {
      userId: "test_user_id_2",
      points: 30,
      matches: 20,
      results: 5,
      extra: 5
    };

    expect(service["compareTableData"](firstEl, secondEl)).toBeLessThan(0);
  });

  it("points 1st == points 2nd, matches 1st == matches 2nd, results 1st < results 2nd", () => {
    const firstEl: TableData = {
      userId: "test_user_id_1",
      points: 30,
      matches: 20,
      results: 6,
      extra: 4
    };
    const secondEl: TableData = {
      userId: "test_user_id_2",
      points: 30,
      matches: 20,
      results: 7,
      extra: 3
    };

    expect(service["compareTableData"](firstEl, secondEl)).toBeGreaterThan(0);
  });

  it("data totally equal", () => {
    const firstEl: TableData = {
      userId: "test_user_id_1",
      points: 30,
      matches: 20,
      results: 6,
      extra: 4
    };
    const secondEl: TableData = firstEl;

    expect(service["compareTableData"](firstEl, secondEl)).toBe(0);
  });


  // ---------------------------------------------------------------------------
  // identifyUsers
  // ---------------------------------------------------------------------------

  it("identifyUsers, 2 matches, 3 users, offset not given", () => {
    const argument1: BetExtended[] = [
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

    const argument2: TableData[] = [];

    const expectedValue: string[] = ["test_user_id_1", "test_user_id_2", "test_user_id_3"];
    expect(service["identifyUsers"](argument1, argument2)).toEqual(expectedValue);
  });

  it("identifyUsers, 2 matches, 3 users, one user without bets set, offset not given", () => {
    const argument1: BetExtended[] = [
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
    const argument2: TableData[] = [];

    const expectedValue: string[] = ["test_user_id_1", "test_user_id_2", "test_user_id_3"];
    expect(service["identifyUsers"](argument1, argument2)).toEqual(expectedValue);
  });

  it("identifyUsers, bet array empty, no offset given", () => {
    const argument1: BetExtended[] = [];
    const argument2: TableData[] = [];

    const expectedValue: string[] = [];
    expect(service["identifyUsers"](argument1, argument2)).toEqual(expectedValue);
  });

  it("identifyUsers, bet array empty, offset given", () => {
    const argument1: BetExtended[] = [];
    const argument2: TableData[] = [
      {
        userId: "test_user_id_1",
        points: 42,
        matches: 28,
        results: 8,
        extra: 6
      },
      {
        userId: "test_user_id_2",
        points: 42,
        matches: 26,
        results: 6,
        extra: 10
      },
      {
        userId: "test_user_id_3",
        points: 39,
        matches: 25,
        results: 4,
        extra: 10
      }
    ];

    const expectedValue: string[] = ["test_user_id_1", "test_user_id_2", "test_user_id_3"];
    expect(service["identifyUsers"](argument1, argument2)).toEqual(expectedValue);
  });

  it("identifyUsers, bet array and offset given, same users present", () => {
    const argument1: BetExtended[] = [
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

    const argument2: TableData[] = [
      {
        userId: "test_user_id_1",
        points: 42,
        matches: 28,
        results: 8,
        extra: 6
      },
      {
        userId: "test_user_id_2",
        points: 42,
        matches: 26,
        results: 6,
        extra: 10
      },
      {
        userId: "test_user_id_3",
        points: 39,
        matches: 25,
        results: 4,
        extra: 10
      }
    ];

    const expectedValue: string[] = ["test_user_id_1", "test_user_id_2", "test_user_id_3"];
    expect(service["identifyUsers"](argument1, argument2)).toEqual(expectedValue);
  });

  it("identifyUsers, bet array and offset given, minimal intersection", () => {
    const argument1: BetExtended[] = [
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

    const argument2: TableData[] = [
      {
        userId: "test_user_id_1",
        points: 42,
        matches: 28,
        results: 8,
        extra: 6
      },
      {
        userId: "test_user_id_2",
        points: 42,
        matches: 26,
        results: 6,
        extra: 10
      }
    ];

    const expectedValue: string[] = ["test_user_id_1", "test_user_id_2", "test_user_id_3"];
    expect(service["identifyUsers"](argument1, argument2)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // initTableData
  // ---------------------------------------------------------------------------

  it("initTableData, user available in offset data", () => {
    const argument1: string = "test_user_id_3";
    const argument2: TableData[] = [
      {
        userId: "test_user_id_1",
        points: 35,
        matches: 23,
        results: 5,
        extra: 7
      },
      {
        userId: "test_user_id_2",
        points: 41,
        matches: 27,
        results: 8,
        extra: 6
      },
      {
        userId: "test_user_id_3",
        points: 40,
        matches: 25,
        results: 5,
        extra: 10
      },
      {
        userId: "test_user_id_4",
        points: 32,
        matches: 23,
        results: 3,
        extra: 6
      }
    ];
    const expectedValue: TableData = argument2[2];
    expect(service["initTableData"](argument1, argument2)).toEqual(expectedValue);
  });

  it("initTableData, user not available in offset data", () => {
    const argument1: string = "test_user_id_12";
    const argument2: TableData[] = [
      {
        userId: "test_user_id_1",
        points: 35,
        matches: 23,
        results: 5,
        extra: 7
      },
      {
        userId: "test_user_id_2",
        points: 41,
        matches: 27,
        results: 8,
        extra: 6
      },
      {
        userId: "test_user_id_3",
        points: 40,
        matches: 25,
        results: 5,
        extra: 10
      },
      {
        userId: "test_user_id_4",
        points: 32,
        matches: 23,
        results: 3,
        extra: 6
      }
    ];

    const expectedValue: TableData = {
      userId: argument1,
      points: 0,
      matches: 0,
      results: 0,
      extra: 0
    };

    expect(service["initTableData"](argument1, argument2)).toEqual(expectedValue);
  });

  it("initTableData, offset empty", () => {
    const argument1: string = "test_user_id_1";
    const argument2: TableData[] = [];

    const expectedValue: TableData = {
      userId: argument1,
      points: 0,
      matches: 0,
      results: 0,
      extra: 0
    };

    expect(service["initTableData"](argument1, argument2)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // extractBet
  // ---------------------------------------------------------------------------

  it("extractBet, bet available", () => {
    const argument1: BetExtended[] = [
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

    const expectedValue: BetExtended = argument1[2];

    expect(service["extractBet"](argument1, argument2, argument3)).toEqual(expectedValue);
  });

  it("extractBet, bet not available", () => {
    const argument1: BetExtended[] = [
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

    const expectedValue: BetExtended = {
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
    const argument1: BetExtended[] = [];
    const argument2: number = 12;
    const argument3: string = "test_user_id_1";

    const expectedValue: BetExtended = {
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
    const argument1: ResultExtended[] = [
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

    const expectedValue: ResultExtended = argument1[1];
    expect(service["extractResult"](argument1, argument2)).toEqual(expectedValue);
  });

  it("extractResult, result not available", () => {
    const argument1: ResultExtended[] = [
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

    const expectedValue: ResultExtended = {
      documentId: "",
      matchId: argument2,
      goalsHome: -1,
      goalsAway: -1
    };

    expect(service["extractResult"](argument1, argument2)).toEqual(expectedValue);
  });

  it("extractResult, result array empty", () => {
    const argument1: ResultExtended[] = [];
    const argument2: number = 113;

    const expectedValue: ResultExtended = {
      documentId: "",
      matchId: argument2,
      goalsHome: -1,
      goalsAway: -1
    };

    expect(service["extractResult"](argument1, argument2)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // getBetTable
  // ---------------------------------------------------------------------------

  it("getBetTable, optimal conditions, no offset argument", () => {
    const argument1: MatchExtended[] = [
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

    const argument2: BetExtended[] = [
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
    const argument3: ResultExtended[] = [
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

    const argument4: TableData[] = [];

    const initialTableData: TableData[] = [
      {
        userId: "test_user_id_1",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      },
      {
        userId: "test_user_id_2",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      },
      {
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      },
      {
        userId: "test_user_id_4",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      }
    ];

    pointCalculatorSpy.getMatchPoints
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_2", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 1, matches: 1, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_2", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 2, matches: 1, results: 1, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 1, matches: 1, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 6, matches: 1, results: 1, extraTop: 2, extraOutsider: 2 });

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_2", "test_user_id_3", "test_user_id_4"]);

    spyOn<any>(service, "initTableData")
      .withArgs("test_user_id_1", []).and.returnValue(initialTableData[0])
      .withArgs("test_user_id_2", []).and.returnValue(initialTableData[1])
      .withArgs("test_user_id_3", []).and.returnValue(initialTableData[2])
      .withArgs("test_user_id_4", []).and.returnValue(initialTableData[3]);

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

    const expectedValue: TableData[] = [
      {
        userId: "test_user_id_4",
        points: 7,
        matches: 2,
        results: 1,
        extra: 4
      },
      {
        userId: "test_user_id_3",
        points: 2,
        matches: 1,
        results: 1,
        extra: 0
      },
      {
        userId: "test_user_id_2",
        points: 1,
        matches: 1,
        results: 0,
        extra: 0
      },
      {
        userId: "test_user_id_1",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      }
    ];

    expect(service["getBetTable"](argument1, argument2, argument3, argument4)).toEqual(expectedValue);
  });

  it("getBetTable, optimal conditions, offset argument given", () => {
    const argument1: MatchExtended[] = [
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

    const argument2: BetExtended[] = [
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
    const argument3: ResultExtended[] = [
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

    const argument4: TableData[] = [
      {
        userId: "test_user_id_1",
        points: 35,
        matches: 23,
        results: 5,
        extra: 7
      },
      {
        userId: "test_user_id_2",
        points: 41,
        matches: 27,
        results: 8,
        extra: 6
      },
      {
        userId: "test_user_id_3",
        points: 40,
        matches: 25,
        results: 5,
        extra: 10
      },
      {
        userId: "test_user_id_4",
        points: 32,
        matches: 23,
        results: 3,
        extra: 6
      }];

    pointCalculatorSpy.getMatchPoints
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_2", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 1, matches: 1, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_2", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 2, matches: 1, results: 1, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 1, matches: 1, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 6, matches: 1, results: 1, extraTop: 2, extraOutsider: 2 });

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_2", "test_user_id_3", "test_user_id_4"]);

    spyOn<any>(service, "initTableData")
      .withArgs("test_user_id_1", argument4).and.returnValue(argument4[0])
      .withArgs("test_user_id_2", argument4).and.returnValue(argument4[1])
      .withArgs("test_user_id_3", argument4).and.returnValue(argument4[2])
      .withArgs("test_user_id_4", argument4).and.returnValue(argument4[3]);

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

    const expectedValue: TableData[] = [
      {
        userId: "test_user_id_2",
        points: 42,
        matches: 28,
        results: 8,
        extra: 6
      },
      {
        userId: "test_user_id_3",
        points: 42,
        matches: 26,
        results: 6,
        extra: 10
      },
      {
        userId: "test_user_id_4",
        points: 39,
        matches: 25,
        results: 4,
        extra: 10
      },
      {
        userId: "test_user_id_1",
        points: 35,
        matches: 23,
        results: 5,
        extra: 7
      }
    ];

    expect(service["getBetTable"](argument1, argument2, argument3, argument4)).toEqual(expectedValue);
  });

  it("getBetTable, one user missing in offset", () => {
    const argument1: MatchExtended[] = [
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

    const argument2: BetExtended[] = [
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
    const argument3: ResultExtended[] = [
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

    const argument4: TableData[] = [
      {
        userId: "test_user_id_1",
        points: 35,
        matches: 23,
        results: 5,
        extra: 7
      },
      {
        userId: "test_user_id_3",
        points: 40,
        matches: 25,
        results: 5,
        extra: 10
      },
      {
        userId: "test_user_id_4",
        points: 32,
        matches: 23,
        results: 3,
        extra: 6
      }];

    const defaultTableData: TableData =
    {
      userId: "test_user_id_2",
      points: 0,
      matches: 0,
      results: 0,
      extra: 0
    };

    pointCalculatorSpy.getMatchPoints
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_2", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 1, matches: 1, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_2", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 2, matches: 1, results: 1, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 1, matches: 1, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 6, matches: 1, results: 1, extraTop: 2, extraOutsider: 2 });

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_2", "test_user_id_3", "test_user_id_4"]);

    spyOn<any>(service, "initTableData")
      .withArgs("test_user_id_1", argument4).and.returnValue(argument4[0])
      .withArgs("test_user_id_2", argument4).and.returnValue(defaultTableData)
      .withArgs("test_user_id_3", argument4).and.returnValue(argument4[1])
      .withArgs("test_user_id_4", argument4).and.returnValue(argument4[2]);

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

    const expectedValue: TableData[] = [
      {
        userId: "test_user_id_3",
        points: 42,
        matches: 26,
        results: 6,
        extra: 10
      },
      {
        userId: "test_user_id_4",
        points: 39,
        matches: 25,
        results: 4,
        extra: 10
      },
      {
        userId: "test_user_id_1",
        points: 35,
        matches: 23,
        results: 5,
        extra: 7
      },
      {
        userId: "test_user_id_2",
        points: 1,
        matches: 1,
        results: 0,
        extra: 0
      }
    ];

    expect(service["getBetTable"](argument1, argument2, argument3, argument4)).toEqual(expectedValue);
  });

  it("getBetTable, one user missing in bets", () => {
    const argument1: MatchExtended[] = [
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

    const argument2: BetExtended[] = [
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
    const argument3: ResultExtended[] = [
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

    const argument4: TableData[] = [
      {
        userId: "test_user_id_1",
        points: 35,
        matches: 23,
        results: 5,
        extra: 7
      },
      {
        userId: "test_user_id_2",
        points: 41,
        matches: 27,
        results: 8,
        extra: 6
      },
      {
        userId: "test_user_id_3",
        points: 40,
        matches: 25,
        results: 5,
        extra: 10
      },
      {
        userId: "test_user_id_4",
        points: 32,
        matches: 23,
        results: 3,
        extra: 6
      }];

    const defaultBets: BetExtended[] = [
      {
        documentId: "",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: false,
        goalsHome: -1,
        goalsAway: -1
      },
      {
        documentId: "",
        matchId: 2,
        userId: "test_user_id_2",
        isFixed: false,
        goalsHome: -1,
        goalsAway: -1
      }
    ];

    pointCalculatorSpy.getMatchPoints
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_2", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_2", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 2, matches: 1, results: 1, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 1, matches: 1, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 6, matches: 1, results: 1, extraTop: 2, extraOutsider: 2 });

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_2", "test_user_id_3", "test_user_id_4"]);

    spyOn<any>(service, "initTableData")
      .withArgs("test_user_id_1", argument4).and.returnValue(argument4[0])
      .withArgs("test_user_id_2", argument4).and.returnValue(argument4[1])
      .withArgs("test_user_id_3", argument4).and.returnValue(argument4[2])
      .withArgs("test_user_id_4", argument4).and.returnValue(argument4[3]);

    spyOn<any>(service, "extractBet")
      .withArgs(argument2, 1, "test_user_id_1").and.returnValue(argument2[0])
      .withArgs(argument2, 2, "test_user_id_1").and.returnValue(argument2[1])
      .withArgs(argument2, 1, "test_user_id_2").and.returnValue(defaultBets[0])
      .withArgs(argument2, 2, "test_user_id_2").and.returnValue(defaultBets[1])
      .withArgs(argument2, 1, "test_user_id_3").and.returnValue(argument2[2])
      .withArgs(argument2, 2, "test_user_id_3").and.returnValue(argument2[3])
      .withArgs(argument2, 1, "test_user_id_4").and.returnValue(argument2[4])
      .withArgs(argument2, 2, "test_user_id_4").and.returnValue(argument2[5]);

    spyOn<any>(service, "extractResult")
      .withArgs(argument3, 1).and.returnValue(argument3[0])
      .withArgs(argument3, 2).and.returnValue(argument3[1]);

    const expectedValue: TableData[] = [
      {
        userId: "test_user_id_3",
        points: 42,
        matches: 26,
        results: 6,
        extra: 10
      },
      {
        userId: "test_user_id_2",
        points: 41,
        matches: 27,
        results: 8,
        extra: 6
      },
      {
        userId: "test_user_id_4",
        points: 39,
        matches: 25,
        results: 4,
        extra: 10
      },
      {
        userId: "test_user_id_1",
        points: 35,
        matches: 23,
        results: 5,
        extra: 7
      }
    ];

    expect(service["getBetTable"](argument1, argument2, argument3, argument4)).toEqual(expectedValue);
  });

  it("getBetTable, one result missing", () => {
    const argument1: MatchExtended[] = [
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

    const argument2: BetExtended[] = [
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
    const argument3: ResultExtended[] = [
      {
        documentId: "test_id",
        matchId: 2,
        goalsHome: 1,
        goalsAway: 1
      }
    ];

    const argument4: TableData[] = [];

    const initialTableData: TableData[] = [
      {
        userId: "test_user_id_1",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      },
      {
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      },
      {
        userId: "test_user_id_4",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      }];

    const defaultResult: ResultExtended = {
      documentId: "",
      matchId: 1,
      goalsHome: -1,
      goalsAway: -1
    };

    pointCalculatorSpy.getMatchPoints
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 1), defaultResult, argument1[0])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 2), argument3[0], argument1[1])
      .and.returnValue({ points: 3, matches: 1, results: 0, extraTop: 1, extraOutsider: 1 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 1), defaultResult, argument1[0])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 2), argument3[0], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 1), defaultResult, argument1[0])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 2), argument3[0], argument1[1])
      .and.returnValue({ points: 5, matches: 1, results: 1, extraTop: 2, extraOutsider: 1 })

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_3", "test_user_id_4"]);

    spyOn<any>(service, "initTableData")
      .withArgs("test_user_id_1", []).and.returnValue(initialTableData[0])
      .withArgs("test_user_id_3", []).and.returnValue(initialTableData[1])
      .withArgs("test_user_id_4", []).and.returnValue(initialTableData[2]);

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

    const expectedValue: TableData[] = [
      {
        userId: "test_user_id_4",
        points: 5,
        matches: 1,
        results: 1,
        extra: 3
      },
      {
        userId: "test_user_id_1",
        points: 3,
        matches: 1,
        results: 0,
        extra: 2
      },
      {
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      }
    ];

    expect(service["getBetTable"](argument1, argument2, argument3, argument4)).toEqual(expectedValue);
  });

  it("getBetTable, one result empty", () => {
    const argument1: MatchExtended[] = [
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

    const argument2: BetExtended[] = [
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
    const argument3: ResultExtended[] = [
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

    const argument4: TableData[] = [];

    const initialTableData: TableData[] = [
      {
        userId: "test_user_id_1",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      },
      {
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      },
      {
        userId: "test_user_id_4",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      }];

    pointCalculatorSpy.getMatchPoints
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 3, matches: 1, results: 0, extraTop: 1, extraOutsider: 1 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 5, matches: 1, results: 1, extraTop: 2, extraOutsider: 1 })

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_3", "test_user_id_4"]);

    spyOn<any>(service, "initTableData")
      .withArgs("test_user_id_1", []).and.returnValue(initialTableData[0])
      .withArgs("test_user_id_3", []).and.returnValue(initialTableData[1])
      .withArgs("test_user_id_4", []).and.returnValue(initialTableData[2]);

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

    const expectedValue: TableData[] = [
      {
        userId: "test_user_id_4",
        points: 5,
        matches: 1,
        results: 1,
        extra: 3
      },
      {
        userId: "test_user_id_1",
        points: 3,
        matches: 1,
        results: 0,
        extra: 2
      },
      {
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      }
    ];

    expect(service["getBetTable"](argument1, argument2, argument3, argument4)).toEqual(expectedValue);
  });

  it("getBetTable, bets of one user empty", () => {
    const argument1: MatchExtended[] = [
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

    const argument2: BetExtended[] = [
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
    const argument3: ResultExtended[] = [
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

    const argument4: TableData[] = [];

    const initialTableData: TableData[] = [
      {
        userId: "test_user_id_1",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      },
      {
        userId: "test_user_id_2",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      },
      {
        userId: "test_user_id_3",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      },
      {
        userId: "test_user_id_4",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      }];

    pointCalculatorSpy.getMatchPoints
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_1", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_2", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 1, matches: 1, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_2", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 2, matches: 1, results: 1, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_3", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 1), argument3[0], argument1[0])
      .and.returnValue({ points: 1, matches: 1, results: 0, extraTop: 0, extraOutsider: 0 })
      .withArgs("test_user_id_4", argument2.filter(bet => bet.matchId == 2), argument3[1], argument1[1])
      .and.returnValue({ points: 6, matches: 1, results: 1, extraTop: 2, extraOutsider: 2 });

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_2", "test_user_id_3", "test_user_id_4"]);

    spyOn<any>(service, "initTableData")
      .withArgs("test_user_id_1", []).and.returnValue(initialTableData[0])
      .withArgs("test_user_id_2", []).and.returnValue(initialTableData[1])
      .withArgs("test_user_id_3", []).and.returnValue(initialTableData[2])
      .withArgs("test_user_id_4", []).and.returnValue(initialTableData[3]);

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

    const expectedValue: TableData[] = [
      {
        userId: "test_user_id_4",
        points: 7,
        matches: 2,
        results: 1,
        extra: 4
      },
      {
        userId: "test_user_id_3",
        points: 2,
        matches: 1,
        results: 1,
        extra: 0
      },
      {
        userId: "test_user_id_2",
        points: 1,
        matches: 1,
        results: 0,
        extra: 0
      },
      {
        userId: "test_user_id_1",
        points: 0,
        matches: 0,
        results: 0,
        extra: 0
      }
    ];

    expect(service["getBetTable"](argument1, argument2, argument3, argument4)).toEqual(expectedValue);
  });

  it("getBetTable, match array empty", () => {
    const argument1: MatchExtended[] = [];

    const argument2: BetExtended[] = [
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
    const argument3: ResultExtended[] = [
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

    const argument4: TableData[] = [
      {
        userId: "test_user_id_1",
        points: 35,
        matches: 23,
        results: 5,
        extra: 7
      },
      {
        userId: "test_user_id_2",
        points: 41,
        matches: 27,
        results: 8,
        extra: 6
      },
      {
        userId: "test_user_id_3",
        points: 40,
        matches: 25,
        results: 5,
        extra: 10
      },
      {
        userId: "test_user_id_4",
        points: 32,
        matches: 23,
        results: 3,
        extra: 6
      }];

    spyOn<any>(service, "identifyUsers")
      .and.returnValue(["test_user_id_1", "test_user_id_2", "test_user_id_3", "test_user_id_4"]);

    spyOn<any>(service, "initTableData")
      .withArgs("test_user_id_1", argument4).and.returnValue(argument4[0])
      .withArgs("test_user_id_2", argument4).and.returnValue(argument4[1])
      .withArgs("test_user_id_3", argument4).and.returnValue(argument4[2])
      .withArgs("test_user_id_4", argument4).and.returnValue(argument4[3]);

    const expectedValue: TableData[] = [
      {
        userId: "test_user_id_2",
        points: 41,
        matches: 27,
        results: 8,
        extra: 6
      },
      {
        userId: "test_user_id_3",
        points: 40,
        matches: 25,
        results: 5,
        extra: 10
      },
      {
        userId: "test_user_id_1",
        points: 35,
        matches: 23,
        results: 5,
        extra: 7
      },
      {
        userId: "test_user_id_4",
        points: 32,
        matches: 23,
        results: 3,
        extra: 6
      }
    ];

    expect(service["getBetTable"](argument1, argument2, argument3, argument4)).toEqual(expectedValue);
  });

  it("getBetTable, all input arrays empty", () => {
    const argument1: MatchExtended[] = [];
    const argument2: BetExtended[] = [];
    const argument3: ResultExtended[] = [];
    const argument4: TableData[] = [];

    spyOn<any>(service, "identifyUsers")
      .and.returnValue([]);

    const expectedValue: TableData[] = []

    expect(service["getBetTable"](argument1, argument2, argument3, argument4)).toEqual(expectedValue);
  });
});
