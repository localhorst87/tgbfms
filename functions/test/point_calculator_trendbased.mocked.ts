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

describe('instanciating', () => {
  it('object is created', () => {
    let instance = new PointCalculatorTrendbased('test_user_id');

    expect(instance).to.be.ok;
  });

  it('score is initialized', () => {
    let instance = new PointCalculatorTrendbased('test_user_id');

    expect(instance.score).to.deep.equal({
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

    expect(instance.score).to.deep.equal(expectedValue);
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

    expect(instance.score).to.deep.equal(expectedValue);
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

    expect(instance.score).to.deep.equal(expectedValue);
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

    expect(instance.score).to.deep.equal(expectedValue);
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

    expect(instance.score).to.deep.equal(expectedValue);
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

    expect(instance.score).to.deep.equal(expectedValue);
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

    expect(instance.score).to.deep.equal(expectedValue);
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

    expect(instance.score).to.deep.equal(expectedValue);
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

    expect(instance.score).to.deep.equal(expectedValue);
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

    expect(instance.score).to.deep.equal(expectedValue);
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

    expect(instance.score).to.deep.equal(expectedValue);
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

    expect(instance.score).to.deep.equal(expectedValue);
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

    expect(instance.score).to.deep.equal(expectedValue);
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
    instance.score = {
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

    expect(instance.score).to.deep.equal(expectedValue);
  });
});
