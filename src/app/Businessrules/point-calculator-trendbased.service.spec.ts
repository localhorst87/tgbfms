import { TestBed } from '@angular/core/testing';

import { PointCalculatorTrendbasedService } from './point-calculator-trendbased.service';
import { POINTS_TENDENCY, POINTS_ADDED_RESULT, FACTOR_TOP_MATCH, POINTS_ADDED_OUTSIDER_TWO, POINTS_ADDED_OUTSIDER_ONE } from './point-calculator-trendbased.service';
import { BetExtended, ResultExtended } from '../Dataaccess/database_datastructures';


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
  // getAddedResultPoints
  // ---------------------------------------------------------------------------

  it("getAddedResultPoints bet and result equal", () => {
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
    const expectedValue: number = POINTS_ADDED_RESULT;
    expect(service["getAddedResultPoints"](argument1, argument2)).toBe(expectedValue);
  });

  it("getAddedResultPoints bet and result not equal", () => {
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
    const expectedValue: number = 0;
    expect(service["getAddedResultPoints"](argument1, argument2)).toBe(expectedValue);
  });

  it("getAddedResultPoints Bet not set", () => {
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
    const expectedValue: number = 0;
    expect(service["getAddedResultPoints"](argument1, argument2)).toBe(expectedValue);
  });

  it("getAddedResultPoints Result not set", () => {
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
    const expectedValue: number = 0;
    expect(service["getAddedResultPoints"](argument1, argument2)).toBe(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // getTendencyPoints
  // ---------------------------------------------------------------------------

  it("getTendencyPoints tendency same", () => {
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
      goalsHome: 3,
      goalsAway: 1
    };
    spyOn<any>(service, "isAvailable").and.returnValue(true);
    spyOn<any>(service, "getTendency")
      .withArgs(argument1).and.returnValue(1)
      .withArgs(argument2).and.returnValue(1);
    const expectedValue: number = POINTS_TENDENCY;
    expect(service["getTendencyPoints"](argument1, argument2)).toBe(expectedValue);
  });

  it("getTendencyPoints tendency not equal", () => {
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
      goalsHome: 3,
      goalsAway: 1
    };
    spyOn<any>(service, "isAvailable").and.returnValue(true);
    spyOn<any>(service, "getTendency")
      .withArgs(argument1).and.returnValue(0)
      .withArgs(argument2).and.returnValue(1);
    const expectedValue: number = 0;
    expect(service["getTendencyPoints"](argument1, argument2)).toBe(expectedValue);
  });

  it("getTendencyPoints Bet not set", () => {
    const argument1: BetExtended = {
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id",
      isFixed: true,
      goalsHome: -1,
      goalsAway: 0
    };
    const argument2: ResultExtended = {
      documentId: "test_id",
      matchId: 1,
      goalsHome: 0,
      goalsAway: 1
    };
    spyOn<any>(service, "isAvailable")
      .withArgs(argument1).and.returnValue(false)
      .withArgs(argument2).and.returnValue(true);
    spyOn<any>(service, "getTendency")
      .withArgs(argument1).and.returnValue(-1)
      .withArgs(argument2).and.returnValue(2);
    const expectedValue: number = 0;
    expect(service["getTendencyPoints"](argument1, argument2)).toBe(expectedValue);
  });

  it("getTendencyPoints Result not set", () => {
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
    spyOn<any>(service, "getTendency")
      .withArgs(argument1).and.returnValue(0)
      .withArgs(argument2).and.returnValue(-1);
    const expectedValue: number = 0;
    expect(service["getTendencyPoints"](argument1, argument2)).toBe(expectedValue);
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
  // getAddedOutsiderPoints
  // ---------------------------------------------------------------------------

  it("getAddedOutsiderPoints, no extra points", () => {
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
    expect(service["getAddedOutsiderPoints"]([], argument)).toBe(expectedValue);
  });

  it("getAddedOutsiderPoints, no extra points", () => {
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
    expect(service["getAddedOutsiderPoints"]([], argument)).toBe(expectedValue);
  });

  it("getAddedOutsiderPoints, no extra points", () => {
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
    expect(service["getAddedOutsiderPoints"]([], argument)).toBe(expectedValue);
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
    let betArray: BetExtended[] = [];
    betArray.push(betUser);
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_2",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 0
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_3",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 2
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_4",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 2
    });
    spyOn<any>(service, "getTendencyPoints").withArgs(betUser, result).and.returnValue(0);
    spyOn<any>(service, "getAddedResultPoints").withArgs(betUser, result).and.returnValue(0);
    spyOn<any>(service, "getAddedOutsiderPoints").withArgs(betArray, betUser).and.returnValue(0);
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
    let betArray: BetExtended[] = [];
    betArray.push(betUser);
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_2",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 0
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_3",
      isFixed: true,
      goalsHome: 3,
      goalsAway: 2
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_4",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 2
    });
    spyOn<any>(service, "getTendencyPoints").withArgs(betUser, result).and.returnValue(POINTS_TENDENCY);
    spyOn<any>(service, "getAddedResultPoints").withArgs(betUser, result).and.returnValue(0);
    spyOn<any>(service, "getAddedOutsiderPoints").withArgs(betArray, betUser).and.returnValue(0);
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
    let betArray: BetExtended[] = [];
    betArray.push(betUser);
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_2",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 0
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_3",
      isFixed: true,
      goalsHome: 3,
      goalsAway: 2
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_4",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 2
    });
    spyOn<any>(service, "getTendencyPoints").withArgs(betUser, result).and.returnValue(POINTS_TENDENCY);
    spyOn<any>(service, "getAddedResultPoints").withArgs(betUser, result).and.returnValue(0);
    spyOn<any>(service, "getAddedOutsiderPoints").withArgs(betArray, betUser).and.returnValue(0);
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
    let betArray: BetExtended[] = [];
    betArray.push(betUser);
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_2",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 0
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_3",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 2
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_4",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 2
    });
    spyOn<any>(service, "getTendencyPoints").withArgs(betUser, result).and.returnValue(POINTS_TENDENCY);
    spyOn<any>(service, "getAddedResultPoints").withArgs(betUser, result).and.returnValue(0);
    spyOn<any>(service, "getAddedOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_TWO);
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
    let betArray: BetExtended[] = [];
    betArray.push(betUser);
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_2",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 3
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_3",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 2
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_4",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 2
    });
    spyOn<any>(service, "getTendencyPoints").withArgs(betUser, result).and.returnValue(POINTS_TENDENCY);
    spyOn<any>(service, "getAddedResultPoints").withArgs(betUser, result).and.returnValue(0);
    spyOn<any>(service, "getAddedOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
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
    let betArray: BetExtended[] = [];
    betArray.push(betUser);
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_2",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 3
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_3",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 2
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_4",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 2
    });
    spyOn<any>(service, "getTendencyPoints").withArgs(betUser, result).and.returnValue(POINTS_TENDENCY);
    spyOn<any>(service, "getAddedResultPoints").withArgs(betUser, result).and.returnValue(0);
    spyOn<any>(service, "getAddedOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
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
    let betArray: BetExtended[] = [];
    betArray.push(betUser);
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_2",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 3
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_3",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 2
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_4",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 2
    });
    spyOn<any>(service, "getTendencyPoints").withArgs(betUser, result).and.returnValue(POINTS_TENDENCY);
    spyOn<any>(service, "getAddedResultPoints").withArgs(betUser, result).and.returnValue(POINTS_ADDED_RESULT);
    spyOn<any>(service, "getAddedOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
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
    let betArray: BetExtended[] = [];
    betArray.push(betUser);
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_2",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_3",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 2
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_4",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 0
    });
    spyOn<any>(service, "getTendencyPoints").withArgs(betUser, result).and.returnValue(0);
    spyOn<any>(service, "getAddedResultPoints").withArgs(betUser, result).and.returnValue(0);
    spyOn<any>(service, "getAddedOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
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
    let betArray: BetExtended[] = [];
    betArray.push(betUser);
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_2",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_3",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 2
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_4",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 0
    });
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
    let betArray: BetExtended[] = [];
    betArray.push(betUser);
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_2",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_3",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 2
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_4",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 0
    });
    spyOn<any>(service, "getAddedOutsiderPoints").withArgs(betArray, betUser).and.returnValue(POINTS_ADDED_OUTSIDER_ONE);
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
    let betArray: BetExtended[] = [];
    betArray.push(betUser);
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_2",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_3",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 2
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_4",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 0
    });
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
    let betArray: BetExtended[] = [];
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_1",
      isFixed: true,
      goalsHome: 1,
      goalsAway: 0
    })
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_2",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_3",
      isFixed: true,
      goalsHome: 2,
      goalsAway: 2
    });
    betArray.push({
      documentId: "test_id",
      matchId: 1,
      userId: "test_user_id_4",
      isFixed: true,
      goalsHome: 0,
      goalsAway: 0
    });
    const expectedValue: number = 0;
    expect(service["getMatchPoints"](userId, betArray, result, isTop)).toBe(expectedValue);
  });
});
