import { TestBed } from '@angular/core/testing';

import { of, from } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';
import { FetchBetWriteDataService } from './fetch-bet-write-data.service';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { Bet, Match, Result, BetExtended, MatchExtended, ResultExtended } from '../Businessrules/basic_datastructures';
import { BetWriteData } from './output_datastructures';

describe('FetchBetWriteDataService', () => {
  let service: FetchBetWriteDataService;
  let appDataSpy: jasmine.SpyObj<AppdataAccessService>;
  let bets: BetExtended[];
  let matches: MatchExtended[];
  let expectedValues: BetWriteData[];
  let defaultValue: BetWriteData;

  beforeEach(() => {
    appDataSpy = jasmine.createSpyObj(["getTeamNameByTeamId$", "getBet$", "getNextMatchesByTime$", "getMatchesByMatchday$"]);

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

    expectedValues = [
      {
        matchId: matches[0].matchId,
        matchTimestamp: matches[0].timestamp,
        isTopMatch: matches[0].isTopMatch,
        teamNameHome: "home_team_name_0",
        teamNameAway: "away_team_name_0",
        betGoalsHome: bets[0].goalsHome,
        betGoalsAway: bets[0].goalsAway,
        isBetFixed: bets[0].isFixed,
        betDocumentId: bets[0].documentId
      },
      {
        matchId: matches[1].matchId,
        matchTimestamp: matches[1].timestamp,
        isTopMatch: matches[1].isTopMatch,
        teamNameHome: "home_team_name_1",
        teamNameAway: "away_team_name_1",
        betGoalsHome: bets[1].goalsHome,
        betGoalsAway: bets[1].goalsAway,
        isBetFixed: bets[1].isFixed,
        betDocumentId: bets[1].documentId
      }
    ];
    defaultValue = {
      matchId: -1,
      matchTimestamp: -1,
      isTopMatch: false,
      teamNameHome: "",
      teamNameAway: "",
      betGoalsHome: -1,
      betGoalsAway: -1,
      isBetFixed: false,
      betDocumentId: ""
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // fetchDataByMatchday$
  // ---------------------------------------------------------------------------

  it('fetchDataByMatchday$, matches available', (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 28;
    const argument3: string = "test_user_id";

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
  // makeBetWriteData$
  // ---------------------------------------------------------------------------

  it('makeBetWriteData$, all services emitting', (done: DoneFn) => {
    const argument1: MatchExtended = matches[0];
    const argument2: string = "test_user_id";

    appDataSpy.getTeamNameByTeamId$
      .withArgs(matches[0].teamIdHome).and.returnValue(of(expectedValues[0].teamNameHome))
      .withArgs(matches[0].teamIdAway).and.returnValue(of(expectedValues[0].teamNameAway));

    appDataSpy.getBet$.and.returnValue(of(bets[0]));

    service["makeBetWriteData$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[0]);
        done();
      }
    );
  });

  it('makeBetWriteData$, one data service not emitting', (done: DoneFn) => {
    const argument1: MatchExtended = matches[0];
    const argument2: string = "test_user_id";

    appDataSpy.getTeamNameByTeamId$
      .withArgs(matches[0].teamIdHome).and.returnValue(of(expectedValues[0].teamNameHome))
      .withArgs(matches[0].teamIdAway).and.returnValue(of(expectedValues[0].teamNameAway));

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
    const argument1: MatchExtended = matches[0];
    const argument2: string = "test_user_id";

    appDataSpy.getTeamNameByTeamId$
      .withArgs(matches[0].teamIdHome).and.returnValue(from([expectedValues[1].teamNameHome, expectedValues[0].teamNameHome]))
      .withArgs(matches[0].teamIdAway).and.returnValue(of(expectedValues[0].teamNameAway));

    appDataSpy.getBet$.and.returnValue(of(bets[0]));

    service["makeBetWriteData$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[0]);
        done();
      }
    );
  });

});
