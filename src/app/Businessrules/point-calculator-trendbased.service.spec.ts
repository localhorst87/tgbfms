import { TestBed } from '@angular/core/testing';

import { PointCalculatorTrendbasedService } from './point-calculator-trendbased.service';
import {
  POINTS_TENDENCY, POINTS_ADDED_RESULT, FACTOR_TOP_MATCH, POINTS_ADDED_OUTSIDER_TWO, POINTS_ADDED_OUTSIDER_ONE,
  POINTS_SEASON_FIRST_EXACT, POINTS_SEASON_SECOND_EXACT, POINTS_SEASON_LOSER_EXACT, POINTS_SEASON_LOSER_CORRECT
} from './point-calculator-trendbased.service';
import { BetExtended, ResultExtended, SeasonBetExtended, SeasonResultExtended } from './basic_datastructures';


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
    const argument: BetExtended = {
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
    const argument: ResultExtended = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 1,
      goalsAway: 0
    };
    expect(service["isAvailable"](argument)).toBeTrue();
  });

  it("isAvailable one goal not set, Bet", () => {
    const argument: BetExtended = {
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
    const argument: ResultExtended = {
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
    const argument: BetExtended = {
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
    const argument: BetExtended = {
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
    const argument: BetExtended = {
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
    const argument: BetExtended = {
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
    const argument: ResultExtended = {
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
    const argument: ResultExtended = {
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
    const argument: ResultExtended = {
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
    const argument: ResultExtended = {
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
    const argument1: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 3,
      goalsAway: 1
    };
    const argument2: ResultExtended = {
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
    const argument1: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 1
    };
    const argument2: ResultExtended = {
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
    const argument1: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: false,
      goalsHome: -1,
      goalsAway: -1
    };
    const argument2: ResultExtended = {
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
    const argument1: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: false,
      goalsHome: -1,
      goalsAway: -1
    };
    const argument2: ResultExtended = {
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
    const argument1: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 0
    };
    const argument2: ResultExtended = {
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
    const argument1: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 0
    };
    const argument2: ResultExtended = {
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
    const argument1: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: -1,
      goalsAway: -1
    };
    const argument2: ResultExtended = {
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
    const argument1: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 0
    };
    const argument2: ResultExtended = {
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
    let argument: BetExtended[] = [];
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
    let argument: BetExtended[] = [];
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
    const argument: BetExtended[] = [];
    const expectedValue: number[] = [0, 0, 0];
    expect(service["countTendencies"](argument)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // getPotentialOutsiderPoints
  // ---------------------------------------------------------------------------

  it("getPotentialOutsiderPoints, no extra points", () => {
    const argument: BetExtended = {
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
    const argument: BetExtended = {
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
    const argument: BetExtended = {
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
  // getMatchPoints
  // ---------------------------------------------------------------------------

  it("getMatchPoints, bet wrong, no top, no outsider", () => {
    const userId: string = "target_user";
    const result: ResultExtended = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const isTop: boolean = false;
    const betUser: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 1
    };
    const betArray: BetExtended[] = [
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
    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(0);
    const expectedValue: number = 0;
    expect(service["getMatchPoints"](userId, betArray, result, isTop)).toBe(expectedValue);
  });

  it("getMatchPoints, bet tendency right, no top, no outsider", () => {
    const userId: string = "target_user";
    const result: ResultExtended = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const isTop: boolean = false;
    const betUser: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 0
    };
    const betArray: BetExtended[] = [
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
    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(0);
    const expectedValue: number = POINTS_TENDENCY;
    expect(service["getMatchPoints"](userId, betArray, result, isTop)).toBe(expectedValue);
  });

  it("getMatchPoints, bet tendency right, top, no outsider", () => {
    const userId: string = "target_user";
    const result: ResultExtended = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const isTop: boolean = true;
    const betUser: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    };
    const betArray: BetExtended[] = [
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

    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(0);
    const expectedValue: number = FACTOR_TOP_MATCH * POINTS_TENDENCY;
    expect(service["getMatchPoints"](userId, betArray, result, isTop)).toBe(expectedValue);
  });

  it("getMatchPoints, bet tendency right, no top, two outsider", () => {
    const userId: string = "target_user";
    const result: ResultExtended = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const isTop: boolean = false;
    const betUser: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    };
    let betArray: BetExtended[] = [
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

    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_TWO);
    const expectedValue: number = POINTS_TENDENCY + POINTS_ADDED_OUTSIDER_TWO;
    expect(service["getMatchPoints"](userId, betArray, result, isTop)).toBe(expectedValue);
  });

  it("getMatchPoints, bet tendency right, no top, single outsider", () => {
    const userId: string = "target_user";
    const result: ResultExtended = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const isTop: boolean = false;
    const betUser: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    };
    const betArray: BetExtended[] = [
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
    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
    const expectedValue: number = POINTS_TENDENCY + POINTS_ADDED_OUTSIDER_ONE;
    expect(service["getMatchPoints"](userId, betArray, result, isTop)).toBe(expectedValue);
  });

  it("getMatchPoints, bet tendency right, top, single outsider", () => {
    const userId: string = "target_user";
    const result: ResultExtended = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const isTop: boolean = true;
    const betUser: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    };
    const betArray: BetExtended[] = [
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

    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
    const expectedValue: number = FACTOR_TOP_MATCH * POINTS_TENDENCY + POINTS_ADDED_OUTSIDER_ONE;
    expect(service["getMatchPoints"](userId, betArray, result, isTop)).toBe(expectedValue);
  });

  it("getMatchPoints, bet result right, top, single outsider", () => {
    const userId: string = "target_user";
    const result: ResultExtended = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const isTop: boolean = true;
    const betUser: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 3,
      goalsAway: 1
    };
    const betArray: BetExtended[] = [
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
    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(true);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
    const expectedValue: number = FACTOR_TOP_MATCH * (POINTS_TENDENCY + POINTS_ADDED_RESULT) + POINTS_ADDED_OUTSIDER_ONE;
    expect(service["getMatchPoints"](userId, betArray, result, isTop)).toBe(expectedValue);
  });

  it("getMatchPoints, bet wrong, top, single outsider", () => {
    const userId: string = "target_user";
    const result: ResultExtended = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const isTop: boolean = true;
    const betUser: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 1
    };
    const betArray: BetExtended[] = [
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

    spyOn<any>(service, "isTendencyCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "isResultCorrect").withArgs(betUser, result).and.returnValue(false);
    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
    const expectedValue: number = 0;
    expect(service["getMatchPoints"](userId, betArray, result, isTop)).toBe(expectedValue);
  });

  it("getMatchPoints, no goals set in target bet, top", () => {
    const userId: string = "target_user";
    const result: ResultExtended = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const isTop: boolean = true;
    const betUser: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: -1,
      goalsAway: -1
    };
    const betArray: BetExtended[] = [
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

    const expectedValue: number = 0;
    expect(service["getMatchPoints"](userId, betArray, result, isTop)).toBe(expectedValue);
  });

  it("getMatchPoints, no goals set in result, top, single outsider", () => {
    const userId: string = "target_user";
    const result: ResultExtended = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: -1,
      goalsAway: -1
    };
    const isTop: boolean = true;
    const betUser: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 0
    };
    const betArray: BetExtended[] = [
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

    spyOn<any>(service, "getPotentialOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
    const expectedValue: number = 0;
    expect(service["getMatchPoints"](userId, betArray, result, isTop)).toBe(expectedValue);
  });

  it("getMatchPoints, no goals set in target bet, no goals set in result", () => {
    const userId: string = "target_user";
    const result: ResultExtended = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: -1,
      goalsAway: -1
    };
    const isTop: boolean = false;
    const betUser: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "target_user",
      isFixed: true,
      goalsHome: -1,
      goalsAway: -1
    };
    const betArray: BetExtended[] = [
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

    const expectedValue: number = 0;
    expect(service["getMatchPoints"](userId, betArray, result, isTop)).toBe(expectedValue);
  });

  it("getMatchPoints, user bet not in array, top, single outsider", () => {
    const userId: string = "target_user";
    const result: ResultExtended = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 3,
      goalsAway: 1
    };
    const isTop: boolean = true;
    let betArray: BetExtended[] = [
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
    const expectedValue: number = 0;
    expect(service["getMatchPoints"](userId, betArray, result, isTop)).toBe(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // getSeasonPoints
  // ---------------------------------------------------------------------------

  it("getSeasonPoints, only champion correct", () => {
    const seasonBets: SeasonBetExtended[] = [
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

    const seasonResults: SeasonResultExtended[] = [
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

    const expectedValue: number = POINTS_SEASON_FIRST_EXACT;
    expect(service["getSeasonPoints"](seasonBets, seasonResults)).toBe(expectedValue);
  });

  it("getSeasonPoints, only second correct", () => {
    const seasonBets: SeasonBetExtended[] = [
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

    const seasonResults: SeasonResultExtended[] = [
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

    const expectedValue: number = POINTS_SEASON_SECOND_EXACT;
    expect(service["getSeasonPoints"](seasonBets, seasonResults)).toBe(expectedValue);
  });

  it("getSeasonPoints, champ and second correct", () => {
    const seasonBets: SeasonBetExtended[] = [
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

    const seasonResults: SeasonResultExtended[] = [
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

    const expectedValue: number = POINTS_SEASON_FIRST_EXACT + POINTS_SEASON_SECOND_EXACT;
    expect(service["getSeasonPoints"](seasonBets, seasonResults)).toBe(expectedValue);
  });

  it("getSeasonPoints, one relegator exactly correct", () => {
    const seasonBets: SeasonBetExtended[] = [
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

    const seasonResults: SeasonResultExtended[] = [
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

    const expectedValue: number = POINTS_SEASON_LOSER_EXACT;
    expect(service["getSeasonPoints"](seasonBets, seasonResults)).toBe(expectedValue);
  });

  it("getSeasonPoints, one relegator exactly correct, another one correct", () => {
    const seasonBets: SeasonBetExtended[] = [
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

    const seasonResults: SeasonResultExtended[] = [
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

    const expectedValue: number = POINTS_SEASON_LOSER_EXACT + POINTS_SEASON_LOSER_CORRECT;
    expect(service["getSeasonPoints"](seasonBets, seasonResults)).toBe(expectedValue);
  });

  it("getSeasonPoints, all places correct", () => {
    const seasonBets: SeasonBetExtended[] = [
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

    const seasonResults: SeasonResultExtended[] = [
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

    const expectedValue: number = POINTS_SEASON_FIRST_EXACT + POINTS_SEASON_SECOND_EXACT + 3 * POINTS_SEASON_LOSER_EXACT;
    expect(service["getSeasonPoints"](seasonBets, seasonResults)).toBe(expectedValue);
  });

  it("getSeasonPoints, all places wrong", () => {
    const seasonBets: SeasonBetExtended[] = [
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

    const seasonResults: SeasonResultExtended[] = [
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

    const expectedValue: number = 0;
    expect(service["getSeasonPoints"](seasonBets, seasonResults)).toBe(expectedValue);
  });

  it("getSeasonPoints, bets not filled", () => {
    const seasonBets: SeasonBetExtended[] = [
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

    const seasonResults: SeasonResultExtended[] = [
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

    const expectedValue: number = 0;
    expect(service["getSeasonPoints"](seasonBets, seasonResults)).toBe(expectedValue);
  });

  it("getSeasonPoints, results not filled", () => {
    const seasonBets: SeasonBetExtended[] = [
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

    const seasonResults: SeasonResultExtended[] = [
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

    const expectedValue: number = 0;
    expect(service["getSeasonPoints"](seasonBets, seasonResults)).toBe(expectedValue);
  });

  it("getSeasonPoints, bets and results not filled", () => {
    const seasonBets: SeasonBetExtended[] = [
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

    const seasonResults: SeasonResultExtended[] = [
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

    const expectedValue: number = 0;
    expect(service["getSeasonPoints"](seasonBets, seasonResults)).toBe(expectedValue);
  });

  it("getSeasonPoints, bet array empty", () => {
    const seasonBets: SeasonBetExtended[] = [];
    const seasonResults: SeasonResultExtended[] = [
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

    const expectedValue: number = 0;
    expect(service["getSeasonPoints"](seasonBets, seasonResults)).toBe(expectedValue);
  });

  it("getSeasonPoints, season results empty", () => {
    const seasonBets: SeasonBetExtended[] = [
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
    const seasonResults: SeasonResultExtended[] = [];

    const dummyResults: SeasonResultExtended[] = [
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

    const expectedValue: number = 0;
    expect(service["getSeasonPoints"](seasonBets, seasonResults)).toBe(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // getSeasonResultFromArray
  // ---------------------------------------------------------------------------

  it("getSeasonResultFromArray, result available", () => {
    const argument1: number = -1;

    const argument2: SeasonResultExtended[] = [
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

    const expectedValue: SeasonResultExtended = argument2[1];
    expect(service["getSeasonResultFromArray"](argument1, argument2)).toEqual(expectedValue);
  });

  it("getSeasonResultFromArray, result not available", () => {
    const argument1: number = 2;

    const argument2: SeasonResultExtended[] = [
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

    const dummyResult: SeasonResultExtended = { // dummy, if target not available
      documentId: "",
      season: -1,
      place: argument1,
      teamId: -1
    };

    const expectedValue: SeasonResultExtended = dummyResult;
    expect(service["getSeasonResultFromArray"](argument1, argument2)).toEqual(expectedValue);
  });

  it("getSeasonResultFromArray, result array completely empty", () => {
    const argument1: number = 2;

    const argument2: SeasonResultExtended[] = [];

    const dummyResult: SeasonResultExtended = { // dummy, if target not available
      documentId: "",
      season: -1,
      place: argument1,
      teamId: -1
    };

    const expectedValue: SeasonResultExtended = dummyResult;
    expect(service["getSeasonResultFromArray"](argument1, argument2)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // getRelegatorResults
  // ---------------------------------------------------------------------------

  it("getRelegatorResults, relegators available", () => {
    const argument: SeasonResultExtended[] = [
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

    const expectedValue: SeasonResultExtended[] = [
      argument[1],
      argument[2],
      argument[3],
    ];
    expect(service["getRelegatorResults"](argument)).toEqual(expectedValue);
  });

  it("getRelegatorResults, relegators not available", () => {
    const argument: SeasonResultExtended[] = [
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

    const expectedValue: SeasonResultExtended[] = [];
    expect(service["getRelegatorResults"](argument)).toEqual(expectedValue);
  });

  it("getRelegatorResults, result array empty", () => {
    const argument: SeasonResultExtended[] = [];
    const expectedValue: SeasonResultExtended[] = [];
    expect(service["getRelegatorResults"](argument)).toEqual(expectedValue);
  });

});
