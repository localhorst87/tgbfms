import { TestBed } from '@angular/core/testing';

import { PointCalculatorTrendbasedService } from './point-calculator-trendbased.service';
import {
  POINTS_TENDENCY, POINTS_ADDED_RESULT, FACTOR_TOP_MATCH, POINTS_ADDED_OUTSIDER_TWO, POINTS_ADDED_OUTSIDER_ONE,
  POINTS_SEASON_FIRST_EXACT, POINTS_SEASON_SECOND_EXACT, POINTS_SEASON_LOSER_EXACT, POINTS_SEASON_LOSER_CORRECT
} from './rule_defined_values';
import { Bet, Result, Match, Score, SeasonBet, SeasonResult } from './basic_datastructures';


describe("PointCalculatorTrendbasedService", () => {
  let service: PointCalculatorTrendbasedService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PointCalculatorTrendbasedService] });
    service = TestBed.inject(PointCalculatorTrendbasedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // isAvailable
  // ---------------------------------------------------------------------------

  it("isAvailable goals set, Bet", () => {
    const argument: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 0
    };
    expect(service["isAvailable"](argument)).toBeTrue();
  });

  it("isAvailable goals set, Result", () => {
    const argument: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 1,
      goalsAway: 0
    };
    expect(service["isAvailable"](argument)).toBeTrue();
  });

  it("isAvailable one goal not set, Bet", () => {
    const argument: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: -1,
      goalsAway: 0
    };
    expect(service["isAvailable"](argument)).toBeFalse();
  });

  it("isAvailable no goals set, Result", () => {
    const argument: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: -1,
      goalsAway: -1
    };
    expect(service["isAvailable"](argument)).toBeFalse();
  });

  // ---------------------------------------------------------------------------
  // getTendency
  // ---------------------------------------------------------------------------

  it("getTendency home win, Bet", () => {
    const argument: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    };
    spyOn<any>(service, "isAvailable").and.returnValue(true);
    const expectedValue: number = 1;
    expect(service["getTendency"](argument)).toBe(expectedValue);
  });

  it("getTendency away win bet", () => {
    const argument: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 1
    };
    spyOn<any>(service, "isAvailable").and.returnValue(true);
    const expectedValue: number = 2;
    expect(service["getTendency"](argument)).toBe(expectedValue);
  });

  it("getTendency draw, Bet", () => {
    const argument: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 0
    };
    spyOn<any>(service, "isAvailable").and.returnValue(true);
    const expectedValue: number = 0;
    expect(service["getTendency"](argument)).toBe(expectedValue);
  });

  it("getTendency goals not set, Bet", () => {
    const argument: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: -1,
      goalsAway: -1
    };
    spyOn<any>(service, "isAvailable").and.returnValue(false);
    const expectedValue: number = -1;
    expect(service["getTendency"](argument)).toBe(expectedValue);
  });

  it("getTendency home win, Result", () => {
    const argument: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 1,
      goalsAway: 0
    };
    spyOn<any>(service, "isAvailable").and.returnValue(true);
    const expectedValue: number = 1;
    expect(service["getTendency"](argument)).toBe(expectedValue);
  });

  it("getTendency away win, Result", () => {
    const argument: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 1,
      goalsAway: 3
    };
    spyOn<any>(service, "isAvailable").and.returnValue(true);
    const expectedValue: number = 2;
    expect(service["getTendency"](argument)).toBe(expectedValue);
  });

  it("getTendency draw, Result", () => {
    const argument: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 2,
      goalsAway: 2
    };
    spyOn<any>(service, "isAvailable").and.returnValue(true);
    const expectedValue: number = 0;
    expect(service["getTendency"](argument)).toBe(expectedValue);
  });

  it("getTendency no goals set, Result", () => {
    const argument: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: -1,
      goalsAway: -1
    };
    spyOn<any>(service, "isAvailable").and.returnValue(false);
    const expectedValue: number = -1;
    expect(service["getTendency"](argument)).toBe(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // isTendencyCorrect
  // ---------------------------------------------------------------------------

  it("isTendencyCorrect, expect true", () => {
    const argument1: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 3,
      goalsAway: 1
    };
    const argument2: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 1,
      goalsAway: 0
    };
    spyOn<any>(service, "isAvailable").and.returnValue(true);
    spyOn<any>(service, "getTendency")
      .withArgs(argument1).and.returnValue(1)
      .withArgs(argument2).and.returnValue(1);

    const expectedValue: boolean = true;
    expect(service["isTendencyCorrect"](argument1, argument2)).toBe(expectedValue);
  });

  it("isTendencyCorrect, expect false", () => {
    const argument1: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 1
    };
    const argument2: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 1,
      goalsAway: 0
    };
    spyOn<any>(service, "isAvailable").and.returnValue(true);
    spyOn<any>(service, "getTendency")
      .withArgs(argument1).and.returnValue(0)
      .withArgs(argument2).and.returnValue(1);

    const expectedValue: boolean = false;
    expect(service["isTendencyCorrect"](argument1, argument2)).toBe(expectedValue);
  });

  it("isTendencyCorrect, Bet not set", () => {
    const argument1: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: false,
      goalsHome: -1,
      goalsAway: -1
    };
    const argument2: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 1,
      goalsAway: 0
    };

    spyOn<any>(service, "isAvailable")
      .withArgs(argument1).and.returnValue(false)
      .withArgs(argument2).and.returnValue(true);
    spyOn<any>(service, "getTendency")
      .withArgs(argument1).and.returnValue(-1)
      .withArgs(argument2).and.returnValue(1);

    const expectedValue: boolean = false;
    expect(service["isTendencyCorrect"](argument1, argument2)).toBe(expectedValue);
  });

  it("isTendencyCorrect, Bet and Result not set", () => {
    const argument1: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: false,
      goalsHome: -1,
      goalsAway: -1
    };
    const argument2: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: -1,
      goalsAway: -1
    };

    spyOn<any>(service, "isAvailable")
      .withArgs(argument1).and.returnValue(false)
      .withArgs(argument2).and.returnValue(false);
    spyOn<any>(service, "getTendency")
      .withArgs(argument1).and.returnValue(-1)
      .withArgs(argument2).and.returnValue(-1);

    const expectedValue: boolean = false;
    expect(service["isTendencyCorrect"](argument1, argument2)).toBe(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // isResultCorrect
  // ---------------------------------------------------------------------------

  it("isResultCorrect bet and result equal", () => {
    const argument1: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 0
    };
    const argument2: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 1,
      goalsAway: 0
    };
    spyOn<any>(service, "isAvailable").and.returnValue(true);
    const expectedValue: boolean = true;
    expect(service["isResultCorrect"](argument1, argument2)).toBe(expectedValue);
  });

  it("isResultCorrect bet and result not equal", () => {
    const argument1: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 0
    };
    const argument2: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 1,
      goalsAway: 0
    };
    spyOn<any>(service, "isAvailable").and.returnValue(true);
    const expectedValue: boolean = false;
    expect(service["isResultCorrect"](argument1, argument2)).toBe(expectedValue);
  });

  it("isResultCorrect Bet not set", () => {
    const argument1: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: -1,
      goalsAway: -1
    };
    const argument2: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 1,
      goalsAway: 2
    };
    spyOn<any>(service, "isAvailable")
      .withArgs(argument1).and.returnValue(false)
      .withArgs(argument2).and.returnValue(true);
    const expectedValue: boolean = false;
    expect(service["isResultCorrect"](argument1, argument2)).toBe(expectedValue);
  });

  it("isResultCorrect Result not set", () => {
    const argument1: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 0
    };
    const argument2: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: -1,
      goalsAway: -1
    };
    spyOn<any>(service, "isAvailable")
      .withArgs(argument1).and.returnValue(true)
      .withArgs(argument2).and.returnValue(false);
    const expectedValue: boolean = false;
    expect(service["isResultCorrect"](argument1, argument2)).toBe(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // countTendencies
  // ---------------------------------------------------------------------------

  it("countTendencies, only valid Bets", () => {
    let argument: Bet[] = [];
    argument.push({
      documentId: "test_id_1",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 0
    });
    argument.push({
      documentId: "test_id_1",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 1
    });
    argument.push({
      documentId: "test_id_1",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 4,
      goalsAway: 1
    });
    argument.push({
      documentId: "test_id_1",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 1
    });
    spyOn<any>(service, "getTendency")
      .withArgs(argument[0]).and.returnValue(1)
      .withArgs(argument[1]).and.returnValue(0)
      .withArgs(argument[2]).and.returnValue(1)
      .withArgs(argument[3]).and.returnValue(2);
    const expectedValue: number[] = [1, 2, 1];
    expect(service["countTendencies"](argument)).toEqual(expectedValue);
  });

  it("countTendencies, one empty Bet", () => {
    let argument: Bet[] = [];
    argument.push({
      documentId: "test_id_1",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 0
    });
    argument.push({
      documentId: "test_id_1",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: -1,
      goalsAway: -1
    });
    argument.push({
      documentId: "test_id_1",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 4,
      goalsAway: 1
    });
    spyOn<any>(service, "getTendency")
      .withArgs(argument[0]).and.returnValue(1)
      .withArgs(argument[1]).and.returnValue(-1)
      .withArgs(argument[2]).and.returnValue(1);
    const expectedValue: number[] = [0, 2, 0];
    expect(service["countTendencies"](argument)).toEqual(expectedValue);
  });

  it("countTendencies, empty Array", () => {
    const argument: Bet[] = [];
    const expectedValue: number[] = [0, 0, 0];
    expect(service["countTendencies"](argument)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // getPotentialOutsiderPoints
  // ---------------------------------------------------------------------------

  it("getPotentialOutsiderPoints, no extra points", () => {
    const argument: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 1
    };
    spyOn<any>(service, "countTendencies").and.returnValue([4, 2, 1]);
    spyOn<any>(service, "getTendency").withArgs(argument).and.returnValue(0);
    const expectedValue: number = 0;
    expect(service["getPotentialOutsiderPoints"]([], argument)).toBe(expectedValue);
  });

  it("getPotentialOutsiderPoints, no extra points", () => {
    const argument: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 2
    };
    spyOn<any>(service, "countTendencies").and.returnValue([3, 7, 2]);
    spyOn<any>(service, "getTendency").withArgs(argument).and.returnValue(2);
    const expectedValue: number = POINTS_ADDED_OUTSIDER_TWO;
    expect(service["getPotentialOutsiderPoints"]([], argument)).toBe(expectedValue);
  });

  it("getPotentialOutsiderPoints, no extra points", () => {
    const argument: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 4,
      goalsAway: 0
    };
    spyOn<any>(service, "countTendencies").and.returnValue([3, 1, 5]);
    spyOn<any>(service, "getTendency").withArgs(argument).and.returnValue(1);
    const expectedValue: number = POINTS_ADDED_OUTSIDER_ONE;
    expect(service["getPotentialOutsiderPoints"]([], argument)).toBe(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // calcSingleMatchScore
  // ---------------------------------------------------------------------------

  it("calcSingleMatchScore, bet wrong, no top, no outsider", () => {
    const userId: string = "target_user";
    const result: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const betUser: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 1
    };
    const betArray: Bet[] = [
      betUser,
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 0
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
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2
      }
    ];
    const match: Match = {
      documentId: "test_id",
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: false,
      teamIdHome: 12,
      teamIdAway: 123
    };
    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(0);
    const expectedValue: Score = { userId: userId, points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };
    expect(service["calcSingleMatchScore"](userId, betArray, result, match)).toEqual(expectedValue);
  });

  it("calcSingleMatchScore, bet tendency right, no top, no outsider", () => {
    const userId: string = "target_user";
    const result: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const betUser: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 0
    };
    const betArray: Bet[] = [
      betUser,
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 3,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2
      }
    ];
    const match: Match = {
      documentId: "test_id",
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: false,
      teamIdHome: 12,
      teamIdAway: 123
    };
    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(0);
    const expectedValue: Score = { userId: userId, points: POINTS_TENDENCY, matches: 1, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };
    expect(service["calcSingleMatchScore"](userId, betArray, result, match)).toEqual(expectedValue);
  });

  it("calcSingleMatchScore, bet tendency right, top, no outsider", () => {
    const userId: string = "target_user";
    const result: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const betUser: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    };
    const betArray: Bet[] = [
      betUser,
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 3,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2
      }
    ];
    const match: Match = {
      documentId: "test_id",
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123
    };
    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(0);
    const expectedValue: Score = {
      userId: userId,
      points: FACTOR_TOP_MATCH * POINTS_TENDENCY,
      matches: 1,
      results: 0,
      extraTop: (FACTOR_TOP_MATCH - 1) * POINTS_TENDENCY,
      extraOutsider: 0,
      extraSeason: 0
    };
    expect(service["calcSingleMatchScore"](userId, betArray, result, match)).toEqual(expectedValue);
  });

  it("calcSingleMatchScore, bet tendency right, no top, two outsider", () => {
    const userId: string = "target_user";
    const result: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const betUser: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    };
    let betArray: Bet[] = [
      betUser,
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 0
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2
      }
    ];
    const match: Match = {
      documentId: "test_id",
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: false,
      teamIdHome: 12,
      teamIdAway: 123
    };
    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_TWO);
    const expectedValue: Score = {
      userId: userId,
      points: POINTS_TENDENCY + POINTS_ADDED_OUTSIDER_TWO,
      matches: 1,
      results: 0,
      extraTop: 0,
      extraOutsider: POINTS_ADDED_OUTSIDER_TWO,
      extraSeason: 0
    };
    expect(service["calcSingleMatchScore"](userId, betArray, result, match)).toEqual(expectedValue);
  });

  it("calcSingleMatchScore, bet tendency right, no top, single outsider", () => {
    const userId: string = "target_user";
    const result: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const betUser: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    };
    const betArray: Bet[] = [
      betUser,
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 3
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2
      }
    ];
    const match: Match = {
      documentId: "test_id",
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: false,
      teamIdHome: 12,
      teamIdAway: 123
    };
    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
    const expectedValue: Score = {
      userId: userId,
      points: POINTS_TENDENCY + POINTS_ADDED_OUTSIDER_ONE,
      matches: 1,
      results: 0,
      extraTop: 0,
      extraOutsider: POINTS_ADDED_OUTSIDER_ONE,
      extraSeason: 0
    };
    expect(service["calcSingleMatchScore"](userId, betArray, result, match)).toEqual(expectedValue);
  });

  it("calcSingleMatchScore, bet tendency right, top, single outsider", () => {
    const userId: string = "target_user";
    const result: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const betUser: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    };
    const betArray: Bet[] = [
      betUser,
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 3
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2
      }
    ];
    const match: Match = {
      documentId: "test_id",
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123
    };

    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
    const expectedValue: Score = {
      userId: userId,
      points: FACTOR_TOP_MATCH * POINTS_TENDENCY + POINTS_ADDED_OUTSIDER_ONE,
      matches: 1,
      results: 0,
      extraTop: (FACTOR_TOP_MATCH - 1) * POINTS_TENDENCY,
      extraOutsider: POINTS_ADDED_OUTSIDER_ONE,
      extraSeason: 0
    };
    expect(service["calcSingleMatchScore"](userId, betArray, result, match)).toEqual(expectedValue);
  });

  it("calcSingleMatchScore, bet result right, top, single outsider", () => {
    const userId: string = "target_user";
    const result: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const betUser: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 3,
      goalsAway: 1
    };
    const betArray: Bet[] = [
      betUser,
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 3
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2
      }
    ];
    const match: Match = {
      documentId: "test_id",
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123
    };

    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
    const expectedValue: Score = {
      userId: userId,
      points: FACTOR_TOP_MATCH * (POINTS_TENDENCY + POINTS_ADDED_RESULT) + POINTS_ADDED_OUTSIDER_ONE,
      matches: 1,
      results: 1,
      extraTop: (FACTOR_TOP_MATCH - 1) * (POINTS_TENDENCY + POINTS_ADDED_RESULT),
      extraOutsider: POINTS_ADDED_OUTSIDER_ONE,
      extraSeason: 0
    };
    expect(service["calcSingleMatchScore"](userId, betArray, result, match)).toEqual(expectedValue);
  });

  it("calcSingleMatchScore, bet wrong, top, single outsider", () => {
    const userId: string = "target_user";
    const result: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const betUser: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 1
    };
    const betArray: Bet[] = [
      betUser,
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 0
      }
    ];
    const match: Match = {
      documentId: "test_id",
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123
    };

    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
    const expectedValue: Score = { userId: userId, points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };
    expect(service["calcSingleMatchScore"](userId, betArray, result, match)).toEqual(expectedValue);
  });

  it("calcSingleMatchScore, no goals set in target bet, top", () => {
    const userId: string = "target_user";
    const result: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const betUser: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: -1,
      goalsAway: -1
    };
    const betArray: Bet[] = [
      betUser,
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 0
      }
    ];
    const match: Match = {
      documentId: "test_id",
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123
    };

    const expectedValue: Score = { userId: userId, points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };
    expect(service["calcSingleMatchScore"](userId, betArray, result, match)).toEqual(expectedValue);
  });

  it("calcSingleMatchScore, no goals set in result, top, single outsider", () => {
    const userId: string = "target_user";
    const result: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: -1,
      goalsAway: -1
    };
    const betUser: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 0
    };
    const betArray: Bet[] = [
      betUser,
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 2,
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
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 0
      }
    ];
    const match: Match = {
      documentId: "test_id",
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123
    };

    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);

    const expectedValue: Score = { userId: userId, points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };
    expect(service["calcSingleMatchScore"](userId, betArray, result, match)).toEqual(expectedValue);
  });

  it("calcSingleMatchScore, no goals set in target bet, no goals set in result", () => {
    const userId: string = "target_user";
    const result: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: -1,
      goalsAway: -1
    };
    const betUser: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: -1,
      goalsAway: -1
    };
    const betArray: Bet[] = [
      betUser,
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 2,
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
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 1,
        goalsAway: 0
      }
    ];
    const match: Match = {
      documentId: "test_id",
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: false,
      teamIdHome: 12,
      teamIdAway: 123
    };

    const expectedValue: Score = { userId: userId, points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };
    expect(service["calcSingleMatchScore"](userId, betArray, result, match)).toEqual(expectedValue);
  });

  it("calcSingleMatchScore, user bet not in array, top, single outsider", () => {
    const userId: string = "target_user";
    const result: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    let betArray: Bet[] = [
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
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 1
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 0
      }
    ];
    const match: Match = {
      documentId: "test_id",
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123
    };

    const expectedValue: Score = { userId: userId, points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };
    expect(service["calcSingleMatchScore"](userId, betArray, result, match)).toEqual(expectedValue);
  });

  it("calcSingleMatchScore, matchIds of match and others do not correspond", () => {
    const userId: string = "target_user";
    const result: Result = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const betUser: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    };
    const betArray: Bet[] = [
      betUser,
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 3
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2
      }
    ];
    const match: Match = {
      documentId: "test_id",
      season: 2020,
      matchday: 4,
      matchId: 99,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123
    };

    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
    const expectedValue: Score = { userId: userId, points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };
    expect(service["calcSingleMatchScore"](userId, betArray, result, match)).toEqual(expectedValue);
  });

  it("calcSingleMatchScore, matchIds of bet and result do not correspond", () => {
    const userId: string = "target_user";
    const result: Result = {
      documentId: "test_id",
      matchId: 99,
      goalsHome: 3,
      goalsAway: 1
    };
    const betUser: Bet = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    };
    const betArray: Bet[] = [
      betUser,
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_2",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 3
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_3",
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2
      },
      {
        documentId: "test_id",
        matchId: 1,
        userId: "test_user_id_4",
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2
      }
    ];
    const match: Match = {
      documentId: "test_id",
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123
    };

    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
    const expectedValue: Score = { userId: userId, points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };
    expect(service["calcSingleMatchScore"](userId, betArray, result, match)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // calcSingleSeasonScore
  // ---------------------------------------------------------------------------

  it("calcSingleSeasonScore, only champion correct", () => {
    const seasonBets: SeasonBet[] = [
      {
        documentId: "test_doc_id_0",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 1,
        teamId: 101
      },
      {
        documentId: "test_doc_id_1",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 2,
        teamId: 201
      },
      {
        documentId: "test_doc_id_2",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -1,
        teamId: 121
      },
      {
        documentId: "test_doc_id_3",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -2,
        teamId: 165
      },
      {
        documentId: "test_doc_id_4",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -3,
        teamId: 107
      }
    ];

    const seasonResults: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: seasonBets[0].teamId
      },
      {
        documentId: "test_doc_id_11",
        season: 2020,
        place: 2,
        teamId: 20
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: 12
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: 65
      },
      {
        documentId: "test_doc_id_14",
        season: 2020,
        place: -3,
        teamId: 7
      }
    ];

    spyOn<any>(service, "getRelegatorResults").and.returnValue([seasonResults[2], seasonResults[3], seasonResults[4]]);
    spyOn<any>(service, "getSeasonResultFromArray")
      .withArgs(1, seasonResults).and.returnValue(seasonResults[0])
      .withArgs(2, seasonResults).and.returnValue(seasonResults[1])
      .withArgs(-1, seasonResults).and.returnValue(seasonResults[2])
      .withArgs(-2, seasonResults).and.returnValue(seasonResults[3])
      .withArgs(-3, seasonResults).and.returnValue(seasonResults[4]);

    const expectedValue: Score = { userId: seasonBets[0].userId, points: POINTS_SEASON_FIRST_EXACT, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: POINTS_SEASON_FIRST_EXACT };
    expect(service["calcSingleSeasonScore"](seasonBets, seasonResults)).toEqual(expectedValue);
  });

  it("calcSingleSeasonScore, only second correct", () => {
    const seasonBets: SeasonBet[] = [
      {
        documentId: "test_doc_id_0",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 1,
        teamId: 101
      },
      {
        documentId: "test_doc_id_1",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 2,
        teamId: 201
      },
      {
        documentId: "test_doc_id_2",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -1,
        teamId: 121
      },
      {
        documentId: "test_doc_id_3",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -2,
        teamId: 165
      },
      {
        documentId: "test_doc_id_4",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -3,
        teamId: 107
      }
    ];

    const seasonResults: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: 8
      },
      {
        documentId: "test_doc_id_11",
        season: 2020,
        place: 2,
        teamId: seasonBets[1].teamId
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: 12
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: 65
      },
      {
        documentId: "test_doc_id_14",
        season: 2020,
        place: -3,
        teamId: 7
      }
    ];

    spyOn<any>(service, "getRelegatorResults").and.returnValue([seasonResults[2], seasonResults[3], seasonResults[4]]);
    spyOn<any>(service, "getSeasonResultFromArray")
      .withArgs(1, seasonResults).and.returnValue(seasonResults[0])
      .withArgs(2, seasonResults).and.returnValue(seasonResults[1])
      .withArgs(-1, seasonResults).and.returnValue(seasonResults[2])
      .withArgs(-2, seasonResults).and.returnValue(seasonResults[3])
      .withArgs(-3, seasonResults).and.returnValue(seasonResults[4]);

    const expectedValue: Score = { userId: seasonBets[0].userId, points: POINTS_SEASON_SECOND_EXACT, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: POINTS_SEASON_SECOND_EXACT };

    expect(service["calcSingleSeasonScore"](seasonBets, seasonResults)).toEqual(expectedValue);
  });

  it("calcSingleSeasonScore, champ and second correct", () => {
    const seasonBets: SeasonBet[] = [
      {
        documentId: "test_doc_id_0",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 1,
        teamId: 101
      },
      {
        documentId: "test_doc_id_1",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 2,
        teamId: 201
      },
      {
        documentId: "test_doc_id_2",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -1,
        teamId: 121
      },
      {
        documentId: "test_doc_id_3",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -2,
        teamId: 165
      },
      {
        documentId: "test_doc_id_4",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -3,
        teamId: 107
      }
    ];

    const seasonResults: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: seasonBets[0].teamId
      },
      {
        documentId: "test_doc_id_11",
        season: 2020,
        place: 2,
        teamId: seasonBets[1].teamId
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: 12
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: 65
      },
      {
        documentId: "test_doc_id_14",
        season: 2020,
        place: -3,
        teamId: 7
      }
    ];

    spyOn<any>(service, "getRelegatorResults").and.returnValue([seasonResults[2], seasonResults[3], seasonResults[4]]);
    spyOn<any>(service, "getSeasonResultFromArray")
      .withArgs(1, seasonResults).and.returnValue(seasonResults[0])
      .withArgs(2, seasonResults).and.returnValue(seasonResults[1])
      .withArgs(-1, seasonResults).and.returnValue(seasonResults[2])
      .withArgs(-2, seasonResults).and.returnValue(seasonResults[3])
      .withArgs(-3, seasonResults).and.returnValue(seasonResults[4]);

    const expectedValue: Score = { userId: seasonBets[0].userId, points: POINTS_SEASON_FIRST_EXACT + POINTS_SEASON_SECOND_EXACT, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: POINTS_SEASON_FIRST_EXACT + POINTS_SEASON_SECOND_EXACT };

    expect(service["calcSingleSeasonScore"](seasonBets, seasonResults)).toEqual(expectedValue);
  });

  it("calcSingleSeasonScore, one relegator exactly correct", () => {
    const seasonBets: SeasonBet[] = [
      {
        documentId: "test_doc_id_0",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 1,
        teamId: 101
      },
      {
        documentId: "test_doc_id_1",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 2,
        teamId: 201
      },
      {
        documentId: "test_doc_id_2",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -1,
        teamId: 121
      },
      {
        documentId: "test_doc_id_3",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -2,
        teamId: 165
      },
      {
        documentId: "test_doc_id_4",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -3,
        teamId: 107
      }
    ];

    const seasonResults: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: 2
      },
      {
        documentId: "test_doc_id_11",
        season: 2020,
        place: 2,
        teamId: 4
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: seasonBets[2].teamId
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: 65
      },
      {
        documentId: "test_doc_id_14",
        season: 2020,
        place: -3,
        teamId: 7
      }
    ];

    spyOn<any>(service, "getRelegatorResults").and.returnValue([seasonResults[2], seasonResults[3], seasonResults[4]]);
    spyOn<any>(service, "getSeasonResultFromArray")
      .withArgs(1, seasonResults).and.returnValue(seasonResults[0])
      .withArgs(2, seasonResults).and.returnValue(seasonResults[1])
      .withArgs(-1, seasonResults).and.returnValue(seasonResults[2])
      .withArgs(-2, seasonResults).and.returnValue(seasonResults[3])
      .withArgs(-3, seasonResults).and.returnValue(seasonResults[4]);

    const expectedValue: Score = { userId: seasonBets[0].userId, points: POINTS_SEASON_LOSER_EXACT, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: POINTS_SEASON_LOSER_EXACT };

    expect(service["calcSingleSeasonScore"](seasonBets, seasonResults)).toEqual(expectedValue);
  });

  it("calcSingleSeasonScore, one relegator exactly correct, another one correct", () => {
    const seasonBets: SeasonBet[] = [
      {
        documentId: "test_doc_id_0",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 1,
        teamId: 101
      },
      {
        documentId: "test_doc_id_1",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 2,
        teamId: 201
      },
      {
        documentId: "test_doc_id_4",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -3,
        teamId: 107
      },
      {
        documentId: "test_doc_id_2",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -1,
        teamId: 121
      },
      {
        documentId: "test_doc_id_3",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -2,
        teamId: 165
      },
    ];

    const seasonResults: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: 2
      },
      {
        documentId: "test_doc_id_11",
        season: 2020,
        place: 2,
        teamId: 4
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: seasonBets[2].teamId
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: seasonBets[3].teamId
      },
      {
        documentId: "test_doc_id_14",
        season: 2020,
        place: -3,
        teamId: 7
      }
    ];

    spyOn<any>(service, "getRelegatorResults").and.returnValue([seasonResults[2], seasonResults[3], seasonResults[4]]);
    spyOn<any>(service, "getSeasonResultFromArray")
      .withArgs(1, seasonResults).and.returnValue(seasonResults[0])
      .withArgs(2, seasonResults).and.returnValue(seasonResults[1])
      .withArgs(-1, seasonResults).and.returnValue(seasonResults[3])
      .withArgs(-2, seasonResults).and.returnValue(seasonResults[2])
      .withArgs(-3, seasonResults).and.returnValue(seasonResults[4]);

    const expectedValue: Score = {
      userId: seasonBets[0].userId,
      points: POINTS_SEASON_LOSER_EXACT + POINTS_SEASON_LOSER_CORRECT,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: POINTS_SEASON_LOSER_EXACT + POINTS_SEASON_LOSER_CORRECT
    };

    expect(service["calcSingleSeasonScore"](seasonBets, seasonResults)).toEqual(expectedValue);
  });

  it("calcSingleSeasonScore, all places correct", () => {
    const seasonBets: SeasonBet[] = [
      {
        documentId: "test_doc_id_0",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 1,
        teamId: 101
      },
      {
        documentId: "test_doc_id_1",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 2,
        teamId: 201
      },
      {
        documentId: "test_doc_id_2",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -1,
        teamId: 121
      },
      {
        documentId: "test_doc_id_3",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -2,
        teamId: 165
      },
      {
        documentId: "test_doc_id_4",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -3,
        teamId: 107
      }
    ];

    const seasonResults: SeasonResult[] = [
      {
        documentId: "test_doc_id_14",
        season: 2020,
        place: -3,
        teamId: seasonBets[4].teamId
      },
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: seasonBets[0].teamId
      },
      {
        documentId: "test_doc_id_11",
        season: 2020,
        place: 2,
        teamId: seasonBets[1].teamId
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: seasonBets[2].teamId
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: seasonBets[3].teamId
      }
    ];

    spyOn<any>(service, "getRelegatorResults").and.returnValue([seasonResults[0], seasonResults[3], seasonResults[4]]);
    spyOn<any>(service, "getSeasonResultFromArray")
      .withArgs(1, seasonResults).and.returnValue(seasonResults[1])
      .withArgs(2, seasonResults).and.returnValue(seasonResults[2])
      .withArgs(-1, seasonResults).and.returnValue(seasonResults[3])
      .withArgs(-2, seasonResults).and.returnValue(seasonResults[4])
      .withArgs(-3, seasonResults).and.returnValue(seasonResults[0]);

    const expectedValue: Score = {
      userId: seasonBets[0].userId,
      points: POINTS_SEASON_FIRST_EXACT + POINTS_SEASON_SECOND_EXACT + 3 * POINTS_SEASON_LOSER_EXACT,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: POINTS_SEASON_FIRST_EXACT + POINTS_SEASON_SECOND_EXACT + 3 * POINTS_SEASON_LOSER_EXACT
    };

    expect(service["calcSingleSeasonScore"](seasonBets, seasonResults)).toEqual(expectedValue);
  });

  it("calcSingleSeasonScore, all places wrong", () => {
    const seasonBets: SeasonBet[] = [
      {
        documentId: "test_doc_id_0",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 1,
        teamId: 101
      },
      {
        documentId: "test_doc_id_1",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 2,
        teamId: 201
      },
      {
        documentId: "test_doc_id_2",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -1,
        teamId: 121
      },
      {
        documentId: "test_doc_id_3",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -2,
        teamId: 165
      },
      {
        documentId: "test_doc_id_4",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -3,
        teamId: 107
      }
    ];

    const seasonResults: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: 4
      },
      {
        documentId: "test_doc_id_11",
        season: 2020,
        place: 2,
        teamId: 5
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: 7
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: 8
      },
      {
        documentId: "test_doc_id_14",
        season: 2020,
        place: -3,
        teamId: 9
      }
    ];

    spyOn<any>(service, "getRelegatorResults").and.returnValue([seasonResults[2], seasonResults[3], seasonResults[4]]);
    spyOn<any>(service, "getSeasonResultFromArray")
      .withArgs(1, seasonResults).and.returnValue(seasonResults[0])
      .withArgs(2, seasonResults).and.returnValue(seasonResults[1])
      .withArgs(-1, seasonResults).and.returnValue(seasonResults[2])
      .withArgs(-2, seasonResults).and.returnValue(seasonResults[3])
      .withArgs(-3, seasonResults).and.returnValue(seasonResults[4]);

    const expectedValue: Score = { userId: seasonBets[0].userId, points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };

    expect(service["calcSingleSeasonScore"](seasonBets, seasonResults)).toEqual(expectedValue);
  });

  it("calcSingleSeasonScore, bets not filled", () => {
    const seasonBets: SeasonBet[] = [
      {
        documentId: "test_doc_id_0",
        season: 2020,
        userId: "test_user_id",
        isFixed: false,
        place: 1,
        teamId: -1
      },
      {
        documentId: "test_doc_id_1",
        season: 2020,
        userId: "test_user_id",
        isFixed: false,
        place: 2,
        teamId: -1
      },
      {
        documentId: "test_doc_id_2",
        season: 2020,
        userId: "test_user_id",
        isFixed: false,
        place: -1,
        teamId: -1
      },
      {
        documentId: "test_doc_id_3",
        season: 2020,
        userId: "test_user_id",
        isFixed: false,
        place: -2,
        teamId: -1
      },
      {
        documentId: "test_doc_id_4",
        season: 2020,
        userId: "test_user_id",
        isFixed: false,
        place: -3,
        teamId: -1
      }
    ];

    const seasonResults: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: 4
      },
      {
        documentId: "test_doc_id_11",
        season: 2020,
        place: 2,
        teamId: 5
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: 7
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: 8
      },
      {
        documentId: "test_doc_id_14",
        season: 2020,
        place: -3,
        teamId: 9
      }
    ];

    spyOn<any>(service, "getRelegatorResults").and.returnValue([seasonResults[2], seasonResults[3], seasonResults[4]]);
    spyOn<any>(service, "getSeasonResultFromArray")
      .withArgs(1, seasonResults).and.returnValue(seasonResults[0])
      .withArgs(2, seasonResults).and.returnValue(seasonResults[1])
      .withArgs(-1, seasonResults).and.returnValue(seasonResults[2])
      .withArgs(-2, seasonResults).and.returnValue(seasonResults[3])
      .withArgs(-3, seasonResults).and.returnValue(seasonResults[4]);

    const expectedValue: Score = { userId: seasonBets[0].userId, points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };

    expect(service["calcSingleSeasonScore"](seasonBets, seasonResults)).toEqual(expectedValue);
  });

  it("calcSingleSeasonScore, results not filled", () => {
    const seasonBets: SeasonBet[] = [
      {
        documentId: "test_doc_id_0",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 1,
        teamId: 101
      },
      {
        documentId: "test_doc_id_1",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 2,
        teamId: 201
      },
      {
        documentId: "test_doc_id_2",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -1,
        teamId: 121
      },
      {
        documentId: "test_doc_id_3",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -2,
        teamId: 165
      },
      {
        documentId: "test_doc_id_4",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -3,
        teamId: 107
      }
    ];

    const seasonResults: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: -1
      },
      {
        documentId: "test_doc_id_11",
        season: 2020,
        place: 2,
        teamId: -1
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: -1
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: -1
      },
      {
        documentId: "test_doc_id_14",
        season: 2020,
        place: -3,
        teamId: -1
      }
    ];

    spyOn<any>(service, "getRelegatorResults").and.returnValue([seasonResults[2], seasonResults[3], seasonResults[4]]);
    spyOn<any>(service, "getSeasonResultFromArray")
      .withArgs(1, seasonResults).and.returnValue(seasonResults[0])
      .withArgs(2, seasonResults).and.returnValue(seasonResults[1])
      .withArgs(-1, seasonResults).and.returnValue(seasonResults[2])
      .withArgs(-2, seasonResults).and.returnValue(seasonResults[3])
      .withArgs(-3, seasonResults).and.returnValue(seasonResults[4]);

    const expectedValue: Score = { userId: seasonBets[0].userId, points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };

    expect(service["calcSingleSeasonScore"](seasonBets, seasonResults)).toEqual(expectedValue);
  });

  it("calcSingleSeasonScore, bets and results not filled", () => {
    const seasonBets: SeasonBet[] = [
      {
        documentId: "test_doc_id_0",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 1,
        teamId: -1
      },
      {
        documentId: "test_doc_id_1",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: 2,
        teamId: -1
      },
      {
        documentId: "test_doc_id_2",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -1,
        teamId: -1
      },
      {
        documentId: "test_doc_id_3",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -2,
        teamId: -1
      },
      {
        documentId: "test_doc_id_4",
        season: 2020,
        userId: "test_user_id",
        isFixed: true,
        place: -3,
        teamId: -1
      }
    ];

    const seasonResults: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: -1
      },
      {
        documentId: "test_doc_id_11",
        season: 2020,
        place: 2,
        teamId: -1
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: -1
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: -1
      },
      {
        documentId: "test_doc_id_14",
        season: 2020,
        place: -3,
        teamId: -1
      }
    ];

    spyOn<any>(service, "getRelegatorResults").and.returnValue([seasonResults[2], seasonResults[3], seasonResults[4]]);
    spyOn<any>(service, "getSeasonResultFromArray")
      .withArgs(1, seasonResults).and.returnValue(seasonResults[0])
      .withArgs(2, seasonResults).and.returnValue(seasonResults[1])
      .withArgs(-1, seasonResults).and.returnValue(seasonResults[2])
      .withArgs(-2, seasonResults).and.returnValue(seasonResults[3])
      .withArgs(-3, seasonResults).and.returnValue(seasonResults[4]);

    const expectedValue: Score = { userId: seasonBets[0].userId, points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };

    expect(service["calcSingleSeasonScore"](seasonBets, seasonResults)).toEqual(expectedValue);
  });

  it("calcSingleSeasonScore, bet array empty", () => {
    const seasonBets: SeasonBet[] = [];
    const seasonResults: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: 4
      },
      {
        documentId: "test_doc_id_11",
        season: 2020,
        place: 2,
        teamId: 5
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: 7
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: 8
      },
      {
        documentId: "test_doc_id_14",
        season: 2020,
        place: -3,
        teamId: 9
      }
    ];

    spyOn<any>(service, "getRelegatorResults").and.returnValue([seasonResults[2], seasonResults[3], seasonResults[4]]);
    spyOn<any>(service, "getSeasonResultFromArray")
      .withArgs(1, seasonResults).and.returnValue(seasonResults[0])
      .withArgs(2, seasonResults).and.returnValue(seasonResults[1])
      .withArgs(-1, seasonResults).and.returnValue(seasonResults[2])
      .withArgs(-2, seasonResults).and.returnValue(seasonResults[3])
      .withArgs(-3, seasonResults).and.returnValue(seasonResults[4]);

    const expectedValue: Score = { userId: "", points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };

    expect(service["calcSingleSeasonScore"](seasonBets, seasonResults)).toEqual(expectedValue);
  });

  it("calcSingleSeasonScore, season results empty", () => {
    const seasonBets: SeasonBet[] = [
      {
        documentId: "test_doc_id_0",
        season: 2020,
        userId: "test_user_id",
        isFixed: false,
        place: 1,
        teamId: -1
      },
      {
        documentId: "test_doc_id_1",
        season: 2020,
        userId: "test_user_id",
        isFixed: false,
        place: 2,
        teamId: -1
      },
      {
        documentId: "test_doc_id_2",
        season: 2020,
        userId: "test_user_id",
        isFixed: false,
        place: -1,
        teamId: -1
      },
      {
        documentId: "test_doc_id_3",
        season: 2020,
        userId: "test_user_id",
        isFixed: false,
        place: -2,
        teamId: -1
      },
      {
        documentId: "test_doc_id_4",
        season: 2020,
        userId: "test_user_id",
        isFixed: false,
        place: -3,
        teamId: -1
      }
    ];
    const seasonResults: SeasonResult[] = [];

    const dummyResults: SeasonResult[] = [
      {
        documentId: "",
        season: -1,
        place: 1,
        teamId: -1
      },
      {
        documentId: "",
        season: -1,
        place: 2,
        teamId: -1
      },
      {
        documentId: "",
        season: -1,
        place: -1,
        teamId: -1
      },
      {
        documentId: "",
        season: -1,
        place: -2,
        teamId: -1
      },
      {
        documentId: "",
        season: -1,
        place: -3,
        teamId: -1
      }
    ];

    spyOn<any>(service, "getRelegatorResults").and.returnValue([]);
    spyOn<any>(service, "getSeasonResultFromArray")
      .withArgs(1, seasonResults).and.returnValue(dummyResults[0])
      .withArgs(2, seasonResults).and.returnValue(dummyResults[1])
      .withArgs(-1, seasonResults).and.returnValue(dummyResults[2])
      .withArgs(-2, seasonResults).and.returnValue(dummyResults[3])
      .withArgs(-3, seasonResults).and.returnValue(dummyResults[4]);

    const expectedValue: Score = { userId: seasonBets[0].userId, points: 0, matches: 0, results: 0, extraTop: 0, extraOutsider: 0, extraSeason: 0 };

    expect(service["calcSingleSeasonScore"](seasonBets, seasonResults)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // getSeasonResultFromArray
  // ---------------------------------------------------------------------------

  it("getSeasonResultFromArray, result available", () => {
    const argument1: number = -1;

    const argument2: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: 25
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: 46
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: 6
      }
    ];

    const expectedValue: SeasonResult = argument2[1];
    expect(service["getSeasonResultFromArray"](argument1, argument2)).toEqual(expectedValue);
  });

  it("getSeasonResultFromArray, result not available", () => {
    const argument1: number = 2;

    const argument2: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: 25
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: 46
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: 6
      }
    ];

    const dummyResult: SeasonResult = { // dummy, if target not available
      documentId: "",
      season: -1,
      place: argument1,
      teamId: -1
    };

    const expectedValue: SeasonResult = dummyResult;
    expect(service["getSeasonResultFromArray"](argument1, argument2)).toEqual(expectedValue);
  });

  it("getSeasonResultFromArray, result array completely empty", () => {
    const argument1: number = 2;

    const argument2: SeasonResult[] = [];

    const dummyResult: SeasonResult = { // dummy, if target not available
      documentId: "",
      season: -1,
      place: argument1,
      teamId: -1
    };

    const expectedValue: SeasonResult = dummyResult;
    expect(service["getSeasonResultFromArray"](argument1, argument2)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // getRelegatorResults
  // ---------------------------------------------------------------------------

  it("getRelegatorResults, relegators available", () => {
    const argument: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: 25
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: -1,
        teamId: 46
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: -2,
        teamId: 6
      },
      {
        documentId: "test_doc_id_14",
        season: 2020,
        place: -3,
        teamId: 89
      }
    ];

    const expectedValue: SeasonResult[] = [
      argument[1],
      argument[2],
      argument[3],
    ];
    expect(service["getRelegatorResults"](argument)).toEqual(expectedValue);
  });

  it("getRelegatorResults, relegators not available", () => {
    const argument: SeasonResult[] = [
      {
        documentId: "test_doc_id_10",
        season: 2020,
        place: 1,
        teamId: 25
      },
      {
        documentId: "test_doc_id_12",
        season: 2020,
        place: 2,
        teamId: 46
      },
      {
        documentId: "test_doc_id_13",
        season: 2020,
        place: 3,
        teamId: 6
      }
    ];

    const expectedValue: SeasonResult[] = [];
    expect(service["getRelegatorResults"](argument)).toEqual(expectedValue);
  });

  it("getRelegatorResults, result array empty", () => {
    const argument: SeasonResult[] = [];
    const expectedValue: SeasonResult[] = [];
    expect(service["getRelegatorResults"](argument)).toEqual(expectedValue);
  });

});
