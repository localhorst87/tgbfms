import { TestBed } from '@angular/core/testing';

import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { MatchdataAccessService } from '../Dataaccess/matchdata-access.service';
import { MatchImportData, TeamRankingImportData } from '../Dataaccess/import_datastructures';
import { Bet, Match, Result, Team, SeasonResult } from '../Businessrules/basic_datastructures';
import { SynchronizeDataService } from './synchronize-data.service';
import { StatisticsCalculatorService } from '../Businessrules/statistics-calculator.service';
import { of, from } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';

describe('SynchronizeDataService', () => {
  let service: SynchronizeDataService;
  let appDataSpy: jasmine.SpyObj<AppdataAccessService>;
  let matchDataSpy: jasmine.SpyObj<MatchdataAccessService>;
  let statCalcSpy: jasmine.SpyObj<StatisticsCalculatorService>;
  let matchImportData: MatchImportData[];

  beforeEach(() => {
    appDataSpy = jasmine.createSpyObj(["getMatch$", "addMatch", "updateMatch", "getResult$", "addResult", "updateResult", "getSeasonResult$", "addSeasonResult", "updateSeasonResult", "getSyncTime$"]);
    matchDataSpy = jasmine.createSpyObj(["importMatchdata$", "importCurrentTeamRanking$", "getLastUpdateTime$"]);

    TestBed.configureTestingModule({
      providers: [
        SynchronizeDataService,
        { provide: AppdataAccessService, useValue: appDataSpy },
        { provide: MatchdataAccessService, useValue: matchDataSpy },
        { provide: StatisticsCalculatorService, useValue: statCalcSpy }
      ]
    });

    service = TestBed.inject(SynchronizeDataService);

    matchImportData = [
      {
        matchday: 12,
        matchId: 59012,
        datetime: "2021-02-03T18:30:00",
        isFinished: true,
        teamIdHome: 31,
        teamIdAway: 7,
        goalsHome: 3,
        goalsAway: 0
      },
      {
        matchday: 12,
        matchId: 59013,
        datetime: "2021-02-04T18:00:00",
        isFinished: true,
        teamIdHome: 121,
        teamIdAway: 13,
        goalsHome: 0,
        goalsAway: 0
      },
      {
        matchday: 12,
        matchId: 59012,
        datetime: "2021-02-05T20:30:00",
        isFinished: false,
        teamIdHome: 23,
        teamIdAway: 56,
        goalsHome: -1,
        goalsAway: -1
      }
    ];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // syncData
  // ---------------------------------------------------------------------------

  it('syncData, import required and data available', () => {
    const argument1: number = 2020;
    const argument2: number = 33;

    const rankingImportData: TeamRankingImportData[] = [
      {
        teamId: 101,
        matches: 34,
        points: 80,
        won: 25,
        draw: 5,
        lost: 4,
        goals: 85,
        goalsAgainst: 35
      },
      {
        teamId: 102,
        matches: 34,
        points: 75,
        won: 22,
        draw: 9,
        lost: 3,
        goals: 60,
        goalsAgainst: 30
      }
    ];

    spyOn<any>(service, "isSyncNeeded$").and.returnValue(of(true));
    matchDataSpy.importMatchdata$.and.returnValue(from(matchImportData));
    matchDataSpy.importCurrentTeamRanking$.and.returnValue(from(rankingImportData));
    spyOn<any>(service, "syncMatch").and.stub();
    spyOn<any>(service, "syncResult").and.stub();
    spyOn<any>(service, "syncSeasonResult").and.stub();

    service.syncData(argument1, argument2);
    expect(service["syncMatch"]).toHaveBeenCalledWith(argument1, matchImportData[0]);
    expect(service["syncMatch"]).toHaveBeenCalledWith(argument1, matchImportData[1]);
    expect(service["syncMatch"]).toHaveBeenCalledWith(argument1, matchImportData[2]);
    expect(service["syncResult"]).toHaveBeenCalledWith(argument1, matchImportData[0]);
    expect(service["syncResult"]).toHaveBeenCalledWith(argument1, matchImportData[1]);
    expect(service["syncResult"]).toHaveBeenCalledWith(argument1, matchImportData[2]);
    expect(service["syncSeasonResult"]).toHaveBeenCalledWith(argument1, argument2, rankingImportData);
  });

  it('syncData, import required but no match data available', () => {
    const argument1: number = 2020;
    const argument2: number = 33;

    const rankingImportData: TeamRankingImportData[] = [
      {
        teamId: 101,
        matches: 34,
        points: 80,
        won: 25,
        draw: 5,
        lost: 4,
        goals: 85,
        goalsAgainst: 35
      },
      {
        teamId: 102,
        matches: 34,
        points: 75,
        won: 22,
        draw: 9,
        lost: 3,
        goals: 60,
        goalsAgainst: 30
      }
    ];

    spyOn<any>(service, "isSyncNeeded$").and.returnValue(of(true));
    matchDataSpy.importMatchdata$.and.returnValue(from([]));
    matchDataSpy.importCurrentTeamRanking$.and.returnValue(from(rankingImportData));
    spyOn<any>(service, "syncMatch").and.stub();
    spyOn<any>(service, "syncResult").and.stub();
    spyOn<any>(service, "syncSeasonResult").and.stub();

    service.syncData(argument1, argument2);
    expect(service["syncMatch"]).not.toHaveBeenCalled();
    expect(service["syncResult"]).not.toHaveBeenCalled();
    expect(service["syncSeasonResult"]).toHaveBeenCalledWith(argument1, argument2, rankingImportData);
  });

  it('syncData, import required but no match data available', () => {
    const argument1: number = 2020;
    const argument2: number = 33;

    const rankingImportData: TeamRankingImportData[] = [
      {
        teamId: 101,
        matches: 34,
        points: 80,
        won: 25,
        draw: 5,
        lost: 4,
        goals: 85,
        goalsAgainst: 35
      },
      {
        teamId: 102,
        matches: 34,
        points: 75,
        won: 22,
        draw: 9,
        lost: 3,
        goals: 60,
        goalsAgainst: 30
      }
    ];

    spyOn<any>(service, "isSyncNeeded$").and.returnValue(of(false));
    matchDataSpy.importMatchdata$.and.returnValue(from(matchImportData));
    matchDataSpy.importCurrentTeamRanking$.and.returnValue(from(rankingImportData));
    spyOn<any>(service, "syncMatch").and.stub();
    spyOn<any>(service, "syncResult").and.stub();
    spyOn<any>(service, "syncSeasonResult").and.stub();

    service.syncData(argument1, argument2);
    expect(service["syncMatch"]).not.toHaveBeenCalled();
    expect(service["syncResult"]).not.toHaveBeenCalled();
    expect(service["syncSeasonResult"]).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // isSyncNeeded
  // ---------------------------------------------------------------------------

  it('syncData, match import data is newer', (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 33;

    matchDataSpy.getLastUpdateTime$.and.returnValue(of(1620890000));
    appDataSpy.getSyncTime$.and.returnValue(of({ documentId: "test_doc", season: argument1, matchday: argument2, timestamp: 1620840000 }));
    const expectedValue: boolean = true;

    service["isSyncNeeded$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it('syncData, times equal', (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 33;

    matchDataSpy.getLastUpdateTime$.and.returnValue(of(1620790000));
    appDataSpy.getSyncTime$.and.returnValue(of({ documentId: "test_doc", season: argument1, matchday: argument2, timestamp: 1620790000 }));

    const expectedValue: boolean = false;

    service["isSyncNeeded$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // syncMatch
  // ---------------------------------------------------------------------------


  it('syncMatch, match is new to app data', () => {
    const argument1: number = 2020;
    const argument2: MatchImportData = matchImportData[0];

    const appDataMatch: Match = {
      documentId: "",
      season: -1,
      matchday: -1,
      matchId: argument2.matchId,
      timestamp: -1,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: -1,
      teamIdAway: -1
    };

    const transformedMatch: Match = {
      documentId: "",
      season: argument1,
      matchday: argument2.matchday,
      matchId: argument2.matchId,
      timestamp: new Date(argument2.datetime).getTime() / 1000,
      isFinished: argument2.isFinished,
      isTopMatch: appDataMatch.isTopMatch,
      teamIdHome: argument2.teamIdHome,
      teamIdAway: argument2.teamIdAway
    };

    appDataSpy.getMatch$.withArgs(argument2.matchId).and.returnValue(of(appDataMatch));
    appDataSpy.addMatch.and.stub();
    appDataSpy.updateMatch.and.stub();
    spyOn<any>(service, "convertToMatch")
      .withArgs(argument1, argument2, appDataMatch.isTopMatch).and.returnValue(transformedMatch);
    spyOn<any>(service, "isMatchEqual")
      .withArgs(transformedMatch, appDataMatch).and.returnValue(false);
    spyOn<any>(service, "checkCounters").and.stub();

    service["syncMatch"](argument1, argument2);
    expect(appDataSpy.addMatch).toHaveBeenCalledWith(transformedMatch);
    expect(appDataSpy.updateMatch).not.toHaveBeenCalled();
  });

  it('syncMatch, match different than in app data', () => {
    const argument1: number = 2020;
    const argument2: MatchImportData = matchImportData[0];

    const appDataMatch: Match = {
      documentId: "test_doc_id",
      season: argument1,
      matchday: argument2.matchday,
      matchId: argument2.matchId,
      timestamp: new Date(argument2.datetime).getTime() / 1000,
      isFinished: argument2.isFinished,
      isTopMatch: true,
      teamIdHome: argument2.teamIdHome,
      teamIdAway: argument2.teamIdAway
    };

    const transformedMatch: Match = {
      documentId: "",
      season: appDataMatch.season,
      matchday: appDataMatch.matchday,
      matchId: appDataMatch.matchId,
      timestamp: appDataMatch.timestamp + 3600,
      isFinished: appDataMatch.isFinished,
      isTopMatch: appDataMatch.isTopMatch,
      teamIdHome: appDataMatch.teamIdHome,
      teamIdAway: appDataMatch.teamIdAway
    };

    appDataSpy.getMatch$.withArgs(argument2.matchId).and.returnValue(of(appDataMatch));
    appDataSpy.addMatch.and.stub();
    appDataSpy.updateMatch.and.stub();
    spyOn<any>(service, "convertToMatch")
      .withArgs(argument1, argument2, appDataMatch.isTopMatch).and.returnValue(transformedMatch);
    spyOn<any>(service, "isMatchEqual")
      .withArgs(transformedMatch, appDataMatch).and.returnValue(false);
    spyOn<any>(service, "checkCounters").and.stub();

    service["syncMatch"](argument1, argument2);
    expect(appDataSpy.updateMatch).toHaveBeenCalledWith(appDataMatch.documentId, transformedMatch);
    expect(appDataSpy.addMatch).not.toHaveBeenCalled();
  });

  it('syncMatch, match equal in app data', () => {
    const argument1: number = 2020;
    const argument2: MatchImportData = matchImportData[0];

    const appDataMatch: Match = {
      documentId: "test_doc_id",
      season: argument1,
      matchday: argument2.matchday,
      matchId: argument2.matchId,
      timestamp: new Date(argument2.datetime).getTime() / 1000,
      isFinished: argument2.isFinished,
      isTopMatch: true,
      teamIdHome: argument2.teamIdHome,
      teamIdAway: argument2.teamIdAway
    };

    const transformedMatch: Match = {
      documentId: "",
      season: appDataMatch.season,
      matchday: appDataMatch.matchday,
      matchId: appDataMatch.matchId,
      timestamp: appDataMatch.timestamp,
      isFinished: appDataMatch.isFinished,
      isTopMatch: appDataMatch.isTopMatch,
      teamIdHome: appDataMatch.teamIdHome,
      teamIdAway: appDataMatch.teamIdAway
    };

    appDataSpy.getMatch$.withArgs(argument2.matchId).and.returnValue(of(appDataMatch));
    appDataSpy.addMatch.and.stub();
    appDataSpy.updateMatch.and.stub();
    spyOn<any>(service, "convertToMatch")
      .withArgs(argument1, argument2, appDataMatch.isTopMatch).and.returnValue(transformedMatch);
    spyOn<any>(service, "isMatchEqual")
      .withArgs(transformedMatch, appDataMatch).and.returnValue(true);
    spyOn<any>(service, "checkCounters").and.stub();

    service["syncMatch"](argument1, argument2);
    expect(appDataSpy.updateMatch).not.toHaveBeenCalled();
    expect(appDataSpy.addMatch).not.toHaveBeenCalled();
  });

  it('syncMatch, get match not emitting', () => {
    const argument1: number = 2020;
    const argument2: MatchImportData = matchImportData[0];

    appDataSpy.getMatch$.withArgs(argument2.matchId).and.returnValue(of());
    appDataSpy.addMatch.and.stub();
    appDataSpy.updateMatch.and.stub();
    spyOn<any>(service, "convertToMatch").and.callThrough();
    spyOn<any>(service, "checkCounters").and.stub();

    service["syncMatch"](argument1, argument2);
    expect(service["convertToMatch"]).not.toHaveBeenCalled();
    expect(appDataSpy.updateMatch).not.toHaveBeenCalled();
    expect(appDataSpy.addMatch).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // syncResult
  // ---------------------------------------------------------------------------

  it('syncResult, result available and new to app data', () => {
    const argument1: number = 2021;
    const argument2: MatchImportData = matchImportData[1];

    const appdataResult: Result = {
      documentId: "",
      matchId: argument2.matchId,
      goalsHome: -1,
      goalsAway: -1
    };

    const transformedResult: Result = {
      documentId: "",
      matchId: argument2.matchId,
      goalsHome: argument2.goalsHome,
      goalsAway: argument2.goalsAway
    };

    appDataSpy.getResult$.withArgs(argument2.matchId).and.returnValue(of(appdataResult));
    appDataSpy.addResult.and.stub();
    appDataSpy.updateResult.and.stub();
    spyOn<any>(service, "convertToResult").withArgs(argument2).and.returnValue(transformedResult);
    spyOn<any>(service, "isResultEqual").withArgs(transformedResult, appdataResult).and.returnValue(false);
    spyOn<any>(service, "checkCounters").and.stub();

    service["syncResult"](argument1, argument2);
    expect(appDataSpy.addResult).toHaveBeenCalledWith(transformedResult);
    expect(appDataSpy.updateResult).not.toHaveBeenCalled();
  });

  it('syncResult, result available and different than in app data', () => {
    const argument1: number = 2021;
    const argument2: MatchImportData = matchImportData[1];

    const appdataResult: Result = {
      documentId: "test_doc_id",
      matchId: argument2.matchId,
      goalsHome: argument2.goalsHome,
      goalsAway: argument2.goalsAway
    };

    const transformedResult: Result = {
      documentId: "",
      matchId: appdataResult.matchId,
      goalsHome: appdataResult.goalsHome + 1,
      goalsAway: appdataResult.goalsAway
    };

    appDataSpy.getResult$.withArgs(argument2.matchId).and.returnValue(of(appdataResult));
    appDataSpy.addResult.and.stub();
    appDataSpy.updateResult.and.stub();
    spyOn<any>(service, "convertToResult").withArgs(argument2).and.returnValue(transformedResult);
    spyOn<any>(service, "isResultEqual").withArgs(transformedResult, appdataResult).and.returnValue(false);
    spyOn<any>(service, "checkCounters").and.stub();

    service["syncResult"](argument1, argument2);
    expect(appDataSpy.addResult).not.toHaveBeenCalled();
    expect(appDataSpy.updateResult).toHaveBeenCalledWith(appdataResult.documentId, transformedResult);
  });

  it('syncResult, result available and equal to app data', () => {
    const argument1: number = 2021;
    const argument2: MatchImportData = matchImportData[1];

    const appdataResult: Result = {
      documentId: "test_doc_id",
      matchId: argument2.matchId,
      goalsHome: argument2.goalsHome,
      goalsAway: argument2.goalsAway
    };

    const transformedResult: Result = {
      documentId: "",
      matchId: appdataResult.matchId,
      goalsHome: appdataResult.goalsHome,
      goalsAway: appdataResult.goalsAway
    };

    appDataSpy.getResult$.withArgs(argument2.matchId).and.returnValue(of(appdataResult));
    appDataSpy.addResult.and.stub();
    appDataSpy.updateResult.and.stub();
    spyOn<any>(service, "convertToResult").withArgs(argument2).and.returnValue(transformedResult);
    spyOn<any>(service, "isResultEqual").withArgs(transformedResult, appdataResult).and.returnValue(true);
    spyOn<any>(service, "checkCounters").and.stub();

    service["syncResult"](argument1, argument2);
    expect(appDataSpy.addResult).not.toHaveBeenCalled();
    expect(appDataSpy.updateResult).not.toHaveBeenCalled();
  });

  it('syncResult, result not available', () => {
    const argument1: number = 2021;
    const argument2: MatchImportData = matchImportData[2]; // goalsHome == goalsAway == -1

    const appdataResult: Result = {
      documentId: "test_doc_id",
      matchId: argument2.matchId,
      goalsHome: argument2.goalsHome,
      goalsAway: argument2.goalsAway
    };

    const transformedResult: Result = {
      documentId: "",
      matchId: appdataResult.matchId,
      goalsHome: appdataResult.goalsHome,
      goalsAway: appdataResult.goalsAway
    };

    appDataSpy.getResult$.withArgs(argument2.matchId).and.returnValue(of(appdataResult));
    appDataSpy.addResult.and.stub();
    appDataSpy.updateResult.and.stub();
    spyOn<any>(service, "convertToResult").withArgs(argument2).and.returnValue(transformedResult);
    spyOn<any>(service, "isResultEqual").withArgs(transformedResult, appdataResult).and.returnValue(true);
    spyOn<any>(service, "checkCounters").and.stub();

    service["syncResult"](argument1, argument2);
    expect(service["isResultEqual"]).not.toHaveBeenCalled();
    expect(appDataSpy.addResult).not.toHaveBeenCalled();
    expect(appDataSpy.updateResult).not.toHaveBeenCalled();
  });

  it('syncResult, getResult not emitting', () => {
    const argument: MatchImportData = matchImportData[0];

    appDataSpy.getResult$.withArgs(argument.matchId).and.returnValue(of());
    appDataSpy.addResult.and.stub();
    appDataSpy.updateResult.and.stub();
    spyOn<any>(service, "convertToResult").and.callThrough();
    spyOn<any>(service, "isResultEqual").and.callThrough();
    spyOn<any>(service, "checkCounters").and.stub();

    service["syncResult"](2021, argument);
    expect(service["convertToResult"]).not.toHaveBeenCalled();
    expect(service["isResultEqual"]).not.toHaveBeenCalled();
    expect(appDataSpy.addResult).not.toHaveBeenCalled();
    expect(appDataSpy.updateResult).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // syncSeasonResult
  // ---------------------------------------------------------------------------

  it('syncSeasonResult, import data available, app data partly not available, partly different', () => {
    const argument1: number = 2020;
    const argument2: number = 20;
    const argument3: TeamRankingImportData[] = [
      {
        teamId: 101,
        matches: 34,
        points: 80,
        won: 25,
        draw: 5,
        lost: 4,
        goals: 85,
        goalsAgainst: 35
      }, // 1
      {
        teamId: 102,
        matches: 34,
        points: 75,
        won: 22,
        draw: 9,
        lost: 3,
        goals: 60,
        goalsAgainst: 30
      }, // 2
      {
        teamId: 103,
        matches: 34,
        points: 66,
        won: 20,
        draw: 6,
        lost: 8,
        goals: 75,
        goalsAgainst: 45
      },
      {
        teamId: 104,
        matches: 34,
        points: 50,
        won: 15,
        draw: 5,
        lost: 14,
        goals: 50,
        goalsAgainst: 41
      },
      {
        teamId: 105,
        matches: 34,
        points: 48,
        won: 14,
        draw: 6,
        lost: 14,
        goals: 53,
        goalsAgainst: 46
      }, // -3
      {
        teamId: 106,
        matches: 34,
        points: 35,
        won: 8,
        draw: 9,
        lost: 17,
        goals: 43,
        goalsAgainst: 56
      }, // -2
      {
        teamId: 107,
        matches: 34,
        points: 29,
        won: 5,
        draw: 14,
        lost: 15,
        goals: 33,
        goalsAgainst: 61
      } // -1
    ];

    const convertedResults: SeasonResult[] = [
      {
        documentId: "",
        season: argument1,
        place: 1,
        teamId: argument3[0].teamId
      },
      {
        documentId: "",
        season: argument1,
        place: 2,
        teamId: argument3[1].teamId
      },
      {
        documentId: "",
        season: argument1,
        place: -1,
        teamId: argument3[argument3.length - 1].teamId
      },
      {
        documentId: "",
        season: argument1,
        place: -2,
        teamId: argument3[argument3.length - 2].teamId
      },
      {
        documentId: "",
        season: argument1,
        place: -3,
        teamId: argument3[argument3.length - 3].teamId
      }
    ];

    const appdataResult: SeasonResult[] = [
      {
        documentId: "",
        season: argument1,
        place: 1,
        teamId: -1
      },
      {
        documentId: "doc_second_place",
        season: argument1,
        place: 2,
        teamId: convertedResults[1].teamId
      },
      {
        documentId: "doc_last_place",
        season: argument1,
        place: -1,
        teamId: 99
      },
      {
        documentId: "",
        season: argument1,
        place: -2,
        teamId: -1
      },
      {
        documentId: "",
        season: argument1,
        place: -3,
        teamId: -1
      }
    ];

    appDataSpy.getSeasonResult$
      .withArgs(argument1, 1).and.returnValue(of(appdataResult[0]))
      .withArgs(argument1, 2).and.returnValue(of(appdataResult[1]))
      .withArgs(argument1, -3).and.returnValue(of(appdataResult[2]))
      .withArgs(argument1, -2).and.returnValue(of(appdataResult[3]))
      .withArgs(argument1, -1).and.returnValue(of(appdataResult[4]));

    appDataSpy.addSeasonResult.and.stub();
    appDataSpy.updateSeasonResult.and.stub();

    spyOn<any>(service, "convertToSeasonResult")
      .withArgs(argument1, 1, argument3[0]).and.returnValue(convertedResults[0])
      .withArgs(argument1, 2, argument3[1]).and.returnValue(convertedResults[1])
      .withArgs(argument1, -1, argument3[argument3.length - 1]).and.returnValue(convertedResults[2])
      .withArgs(argument1, -2, argument3[argument3.length - 2]).and.returnValue(convertedResults[3])
      .withArgs(argument1, -3, argument3[argument3.length - 3]).and.returnValue(convertedResults[4]);
    spyOn<any>(service, "checkCounters").and.stub();

    service["syncSeasonResult"](argument1, argument2, argument3);
    expect(appDataSpy.addSeasonResult).toHaveBeenCalledTimes(3);
    expect(appDataSpy.updateSeasonResult).toHaveBeenCalledTimes(1);
  });

  it('syncSeasonResult, import data and app data available, but different', () => {
    const argument1: number = 2020;
    const argument2: number = 20;
    const argument3: TeamRankingImportData[] = [
      {
        teamId: 101,
        matches: 34,
        points: 80,
        won: 25,
        draw: 5,
        lost: 4,
        goals: 85,
        goalsAgainst: 35
      }, // 1
      {
        teamId: 102,
        matches: 34,
        points: 75,
        won: 22,
        draw: 9,
        lost: 3,
        goals: 60,
        goalsAgainst: 30
      }, // 2
      {
        teamId: 103,
        matches: 34,
        points: 66,
        won: 20,
        draw: 6,
        lost: 8,
        goals: 75,
        goalsAgainst: 45
      },
      {
        teamId: 104,
        matches: 34,
        points: 50,
        won: 15,
        draw: 5,
        lost: 14,
        goals: 50,
        goalsAgainst: 41
      },
      {
        teamId: 105,
        matches: 34,
        points: 48,
        won: 14,
        draw: 6,
        lost: 14,
        goals: 53,
        goalsAgainst: 46
      }, // -3
      {
        teamId: 106,
        matches: 34,
        points: 35,
        won: 8,
        draw: 9,
        lost: 17,
        goals: 43,
        goalsAgainst: 56
      }, // -2
      {
        teamId: 107,
        matches: 34,
        points: 29,
        won: 5,
        draw: 14,
        lost: 15,
        goals: 33,
        goalsAgainst: 61
      } // -1
    ];

    const convertedResults: SeasonResult[] = [
      {
        documentId: "",
        season: argument1,
        place: 1,
        teamId: argument3[0].teamId
      },
      {
        documentId: "",
        season: argument1,
        place: 2,
        teamId: argument3[1].teamId
      },
      {
        documentId: "",
        season: argument1,
        place: -1,
        teamId: argument3[argument3.length - 1].teamId
      },
      {
        documentId: "",
        season: argument1,
        place: -2,
        teamId: argument3[argument3.length - 2].teamId
      },
      {
        documentId: "",
        season: argument1,
        place: -3,
        teamId: argument3[argument3.length - 3].teamId
      }
    ];

    const appdataResult: SeasonResult[] = [
      {
        documentId: "doc_first_place",
        season: argument1,
        place: 1,
        teamId: 11
      },
      {
        documentId: "doc_second_place",
        season: argument1,
        place: 2,
        teamId: convertedResults[1].teamId
      },
      {
        documentId: "doc_last_place",
        season: argument1,
        place: -1,
        teamId: convertedResults[2].teamId
      },
      {
        documentId: "doc_secondlast_place",
        season: argument1,
        place: -2,
        teamId: 222
      },
      {
        documentId: "doc_thirdlast_place",
        season: argument1,
        place: -3,
        teamId: 333
      }
    ];

    appDataSpy.getSeasonResult$
      .withArgs(argument1, 1).and.returnValue(of(appdataResult[0]))
      .withArgs(argument1, 2).and.returnValue(of(appdataResult[1]))
      .withArgs(argument1, -3).and.returnValue(of(appdataResult[4]))
      .withArgs(argument1, -2).and.returnValue(of(appdataResult[3]))
      .withArgs(argument1, -1).and.returnValue(of(appdataResult[1]));
    appDataSpy.addSeasonResult.and.stub();
    appDataSpy.updateSeasonResult.and.stub();

    spyOn<any>(service, "convertToSeasonResult")
      .withArgs(argument1, 1, argument3[0]).and.returnValue(convertedResults[0])
      .withArgs(argument1, 2, argument3[1]).and.returnValue(convertedResults[1])
      .withArgs(argument1, -1, argument3[argument3.length - 1]).and.returnValue(convertedResults[2])
      .withArgs(argument1, -2, argument3[argument3.length - 2]).and.returnValue(convertedResults[3])
      .withArgs(argument1, -3, argument3[argument3.length - 3]).and.returnValue(convertedResults[4]);
    spyOn<any>(service, "checkCounters").and.stub();

    service["syncSeasonResult"](argument1, argument2, argument3);
    expect(appDataSpy.addSeasonResult).not.toHaveBeenCalled();
    expect(appDataSpy.updateSeasonResult).toHaveBeenCalledWith(appdataResult[0].documentId, convertedResults[0]);
    expect(appDataSpy.updateSeasonResult).not.toHaveBeenCalledWith(appdataResult[1].documentId, convertedResults[1]);
    expect(appDataSpy.updateSeasonResult).not.toHaveBeenCalledWith(appdataResult[2].documentId, convertedResults[2]);
    expect(appDataSpy.updateSeasonResult).toHaveBeenCalledWith(appdataResult[3].documentId, convertedResults[3]);
    expect(appDataSpy.updateSeasonResult).toHaveBeenCalledWith(appdataResult[4].documentId, convertedResults[4]);
  });

  it('syncSeasonResult, import data and app data available and equal', () => {
    const argument1: number = 2020;
    const argument2: number = 20;
    const argument3: TeamRankingImportData[] = [
      {
        teamId: 101,
        matches: 34,
        points: 80,
        won: 25,
        draw: 5,
        lost: 4,
        goals: 85,
        goalsAgainst: 35
      }, // 1
      {
        teamId: 102,
        matches: 34,
        points: 75,
        won: 22,
        draw: 9,
        lost: 3,
        goals: 60,
        goalsAgainst: 30
      }, // 2
      {
        teamId: 103,
        matches: 34,
        points: 66,
        won: 20,
        draw: 6,
        lost: 8,
        goals: 75,
        goalsAgainst: 45
      },
      {
        teamId: 104,
        matches: 34,
        points: 50,
        won: 15,
        draw: 5,
        lost: 14,
        goals: 50,
        goalsAgainst: 41
      },
      {
        teamId: 105,
        matches: 34,
        points: 48,
        won: 14,
        draw: 6,
        lost: 14,
        goals: 53,
        goalsAgainst: 46
      }, // -3
      {
        teamId: 106,
        matches: 34,
        points: 35,
        won: 8,
        draw: 9,
        lost: 17,
        goals: 43,
        goalsAgainst: 56
      }, // -2
      {
        teamId: 107,
        matches: 34,
        points: 29,
        won: 5,
        draw: 14,
        lost: 15,
        goals: 33,
        goalsAgainst: 61
      } // -1
    ];

    const convertedResults: SeasonResult[] = [
      {
        documentId: "",
        season: argument1,
        place: 1,
        teamId: argument3[0].teamId
      },
      {
        documentId: "",
        season: argument1,
        place: 2,
        teamId: argument3[1].teamId
      },
      {
        documentId: "",
        season: argument1,
        place: -1,
        teamId: argument3[argument3.length - 1].teamId
      },
      {
        documentId: "",
        season: argument1,
        place: -2,
        teamId: argument3[argument3.length - 2].teamId
      },
      {
        documentId: "",
        season: argument1,
        place: -3,
        teamId: argument3[argument3.length - 3].teamId
      }
    ];

    const appdataResult: SeasonResult[] = [
      {
        documentId: "doc_first_place",
        season: argument1,
        place: 1,
        teamId: convertedResults[0].teamId
      },
      {
        documentId: "doc_second_place",
        season: argument1,
        place: 2,
        teamId: convertedResults[1].teamId
      },
      {
        documentId: "doc_last_place",
        season: argument1,
        place: -1,
        teamId: convertedResults[2].teamId
      },
      {
        documentId: "doc_secondlast_place",
        season: argument1,
        place: -2,
        teamId: convertedResults[3].teamId
      },
      {
        documentId: "doc_thirdlast_place",
        season: argument1,
        place: -3,
        teamId: convertedResults[4].teamId
      }
    ];

    appDataSpy.getSeasonResult$
      .withArgs(argument1, 1).and.returnValue(of(appdataResult[0]))
      .withArgs(argument1, 2).and.returnValue(of(appdataResult[1]))
      .withArgs(argument1, -3).and.returnValue(of(appdataResult[4]))
      .withArgs(argument1, -2).and.returnValue(of(appdataResult[3]))
      .withArgs(argument1, -1).and.returnValue(of(appdataResult[1]));
    appDataSpy.addSeasonResult.and.stub();
    appDataSpy.updateSeasonResult.and.stub();

    spyOn<any>(service, "convertToSeasonResult")
      .withArgs(argument1, 1, argument3[0]).and.returnValue(convertedResults[0])
      .withArgs(argument1, 2, argument3[1]).and.returnValue(convertedResults[1])
      .withArgs(argument1, -1, argument3[argument3.length - 1]).and.returnValue(convertedResults[2])
      .withArgs(argument1, -2, argument3[argument3.length - 2]).and.returnValue(convertedResults[3])
      .withArgs(argument1, -3, argument3[argument3.length - 3]).and.returnValue(convertedResults[4]);
    spyOn<any>(service, "checkCounters").and.stub();

    service["syncSeasonResult"](argument1, argument2, argument3);
    expect(appDataSpy.addSeasonResult).not.toHaveBeenCalled();
    expect(appDataSpy.updateSeasonResult).not.toHaveBeenCalled();
  });

  it('syncSeasonResult, not enough import datasets', () => {
    const argument1: number = 2020;
    const argument2: number = 20;
    const argument3: TeamRankingImportData[] = [
      {
        teamId: 101,
        matches: 34,
        points: 80,
        won: 25,
        draw: 5,
        lost: 4,
        goals: 85,
        goalsAgainst: 35
      },
      {
        teamId: 102,
        matches: 34,
        points: 75,
        won: 22,
        draw: 9,
        lost: 3,
        goals: 60,
        goalsAgainst: 30
      }
    ];

    service["syncSeasonResult"](argument1, argument2, argument3);
    expect(appDataSpy.getSeasonResult$).not.toHaveBeenCalled();
    expect(appDataSpy.addSeasonResult).not.toHaveBeenCalled();
    expect(appDataSpy.updateSeasonResult).not.toHaveBeenCalled();
  });
});
