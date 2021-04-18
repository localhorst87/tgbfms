import { TestBed } from '@angular/core/testing';

import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { MatchdataAccessService } from '../Dataaccess/matchdata-access.service';
import { MatchImportData } from '../Dataaccess/matchdata_datastructures';
import { Bet, Match, Result, Team } from '../Dataaccess/database_datastructures';
import { BetExtended, MatchExtended, ResultExtended, TeamExtended } from '../Dataaccess/database_datastructures';
import { SynchronizeDataService } from './synchronize-data.service';
import { of, from } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';

describe('SynchronizeDataService', () => {
  let service: SynchronizeDataService;
  let appDataSpy: jasmine.SpyObj<AppdataAccessService>;
  let matchDataSpy: jasmine.SpyObj<MatchdataAccessService>;
  let matchImportData: MatchImportData[];

  beforeEach(() => {
    appDataSpy = jasmine.createSpyObj(["getMatch$", "addMatch", "updateMatch", "getResult$", "addResult", "updateResult"]);
    matchDataSpy = jasmine.createSpyObj(["importMatchdata$"]);

    TestBed.configureTestingModule({
      providers: [
        SynchronizeDataService,
        { provide: AppdataAccessService, useValue: appDataSpy },
        { provide: MatchdataAccessService, useValue: matchDataSpy }
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

  it('syncData, import data available', () => {
    const argument1: number = 2020;
    const argument2: number = 12;

    matchDataSpy.importMatchdata$.and.returnValue(from(matchImportData));
    spyOn<any>(service, "syncMatch").and.stub();
    spyOn<any>(service, "syncResult").and.stub();

    service.syncData(argument1, argument2);
    expect(service["syncMatch"]).toHaveBeenCalledWith(argument1, matchImportData[0]);
    expect(service["syncMatch"]).toHaveBeenCalledWith(argument1, matchImportData[1]);
    expect(service["syncMatch"]).toHaveBeenCalledWith(argument1, matchImportData[2]);
    expect(service["syncResult"]).toHaveBeenCalledWith(matchImportData[0]);
    expect(service["syncResult"]).toHaveBeenCalledWith(matchImportData[1]);
    expect(service["syncResult"]).toHaveBeenCalledWith(matchImportData[2]);
  });

  it('syncData, no import data available', () => {
    const argument1: number = 2020;
    const argument2: number = 12;

    matchDataSpy.importMatchdata$.and.returnValue(from([]));
    spyOn<any>(service, "syncMatch").and.stub();
    spyOn<any>(service, "syncResult").and.stub();

    service.syncData(argument1, argument2);
    expect(service["syncMatch"]).not.toHaveBeenCalled();
    expect(service["syncResult"]).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // syncMatch
  // ---------------------------------------------------------------------------

  it('syncMatch, match is new to app data', () => {
    const argument1: number = 2020;
    const argument2: MatchImportData = matchImportData[0];

    const appDataMatch: MatchExtended = {
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
    spyOn<any>(service, "createMatch")
      .withArgs(argument1, argument2, appDataMatch.isTopMatch).and.returnValue(transformedMatch);
    spyOn<any>(service, "isMatchEqual")
      .withArgs(transformedMatch, appDataMatch).and.returnValue(false);

    service["syncMatch"](argument1, argument2);
    expect(appDataSpy.addMatch).toHaveBeenCalledWith(transformedMatch);
    expect(appDataSpy.updateMatch).not.toHaveBeenCalled();
  });

  it('syncMatch, match different than in app data', () => {
    const argument1: number = 2020;
    const argument2: MatchImportData = matchImportData[0];

    const appDataMatch: MatchExtended = {
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
    spyOn<any>(service, "createMatch")
      .withArgs(argument1, argument2, appDataMatch.isTopMatch).and.returnValue(transformedMatch);
    spyOn<any>(service, "isMatchEqual")
      .withArgs(transformedMatch, appDataMatch).and.returnValue(false);

    service["syncMatch"](argument1, argument2);
    expect(appDataSpy.updateMatch).toHaveBeenCalledWith(appDataMatch.documentId, transformedMatch);
    expect(appDataSpy.addMatch).not.toHaveBeenCalled();
  });

  it('syncMatch, match equal in app data', () => {
    const argument1: number = 2020;
    const argument2: MatchImportData = matchImportData[0];

    const appDataMatch: MatchExtended = {
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
    spyOn<any>(service, "createMatch")
      .withArgs(argument1, argument2, appDataMatch.isTopMatch).and.returnValue(transformedMatch);
    spyOn<any>(service, "isMatchEqual")
      .withArgs(transformedMatch, appDataMatch).and.returnValue(true);

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
    spyOn<any>(service, "createMatch").and.callThrough();

    service["syncMatch"](argument1, argument2);
    expect(service["createMatch"]).not.toHaveBeenCalled();
    expect(appDataSpy.updateMatch).not.toHaveBeenCalled();
    expect(appDataSpy.addMatch).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // syncResult
  // ---------------------------------------------------------------------------

  it('syncResult, result available and new to app data', () => {
    const argument: MatchImportData = matchImportData[1];

    const appdataResult: ResultExtended = {
      documentId: "",
      matchId: argument.matchId,
      goalsHome: -1,
      goalsAway: -1
    };

    const transformedResult: Result = {
      matchId: argument.matchId,
      goalsHome: argument.goalsHome,
      goalsAway: argument.goalsAway
    };

    appDataSpy.getResult$.withArgs(argument.matchId).and.returnValue(of(appdataResult));
    appDataSpy.addResult.and.stub();
    appDataSpy.updateResult.and.stub();
    spyOn<any>(service, "createResult").withArgs(argument).and.returnValue(transformedResult);
    spyOn<any>(service, "isResultEqual").withArgs(transformedResult, appdataResult).and.returnValue(false);

    service["syncResult"](argument);
    expect(appDataSpy.addResult).toHaveBeenCalledWith(transformedResult);
    expect(appDataSpy.updateResult).not.toHaveBeenCalled();
  });

  it('syncResult, result available and different than in app data', () => {
    const argument: MatchImportData = matchImportData[1];

    const appdataResult: ResultExtended = {
      documentId: "test_doc_id",
      matchId: argument.matchId,
      goalsHome: argument.goalsHome,
      goalsAway: argument.goalsAway
    };

    const transformedResult: Result = {
      matchId: appdataResult.matchId,
      goalsHome: appdataResult.goalsHome + 1,
      goalsAway: appdataResult.goalsAway
    };

    appDataSpy.getResult$.withArgs(argument.matchId).and.returnValue(of(appdataResult));
    appDataSpy.addResult.and.stub();
    appDataSpy.updateResult.and.stub();
    spyOn<any>(service, "createResult").withArgs(argument).and.returnValue(transformedResult);
    spyOn<any>(service, "isResultEqual").withArgs(transformedResult, appdataResult).and.returnValue(false);

    service["syncResult"](argument);
    expect(appDataSpy.addResult).not.toHaveBeenCalled();
    expect(appDataSpy.updateResult).toHaveBeenCalledWith(appdataResult.documentId, transformedResult);
  });

  it('syncResult, result available and equal to app data', () => {
    const argument: MatchImportData = matchImportData[1];

    const appdataResult: ResultExtended = {
      documentId: "test_doc_id",
      matchId: argument.matchId,
      goalsHome: argument.goalsHome,
      goalsAway: argument.goalsAway
    };

    const transformedResult: Result = {
      matchId: appdataResult.matchId,
      goalsHome: appdataResult.goalsHome,
      goalsAway: appdataResult.goalsAway
    };

    appDataSpy.getResult$.withArgs(argument.matchId).and.returnValue(of(appdataResult));
    appDataSpy.addResult.and.stub();
    appDataSpy.updateResult.and.stub();
    spyOn<any>(service, "createResult").withArgs(argument).and.returnValue(transformedResult);
    spyOn<any>(service, "isResultEqual").withArgs(transformedResult, appdataResult).and.returnValue(true);

    service["syncResult"](argument);
    expect(appDataSpy.addResult).not.toHaveBeenCalled();
    expect(appDataSpy.updateResult).not.toHaveBeenCalled();
  });

  it('syncResult, result not available', () => {
    const argument: MatchImportData = matchImportData[2]; // goalsHome == goalsAway == -1

    const appdataResult: ResultExtended = {
      documentId: "test_doc_id",
      matchId: argument.matchId,
      goalsHome: argument.goalsHome,
      goalsAway: argument.goalsAway
    };

    const transformedResult: Result = {
      matchId: appdataResult.matchId,
      goalsHome: appdataResult.goalsHome,
      goalsAway: appdataResult.goalsAway
    };

    appDataSpy.getResult$.withArgs(argument.matchId).and.returnValue(of(appdataResult));
    appDataSpy.addResult.and.stub();
    appDataSpy.updateResult.and.stub();
    spyOn<any>(service, "createResult").withArgs(argument).and.returnValue(transformedResult);
    spyOn<any>(service, "isResultEqual").withArgs(transformedResult, appdataResult).and.returnValue(true);

    service["syncResult"](argument);
    expect(service["isResultEqual"]).not.toHaveBeenCalled();
    expect(appDataSpy.addResult).not.toHaveBeenCalled();
    expect(appDataSpy.updateResult).not.toHaveBeenCalled();
  });

  it('syncResult, getResult not emitting', () => {
    const argument: MatchImportData = matchImportData[0];

    appDataSpy.getResult$.withArgs(argument.matchId).and.returnValue(of());
    appDataSpy.addResult.and.stub();
    appDataSpy.updateResult.and.stub();
    spyOn<any>(service, "createResult").and.callThrough();
    spyOn<any>(service, "isResultEqual").and.callThrough();

    service["syncResult"](argument);
    expect(service["createResult"]).not.toHaveBeenCalled();
    expect(service["isResultEqual"]).not.toHaveBeenCalled();
    expect(appDataSpy.addResult).not.toHaveBeenCalled();
    expect(appDataSpy.updateResult).not.toHaveBeenCalled();
  });

});
