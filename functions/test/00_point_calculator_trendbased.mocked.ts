import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  Match,
  Bet,
  Score,
} from '../../src/app/Businessrules/basic_datastructures';
import { PointCalculatorTrendbased } from '../src/business_rules/point_calculator_trendbased';
import {
  POINTS_TENDENCY,
  POINTS_ADDED_RESULT,
  FACTOR_TOP_MATCH,
  POINTS_ADDED_OUTSIDER_TWO,
  POINTS_ADDED_OUTSIDER_ONE,
} from '../../src/app/Businessrules/rule_defined_values';
import { SeasonBet, SeasonResult } from '../src/business_rules/basic_datastructures';

describe('instanciating', () => {
  it('object is created', () => {
    let instance = new PointCalculatorTrendbased('test_user_id');

    expect(instance).to.be.ok;
  });

  it('score is initialized', () => {
    let instance = new PointCalculatorTrendbased('test_user_id');

    expect(instance["score"]).to.deep.equal({
      userId: 'test_user_id',
      points: 0,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 0,
    });
  });
});

describe('addSingleMatchScore', () => {
  it('bet wrong, no top, no outsider => expect 0 points', () => {
    const userId: string = 'target_user';

    const betUser: Bet = {
      documentId: 'test_id',
      matchId: 1,
      userId: 'target_user',
      isFixed: true,
      goalsHome: 0,
      goalsAway: 1,
    };

    const betArray: Bet[] = [
      betUser,
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_2',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 0,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_3',
        isFixed: true,
        goalsHome: 1,
        goalsAway: 2,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_4',
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2,
      },
    ];

    const match: Match = {
      documentId: 'test_id',
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: false,
      teamIdHome: 12,
      teamIdAway: 123,
      goalsHome: 3,
      goalsAway: 1,
    };

    const expectedValue: Score = {
      userId: userId,
      points: 0,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 0,
    };

    let instance = new PointCalculatorTrendbased(userId);
    instance.addSingleMatchScore(betArray, match);

    expect(instance["score"]).to.deep.equal(expectedValue);
  });

  it('bet tendency right, no top, no outsider => expect 1 point', () => {
    const userId: string = 'target_user';

    const betUser: Bet = {
      documentId: 'test_id',
      matchId: 1,
      userId: 'target_user',
      isFixed: true,
      goalsHome: 1,
      goalsAway: 0,
    };

    const betArray: Bet[] = [
      betUser,
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_2',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 0,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_3',
        isFixed: true,
        goalsHome: 3,
        goalsAway: 2,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_4',
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2,
      },
    ];

    const match: Match = {
      documentId: 'test_id',
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: false,
      teamIdHome: 12,
      teamIdAway: 123,
      goalsHome: 3,
      goalsAway: 1,
    };

    const expectedValue: Score = {
      userId: userId,
      points: POINTS_TENDENCY,
      matches: 1,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 0,
    };

    let instance = new PointCalculatorTrendbased(userId);
    instance.addSingleMatchScore(betArray, match);

    expect(instance["score"]).to.deep.equal(expectedValue);
  });

  it('bet tendency right, top, no outsider => expect 2 points', () => {
    const userId: string = 'target_user';

    const betUser: Bet = {
      documentId: 'test_id',
      matchId: 1,
      userId: 'target_user',
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1,
    };
    const betArray: Bet[] = [
      betUser,
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_2',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 0,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_3',
        isFixed: true,
        goalsHome: 3,
        goalsAway: 2,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_4',
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2,
      },
    ];

    const match: Match = {
      documentId: 'test_id',
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123,
      goalsHome: 3,
      goalsAway: 1,
    };

    const expectedValue: Score = {
      userId: userId,
      points: FACTOR_TOP_MATCH * POINTS_TENDENCY,
      matches: 1,
      results: 0,
      extraTop: (FACTOR_TOP_MATCH - 1) * POINTS_TENDENCY,
      extraOutsider: 0,
      extraSeason: 0,
    };

    let instance = new PointCalculatorTrendbased(userId);
    instance.addSingleMatchScore(betArray, match);

    expect(instance["score"]).to.deep.equal(expectedValue);
  });

  it('bet tendency right, no top, two outsider => expect 2 points', () => {
    const userId: string = 'target_user';

    const betUser: Bet = {
      documentId: 'test_id',
      matchId: 1,
      userId: 'target_user',
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1,
    };

    let betArray: Bet[] = [
      betUser,
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_2',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 0,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_3',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_4',
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2,
      },
    ];

    const match: Match = {
      documentId: 'test_id',
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: false,
      teamIdHome: 12,
      teamIdAway: 123,
      goalsHome: 3,
      goalsAway: 1,
    };

    const expectedValue: Score = {
      userId: userId,
      points: POINTS_TENDENCY + POINTS_ADDED_OUTSIDER_TWO,
      matches: 1,
      results: 0,
      extraTop: 0,
      extraOutsider: POINTS_ADDED_OUTSIDER_TWO,
      extraSeason: 0,
    };

    let instance = new PointCalculatorTrendbased(userId);
    instance.addSingleMatchScore(betArray, match);

    expect(instance["score"]).to.deep.equal(expectedValue);
  });

  it('bet tendency right, no top, single outsider => expect 3 points', () => {
    const userId: string = 'target_user';

    const betUser: Bet = {
      documentId: 'test_id',
      matchId: 1,
      userId: 'target_user',
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1,
    };

    const betArray: Bet[] = [
      betUser,
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_2',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 3,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_3',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_4',
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2,
      },
    ];

    const match: Match = {
      documentId: 'test_id',
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: false,
      teamIdHome: 12,
      teamIdAway: 123,
      goalsHome: 3,
      goalsAway: 1,
    };

    const expectedValue: Score = {
      userId: userId,
      points: POINTS_TENDENCY + POINTS_ADDED_OUTSIDER_ONE,
      matches: 1,
      results: 0,
      extraTop: 0,
      extraOutsider: POINTS_ADDED_OUTSIDER_ONE,
      extraSeason: 0,
    };

    let instance = new PointCalculatorTrendbased(userId);
    instance.addSingleMatchScore(betArray, match);

    expect(instance["score"]).to.deep.equal(expectedValue);
  });

  it('bet tendency right, top, single outsider => expect 4 points', () => {
    const userId: string = 'target_user';

    const betUser: Bet = {
      documentId: 'test_id',
      matchId: 1,
      userId: 'target_user',
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1,
    };

    const betArray: Bet[] = [
      betUser,
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_2',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 3,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_3',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_4',
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2,
      },
    ];
    const match: Match = {
      documentId: 'test_id',
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123,
      goalsHome: 3,
      goalsAway: 1,
    };

    const expectedValue: Score = {
      userId: userId,
      points: FACTOR_TOP_MATCH * POINTS_TENDENCY + POINTS_ADDED_OUTSIDER_ONE,
      matches: 1,
      results: 0,
      extraTop: (FACTOR_TOP_MATCH - 1) * POINTS_TENDENCY,
      extraOutsider: POINTS_ADDED_OUTSIDER_ONE,
      extraSeason: 0,
    };

    let instance = new PointCalculatorTrendbased(userId);
    instance.addSingleMatchScore(betArray, match);

    expect(instance["score"]).to.deep.equal(expectedValue);
  });

  it('bet result right, top, single outsider => expect 5 points', () => {
    const userId: string = 'target_user';

    const betUser: Bet = {
      documentId: 'test_id',
      matchId: 1,
      userId: 'target_user',
      isFixed: true,
      goalsHome: 3,
      goalsAway: 1,
    };

    const betArray: Bet[] = [
      betUser,
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_2',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 3,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_3',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_4',
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2,
      },
    ];

    const match: Match = {
      documentId: 'test_id',
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123,
      goalsHome: 3,
      goalsAway: 1,
    };

    const expectedValue: Score = {
      userId: userId,
      points:
        FACTOR_TOP_MATCH * (POINTS_TENDENCY + POINTS_ADDED_RESULT) +
        POINTS_ADDED_OUTSIDER_ONE,
      matches: 1,
      results: 1,
      extraTop:
        (FACTOR_TOP_MATCH - 1) * (POINTS_TENDENCY + POINTS_ADDED_RESULT),
      extraOutsider: POINTS_ADDED_OUTSIDER_ONE,
      extraSeason: 0,
    };

    let instance = new PointCalculatorTrendbased(userId);
    instance.addSingleMatchScore(betArray, match);

    expect(instance["score"]).to.deep.equal(expectedValue);
  });

  it('bet wrong, top, single outsider => expect 0 points', () => {
    const userId: string = 'target_user';

    const betUser: Bet = {
      documentId: 'test_id',
      matchId: 1,
      userId: 'target_user',
      isFixed: true,
      goalsHome: 0,
      goalsAway: 1,
    };

    const betArray: Bet[] = [
      betUser,
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_2',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 1,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_3',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_4',
        isFixed: true,
        goalsHome: 0,
        goalsAway: 0,
      },
    ];

    const match: Match = {
      documentId: 'test_id',
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123,
      goalsHome: 3,
      goalsAway: 1,
    };

    const expectedValue: Score = {
      userId: userId,
      points: 0,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 0,
    };

    let instance = new PointCalculatorTrendbased(userId);
    instance.addSingleMatchScore(betArray, match);

    expect(instance["score"]).to.deep.equal(expectedValue);
  });

  it('no goals set in target bet, top => expect 0 points', () => {
    const userId: string = 'target_user';

    const betUser: Bet = {
      documentId: 'test_id',
      matchId: 1,
      userId: 'target_user',
      isFixed: true,
      goalsHome: -1,
      goalsAway: -1,
    };

    const betArray: Bet[] = [
      betUser,
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_2',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 1,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_3',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_4',
        isFixed: true,
        goalsHome: 0,
        goalsAway: 0,
      },
    ];

    const match: Match = {
      documentId: 'test_id',
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123,
      goalsHome: 3,
      goalsAway: 1,
    };

    const expectedValue: Score = {
      userId: userId,
      points: 0,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 0,
    };

    let instance = new PointCalculatorTrendbased(userId);
    instance.addSingleMatchScore(betArray, match);

    expect(instance["score"]).to.deep.equal(expectedValue);
  });

  it('no goals set in result, top, single outsider => expect 0 points', () => {
    const userId: string = 'target_user';

    const betUser: Bet = {
      documentId: 'test_id',
      matchId: 1,
      userId: 'target_user',
      isFixed: true,
      goalsHome: 0,
      goalsAway: 0,
    };

    const betArray: Bet[] = [
      betUser,
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_2',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 1,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_3',
        isFixed: true,
        goalsHome: 1,
        goalsAway: 2,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_4',
        isFixed: true,
        goalsHome: 1,
        goalsAway: 0,
      },
    ];

    const match: Match = {
      documentId: 'test_id',
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123,
      goalsHome: -1,
      goalsAway: -1,
    };

    const expectedValue: Score = {
      userId: userId,
      points: 0,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 0,
    };

    let instance = new PointCalculatorTrendbased(userId);
    instance.addSingleMatchScore(betArray, match);

    expect(instance["score"]).to.deep.equal(expectedValue);
  });

  it('no goals set in target bet, no goals set in result => expect 0 points', () => {
    const userId: string = 'target_user';

    const betUser: Bet = {
      documentId: 'test_id',
      matchId: 1,
      userId: 'target_user',
      isFixed: true,
      goalsHome: -1,
      goalsAway: -1,
    };

    const betArray: Bet[] = [
      betUser,
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_2',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 1,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_3',
        isFixed: true,
        goalsHome: 1,
        goalsAway: 2,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_4',
        isFixed: true,
        goalsHome: 1,
        goalsAway: 0,
      },
    ];

    const match: Match = {
      documentId: 'test_id',
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: false,
      teamIdHome: 12,
      teamIdAway: 123,
      goalsHome: -1,
      goalsAway: -1,
    };

    const expectedValue: Score = {
      userId: userId,
      points: 0,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 0,
    };

    let instance = new PointCalculatorTrendbased(userId);
    instance.addSingleMatchScore(betArray, match);

    expect(instance["score"]).to.deep.equal(expectedValue);
  });

  it('user bet not in array, top, single outsider => expect 0 points', () => {
    const userId: string = 'target_user';

    let betArray: Bet[] = [
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_1',
        isFixed: true,
        goalsHome: 1,
        goalsAway: 0,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_2',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 1,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_3',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_4',
        isFixed: true,
        goalsHome: 0,
        goalsAway: 0,
      },
    ];

    const match: Match = {
      documentId: 'test_id',
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123,
      goalsHome: 3,
      goalsAway: 1,
    };

    const expectedValue: Score = {
      userId: userId,
      points: 0,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 0,
    };

    let instance = new PointCalculatorTrendbased(userId);
    instance.addSingleMatchScore(betArray, match);

    expect(instance["score"]).to.deep.equal(expectedValue);
  });

  it('matchIds of match and others do not correspond => expect 0 points', () => {
    const userId: string = 'target_user';

    const betUser: Bet = {
      documentId: 'test_id',
      matchId: 1,
      userId: 'target_user',
      isFixed: true,
      goalsHome: 2,
      goalsAway: 1,
    };

    const betArray: Bet[] = [
      betUser,
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_2',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 3,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_3',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_4',
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2,
      },
    ];

    const match: Match = {
      documentId: 'test_id',
      season: 2020,
      matchday: 4,
      matchId: 99,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123,
      goalsHome: 3,
      goalsAway: 1,
    };

    const expectedValue: Score = {
      userId: userId,
      points: 0,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 0,
    };

    let instance = new PointCalculatorTrendbased(userId);
    instance.addSingleMatchScore(betArray, match);

    expect(instance["score"]).to.deep.equal(expectedValue);
  });

  it('offset given => expect to add the single score', () => {
    const userId: string = 'target_user';

    const betUser: Bet = {
      documentId: 'test_id',
      matchId: 1,
      userId: 'target_user',
      isFixed: true,
      goalsHome: 3,
      goalsAway: 1,
    };

    const betArray: Bet[] = [
      betUser,
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_2',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 3,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_3',
        isFixed: true,
        goalsHome: 2,
        goalsAway: 2,
      },
      {
        documentId: 'test_id',
        matchId: 1,
        userId: 'test_user_id_4',
        isFixed: true,
        goalsHome: 0,
        goalsAway: 2,
      },
    ];

    const match: Match = {
      documentId: 'test_id',
      season: 2020,
      matchday: 4,
      matchId: 1,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 12,
      teamIdAway: 123,
      goalsHome: 3,
      goalsAway: 1,
    };

    let instance = new PointCalculatorTrendbased(userId);

    // set offset
    instance["score"] = {
      userId: userId,
      points: 16,
      matches: 7,
      results: 2,
      extraTop: 4,
      extraOutsider: 2,
      extraSeason: 1,
    };

    const expectedValue: Score = {
      userId: userId,
      points:
        16 +
        FACTOR_TOP_MATCH * (POINTS_TENDENCY + POINTS_ADDED_RESULT) +
        POINTS_ADDED_OUTSIDER_ONE,
      matches: 7 + 1,
      results: 2 + 1,
      extraTop: 4 + (FACTOR_TOP_MATCH - 1) * (POINTS_TENDENCY + POINTS_ADDED_RESULT),
      extraOutsider: 2 + POINTS_ADDED_OUTSIDER_ONE,
      extraSeason: 1,
    };

    instance.addSingleMatchScore(betArray, match);

    expect(instance["score"]).to.deep.equal(expectedValue);
  });
});

describe('addSeasonScore', () => {

  const seasonResults: SeasonResult[] = [
    {
        documentId: "result_1",
        season: 2099,
        place: 1,
        teamId: 10
    },
    {
        documentId: "result_2",
        season: 2099,
        place: 2,
        teamId: 20
    },
    {
        documentId: "result_16",
        season: 2099,
        place: -3,
        teamId: 160
    },
    {
        documentId: "result_17",
        season: 2099,
        place: -2,
        teamId: 170
    },
    {
        documentId: "result_18",
        season: 2099,
        place: -1,
        teamId: 180
    },
  ];

  it('all bets correct => expect 11 points', () => {
    const seasonBets: SeasonBet[] = [
      {
          documentId: "p1",
          season: 2099,
          userId: "user_1",
          isFixed: true,
          place: 1,
          teamId: 10
      },
      {
          documentId: "p2",
          season: 2099,
          userId: "user_1",
          isFixed: true,
          place: 2,
          teamId: 20
      },
      {
          documentId: "p16",
          season: 2099,
          userId: "user_1",
          isFixed: true,
          place: -3,
          teamId: 160
      },
      {
          documentId: "p17",
          season: 2099,
          userId: "user_1",
          isFixed: true,
          place: -2,
          teamId: 170
      },
      {
          documentId: "p18",
          season: 2099,
          userId: "user_1",
          isFixed: true,
          place: -1,
          teamId: 180
      }
    ];

    let pointCalc = new PointCalculatorTrendbased("user_1");
    pointCalc.addSeasonScore(seasonBets, seasonResults);

    expect(pointCalc["seasonScore"]).to.deep.equal({
      userId: "user_1",
      points: 11,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 11
    });
  });

  it('no bets given => expect 0 points', () => {
    let pointCalc = new PointCalculatorTrendbased("user_1");
    pointCalc.addSeasonScore([], seasonResults);

    expect(pointCalc["seasonScore"]).to.deep.equal({
      userId: "user_1",
      points: 0,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 0
    });
  });

  it('all relegators correct but not exactly => expect 1 point per relegator', () => {
    const seasonBets: SeasonBet[] = [
      {
          documentId: "p16",
          season: 2099,
          userId: "user_1",
          isFixed: true,
          place: -3,
          teamId: 180
      },
      {
          documentId: "p17",
          season: 2099,
          userId: "user_1",
          isFixed: true,
          place: -2,
          teamId: 160
      },
      {
          documentId: "p18",
          season: 2099,
          userId: "user_1",
          isFixed: true,
          place: -1,
          teamId: 170
      }
    ];

    let pointCalc = new PointCalculatorTrendbased("user_1");
    pointCalc.addSeasonScore(seasonBets, seasonResults);

    expect(pointCalc["seasonScore"]).to.deep.equal({
      userId: "user_1",
      points: 3,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 3
    });
  });

  it('one relegator given in bets which is correct, but not exact => expect 1 point', () => {
    const seasonBets: SeasonBet[] = [
      {
          documentId: "p16",
          season: 2099,
          userId: "user_1",
          isFixed: true,
          place: -3,
          teamId: 180
      }
    ];

    let pointCalc = new PointCalculatorTrendbased("user_1");
    pointCalc.addSeasonScore(seasonBets, seasonResults);

    expect(pointCalc["seasonScore"]).to.deep.equal({
      userId: "user_1",
      points: 1,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 1
    });
  });

  it('place 16 given in bets and place 18 in results (same team) => expect 1 point', () => {
    const seasonBets: SeasonBet[] = [
      {
          documentId: "p16",
          season: 2099,
          userId: "user_1",
          isFixed: true,
          place: -3,
          teamId: 180
      }
    ];

    const seasonResultsReduced: SeasonResult[] = [
      {
        documentId: "result_18",
        season: 2099,
        place: -1,
        teamId: 180
      }
    ];

    let pointCalc = new PointCalculatorTrendbased("user_1");
    pointCalc.addSeasonScore(seasonBets, seasonResultsReduced);

    expect(pointCalc["seasonScore"]).to.deep.equal({
      userId: "user_1",
      points: 1,
      matches: 0,
      results: 0,
      extraTop: 0,
      extraOutsider: 0,
      extraSeason: 1
    });
  });
  
});

describe('addScore', () => {

  it('no scores set so far => expect scores to equal added scores', () => {
    const scoreToAdd: Score = {
      userId: "user_1",
      points: 10,
      matches: 6,
      results: 1,
      extraTop: 2,
      extraOutsider: 1,
      extraSeason: 0
    };

    let pointCalc = new PointCalculatorTrendbased("user_1");

    pointCalc.addScore(scoreToAdd);

    expect(pointCalc["score"]).to.deep.equal(scoreToAdd);    
  });

  it('scores already set => expect scores to equal scores plus added score', () => {
    const scoreToAdd: Score = {
      userId: "user_1",
      points: 10,
      matches: 6,
      results: 1,
      extraTop: 2,
      extraOutsider: 1,
      extraSeason: 0
    };

    let pointCalc = new PointCalculatorTrendbased("user_1");
    pointCalc["score"] = {
      userId: "user_1",
      points: 5,
      matches: 3,
      results: 0,
      extraTop: 1,
      extraOutsider: 0,
      extraSeason: 1
    }

    pointCalc.addScore(scoreToAdd);

    expect(pointCalc["score"]).to.deep.equal({
      userId: "user_1",
      points: 15,
      matches: 9,
      results: 1,
      extraTop: 3,
      extraOutsider: 1,
      extraSeason: 1
    });    
  });
  
});