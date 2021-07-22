import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { of, from } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';
import { MatchdataAccessOpenligaService } from './matchdata-access-openliga.service';
import { MatchImportData, TeamRankingImportData } from './import_datastructures';

describe('MatchdataAccessOpenligaService', () => {
  let service: MatchdataAccessOpenligaService;
  let httpClientSpy: { get: jasmine.Spy };

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    TestBed.configureTestingModule({
      providers: [MatchdataAccessOpenligaService, { provide: HttpClient, useValue: httpClientSpy }]
    });
    service = TestBed.inject(MatchdataAccessOpenligaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // getLastUpdateTime$
  // ---------------------------------------------------------------------------

  it("getLastUpdateTime$, data available", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 34;

    const httpResponse: any = "2021-05-22T22:06:37.197";
    httpClientSpy.get.and.returnValue(of(httpResponse));

    const expectedValue: number = Math.floor((new Date(String(httpResponse))).getTime() / 1000);
    spyOn<any>(service, "convertUpdateTime$").withArgs(String(httpResponse)).and.returnValue(of(expectedValue));

    service["getLastUpdateTime$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it("getLastUpdateTime$, no data available", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 34;

    const httpResponse: any = "";
    httpClientSpy.get.and.returnValue(of(httpResponse));

    const expectedValue: number = -1;
    spyOn<any>(service, "convertUpdateTime$").withArgs(String(httpResponse)).and.returnValue(of(expectedValue));

    service["getLastUpdateTime$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // isMatchStarted
  // ---------------------------------------------------------------------------

  it("isMatchStarted, time now greater", () => {
    jasmine.clock().install();

    const argument: any = { "MatchDateTime": "2021-04-03T15:30:00" };
    jasmine.clock().mockDate(new Date(argument.MatchDateTime));
    jasmine.clock().tick(10);

    const expectedValue: boolean = true;
    expect(service["isMatchStarted"](argument)).toBe(expectedValue);

    jasmine.clock().uninstall();
  });

  it("isMatchStarted, time now lower", () => {
    jasmine.clock().install();

    const argument: any = { "MatchDateTime": "2021-04-03T15:30:00" };
    jasmine.clock().mockDate(new Date(argument.MatchDateTime));
    jasmine.clock().tick(-10);

    const expectedValue: boolean = false;
    expect(service["isMatchStarted"](argument)).toBe(expectedValue);

    jasmine.clock().uninstall();
  });

  it("isMatchStarted, time now equal", () => {
    jasmine.clock().install();

    const argument: any = { "MatchDateTime": "2021-04-03T15:30:00" };
    jasmine.clock().mockDate(new Date(argument.MatchDateTime));

    const expectedValue: boolean = true;
    expect(service["isMatchStarted"](argument)).toBe(expectedValue);

    jasmine.clock().uninstall();
  });

  it("isMatchStarted, corrupt format", () => {
    const argument: any = { "MatchDateTime": "2021-0403T15:30:00" };
    const expectedValue: boolean = false;
    expect(service["isMatchStarted"](argument)).toBe(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // extractResult
  // ---------------------------------------------------------------------------

  it("extractResult, MatchResult and Goals available, match not yet started", () => {
    spyOn<any>(service, "isMatchStarted").and.returnValue(false);
    const argument: any = {
      "MatchResults": [
        { "PointsTeam1": 2, "PointsTeam2": 1, "ResultTypeID": 2 },
        { "PointsTeam1": 2, "PointsTeam2": 0, "ResultTypeID": 1 },
      ],
      "Goals": [
        { "ScoreTeam1": 1, "ScoreTeam2": 0 },
        { "ScoreTeam1": 2, "ScoreTeam2": 0 },
        { "ScoreTeam1": 2, "ScoreTeam2": 1 }
      ]
    };
    const expectedValue: number[] = [-1, -1];
    expect(service["extractResult"](argument)).toEqual(expectedValue);
  });

  it("extractResult, MatchResult and Goals available, match started", () => {
    spyOn<any>(service, "isMatchStarted").and.returnValue(true);
    const argument: any = {
      "MatchResults": [
        { "PointsTeam1": 2, "PointsTeam2": 1, "ResultTypeID": 2 },
        { "PointsTeam1": 2, "PointsTeam2": 0, "ResultTypeID": 1 },
      ],
      "Goals": [
        { "ScoreTeam1": 1, "ScoreTeam2": 0 },
        { "ScoreTeam1": 2, "ScoreTeam2": 0 },
        { "ScoreTeam1": 2, "ScoreTeam2": 1 }
      ]
    };
    const expectedValue: number[] = [2, 1];
    expect(service["extractResult"](argument)).toEqual(expectedValue);
  });

  it("extractResult, only Goals available, match started", () => {
    spyOn<any>(service, "isMatchStarted").and.returnValue(true);
    const argument: any = {
      "MatchResults": [],
      "Goals": [
        { "ScoreTeam1": 1, "ScoreTeam2": 0 },
        { "ScoreTeam1": 2, "ScoreTeam2": 0 },
        { "ScoreTeam1": 2, "ScoreTeam2": 1 }
      ]
    };
    const expectedValue: number[] = [2, 1];
    expect(service["extractResult"](argument)).toEqual(expectedValue);
  });

  it("extractResult, only MatchResults available, match started", () => {
    spyOn<any>(service, "isMatchStarted").and.returnValue(true);
    const argument: any = {
      "MatchResults": [
        { "PointsTeam1": 2, "PointsTeam2": 1, "ResultTypeID": 2 },
        { "PointsTeam1": 2, "PointsTeam2": 0, "ResultTypeID": 1 },
      ],
      "Goals": []
    };
    const expectedValue: number[] = [2, 1];
    expect(service["extractResult"](argument)).toEqual(expectedValue);
  });

  it("extractResult, ResultTypeId==1 and Goals available, match started", () => {
    spyOn<any>(service, "isMatchStarted").and.returnValue(true);
    const argument: any = {
      "MatchResults": [
        { "PointsTeam1": 0, "PointsTeam2": 0, "ResultTypeID": 1 },
      ],
      "Goals": [
        { "ScoreTeam1": 1, "ScoreTeam2": 0 }
      ]
    };
    const expectedValue: number[] = [1, 0];
    expect(service["extractResult"](argument)).toEqual(expectedValue);
  });

  it("extractResult, nor MatchResults, nor Goals available, match started", () => {
    spyOn<any>(service, "isMatchStarted").and.returnValue(true);
    const argument: any = {
      "MatchResults": [],
      "Goals": []
    };
    const expectedValue: number[] = [0, 0];
    expect(service["extractResult"](argument)).toEqual(expectedValue);
  });

  it("extractResult, nor MatchResults, nor Goals available, match not started", () => {
    spyOn<any>(service, "isMatchStarted").and.returnValue(false);
    const argument: any = {
      "MatchResults": [],
      "Goals": []
    };
    const expectedValue: number[] = [-1, -1];
    expect(service["extractResult"](argument)).toEqual(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // convertUpdateTime$
  // ---------------------------------------------------------------------------

  it("convertUpdateTime$, time available", (done: DoneFn) => {
    const argument: any = "2021-05-22T22:06:37.197";

    const expectedValue: number = Math.floor((new Date(String(argument))).getTime() / 1000);

    service["convertUpdateTime$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it("convertUpdateTime$, time available with leading whitespace", (done: DoneFn) => {
    const argument: any = " 2021-05-22T22:06:37.197";

    const expectedValue: number = Math.floor((new Date(String(argument).trim())).getTime() / 1000);

    service["convertUpdateTime$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it("convertUpdateTime$, time empty", (done: DoneFn) => {
    const argument: any = " ";

    const expectedValue: number = -1;

    service["convertUpdateTime$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it("convertUpdateTime$, http error", (done: DoneFn) => {
    const argument = new HttpErrorResponse({
      error: 'test error',
      status: 500,
      statusText: 'internal server error'
    });

    const expectedValue: number = -1;

    service["convertUpdateTime$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // convertMatchdayJson$
  // ---------------------------------------------------------------------------

  it("convertMatchdayJson, two complete matches available", (done: DoneFn) => {
    const argument: any = [
      {
        "MatchID": 58814,
        "MatchDateTime": "2021-04-03T15:30:00",
        "Group": { "GroupOrderID": 27 },
        "Team1": { "TeamId": 10 },
        "Team2": { "TeamId": 11 },
        "MatchIsFinished": true,
      },
      {
        "MatchID": 58815,
        "MatchDateTime": "2021-04-03T18:30:00",
        "Group": { "GroupOrderID": 27 },
        "Team1": { "TeamId": 100 },
        "Team2": { "TeamId": 101 },
        "MatchIsFinished": false,
      }
    ];

    spyOn<any>(service, "extractResult")
      .withArgs(argument[0]).and.returnValue([3, 2])
      .withArgs(argument[1]).and.returnValue([0, 0]);

    const expectedValue0: MatchImportData = {
      matchday: argument[0].Group.GroupOrderID,
      matchId: argument[0].MatchID,
      datetime: argument[0].MatchDateTime,
      isFinished: argument[0].MatchIsFinished,
      teamIdHome: argument[0].Team1.TeamId,
      teamIdAway: argument[0].Team2.TeamId,
      goalsHome: 3,
      goalsAway: 2
    };

    const expectedValue1: MatchImportData = {
      matchday: argument[1].Group.GroupOrderID,
      matchId: argument[1].MatchID,
      datetime: argument[1].MatchDateTime,
      isFinished: argument[1].MatchIsFinished,
      teamIdHome: argument[1].Team1.TeamId,
      teamIdAway: argument[1].Team2.TeamId,
      goalsHome: 0,
      goalsAway: 0
    };

    const expectedValue: MatchImportData[] = [expectedValue0, expectedValue1];

    let i: number = 0;
    service["convertMatchdayJson$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue[i++]);
        done();
      }
    );
  });

  it("convertMatchdayJson no matches available", (done: DoneFn) => {
    const argument: any = [];
    const defaultValue: MatchImportData = {
      matchday: -1,
      matchId: -1,
      datetime: "1970-01-01T00:00:00Z",
      isFinished: false,
      teamIdHome: -1,
      teamIdAway: -1,
      goalsHome: -1,
      goalsAway: -1
    };

    let i: number = 0;
    service["convertMatchdayJson$"](argument).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );
  });

  it("convertMatchdayJson received http error as argument", (done: DoneFn) => {
    const argument = new HttpErrorResponse({
      error: 'test error',
      status: 500,
      statusText: 'internal server error'
    });

    const defaultValue: MatchImportData = {
      matchday: -1,
      matchId: -1,
      datetime: "1970-01-01T00:00:00Z",
      isFinished: false,
      teamIdHome: -1,
      teamIdAway: -1,
      goalsHome: -1,
      goalsAway: -1
    };

    let i: number = 0;
    service["convertMatchdayJson$"](argument).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );
  });

  // ---------------------------------------------------------------------------
  // convertTeamJson$
  // ---------------------------------------------------------------------------

  it("convertTeamJson$, teams available", (done: DoneFn) => {
    const argument: any[] = [
      {
        "ShortName": "Kölle",
        "TeamGroupName": null,
        "TeamIconUrl": "https://foo-bar-bla.de/logo_fc.png",
        "TeamId": 65,
        "TeamName": "1. FC Köln"
      },
      {
        "ShortName": "Dortmund",
        "TeamGroupName": null,
        "TeamIconUrl": "https://foo-bar-bla.de/logo_bvb.png",
        "TeamId": 7,
        "TeamName": "BV Borussia Dortmund 09"
      },
      {
        "ShortName": "Freiburch",
        "TeamGroupName": null,
        "TeamIconUrl": "https://foo-bar-bla.de/logo_scf.png",
        "TeamId": 112,
        "TeamName": "SC Freiburg"
      }
    ];

    const expectedValues: number[] = [65, 7, 112];

    let i: number = 0;
    service["convertTeamJson$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it("convertTeamJson$, no ranking available", (done: DoneFn) => {
    const argument: any = [];
    const defaultValue: number = -1;

    let i: number = 0;
    service["convertTeamJson$"](argument).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );
  });

  it("convertTeamJson$, received http error as argument", (done: DoneFn) => {
    const argument = new HttpErrorResponse({
      error: 'test error',
      status: 400,
      statusText: 'bad request'
    });
    const defaultValue: number = -1;

    let i: number = 0;
    service["convertTeamJson$"](argument).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );
  });

  // ---------------------------------------------------------------------------
  // convertRankingJson$
  // ---------------------------------------------------------------------------

  it("convertRankingJson$, ranking available", (done: DoneFn) => {
    const argument: any[] = [
      {
        "Draw": 5,
        "Goals": 92,
        "Lost": 4,
        "Matches": 32,
        "OpponentGoals": 40,
        "Points": 74,
        "TeamInfoId": 40,
        "Won": 23
      },
      {
        "Draw": 7,
        "Goals": 57,
        "Lost": 6,
        "Matches": 32,
        "OpponentGoals": 28,
        "Points": 64,
        "TeamInfoId": 1635,
        "Won": 19
      },
      {
        "Draw": 9,
        "Goals": 57,
        "Lost": 6,
        "Matches": 32,
        "OpponentGoals": 32,
        "Points": 60,
        "TeamInfoId": 131,
        "Won": 17
      }
    ];

    const expectedValues: TeamRankingImportData[] = [
      {
        teamId: 40,
        matches: 32,
        points: 74,
        won: 23,
        draw: 5,
        lost: 4,
        goals: 92,
        goalsAgainst: 40
      },
      {
        teamId: 1635,
        matches: 32,
        points: 64,
        won: 19,
        draw: 7,
        lost: 6,
        goals: 57,
        goalsAgainst: 28
      },
      {
        teamId: 131,
        matches: 32,
        points: 60,
        won: 17,
        draw: 9,
        lost: 6,
        goals: 57,
        goalsAgainst: 32
      }
    ];

    let i: number = 0;
    service["convertRankingJson$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it("convertRankingJson$, no ranking available", (done: DoneFn) => {
    const argument: any = [];
    const defaultValue: TeamRankingImportData = {
      teamId: -1,
      matches: -1,
      points: -1,
      won: -1,
      draw: -1,
      lost: -1,
      goals: -1,
      goalsAgainst: -1
    };

    let i: number = 0;
    service["convertRankingJson$"](argument).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );
  });

  it("convertRankingJson$, received http error as argument", (done: DoneFn) => {
    const argument = new HttpErrorResponse({
      error: 'test error',
      status: 400,
      statusText: 'bad request'
    });
    const defaultValue: TeamRankingImportData = {
      teamId: -1,
      matches: -1,
      points: -1,
      won: -1,
      draw: -1,
      lost: -1,
      goals: -1,
      goalsAgainst: -1
    };

    let i: number = 0;
    service["convertRankingJson$"](argument).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );
  });

  // ---------------------------------------------------------------------------
  // importMatchdata$
  // ---------------------------------------------------------------------------

  it("importMatchdata$, matches available", (done: DoneFn) => {
    const argument1: number = 2020;
    const argument2: number = 27;

    const jsonArray: any[] = [
      {
        "MatchID": 58814,
        "MatchDateTime": "2021-04-03T15:30:00",
        "Group": { "GroupOrderID": 27 },
        "Team1": { "TeamId": 10 },
        "Team2": { "TeamId": 11 },
        "MatchIsFinished": true,
        "MatchResults": [
          { "PointsTeam1": 2, "PointsTeam2": 1, "ResultTypeID": 2 },
          { "PointsTeam1": 2, "PointsTeam2": 0, "ResultTypeID": 1 },
        ],
        "Goals": [
          { "ScoreTeam1": 1, "ScoreTeam2": 0 },
          { "ScoreTeam1": 2, "ScoreTeam2": 0 },
          { "ScoreTeam1": 2, "ScoreTeam2": 1 }
        ]
      },
      {
        "MatchID": 58815,
        "MatchDateTime": "2021-04-03T18:30:00",
        "Group": { "GroupOrderID": 27 },
        "Team1": { "TeamId": 100 },
        "Team2": { "TeamId": 101 },
        "MatchIsFinished": false,
        "MatchResults": [],
        "Goals": []
      }
    ];

    const expectedValues: MatchImportData[] = [
      {
        matchday: 27,
        matchId: 58814,
        datetime: "2021-04-03T15:30:00",
        isFinished: true,
        teamIdHome: 10,
        teamIdAway: 11,
        goalsHome: 2,
        goalsAway: 1
      },
      {
        matchday: 27,
        matchId: 58815,
        datetime: "2021-04-03T18:30:00",
        isFinished: false,
        teamIdHome: 100,
        teamIdAway: 101,
        goalsHome: -1,
        goalsAway: -1
      }
    ];

    httpClientSpy.get.and.returnValue(of(jsonArray));
    spyOn<any>(service, "convertMatchdayJson$").withArgs(jsonArray).and.returnValue(from(expectedValues));

    let i: number = 0;
    service["importMatchdata$"](argument1, argument2).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it("importMatchdata$, no matches available", (done: DoneFn) => {
    const argument1: number = 2022;
    const argument2: number = 16;
    const defaultValue: MatchImportData = {
      matchday: -1,
      matchId: -1,
      datetime: "1970-01-01T00:00:00Z",
      isFinished: false,
      teamIdHome: -1,
      teamIdAway: -1,
      goalsHome: -1,
      goalsAway: -1
    };

    httpClientSpy.get.and.returnValue(of([]));
    spyOn<any>(service, "convertMatchdayJson$").withArgs([]).and.returnValue(from([]));

    let i: number = 0;
    service["importMatchdata$"](argument1, argument2).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );
  });

  // ---------------------------------------------------------------------------
  // importCurrentTeamRanking$
  // ---------------------------------------------------------------------------

  it("importCurrentTeamRanking$, ranking available", (done: DoneFn) => {
    const argument: number = 2020;

    const jsonArray: any[] = [
      {
        "Draw": 5,
        "Goals": 92,
        "Lost": 4,
        "Matches": 32,
        "OpponentGoals": 40,
        "Points": 74,
        "TeamInfoId": 40,
        "Won": 23
      },
      {
        "Draw": 7,
        "Goals": 57,
        "Lost": 6,
        "Matches": 32,
        "OpponentGoals": 28,
        "Points": 64,
        "TeamInfoId": 1635,
        "Won": 19
      },
      {
        "Draw": 9,
        "Goals": 57,
        "Lost": 6,
        "Matches": 32,
        "OpponentGoals": 32,
        "Points": 60,
        "TeamInfoId": 131,
        "Won": 17
      }
    ];

    const expectedValues: TeamRankingImportData[] = [
      {
        teamId: 40,
        matches: 32,
        points: 74,
        won: 23,
        draw: 5,
        lost: 4,
        goals: 92,
        goalsAgainst: 40
      },
      {
        teamId: 1635,
        matches: 32,
        points: 64,
        won: 19,
        draw: 7,
        lost: 6,
        goals: 57,
        goalsAgainst: 28
      },
      {
        teamId: 131,
        matches: 32,
        points: 60,
        won: 17,
        draw: 9,
        lost: 6,
        goals: 57,
        goalsAgainst: 32
      }
    ];

    httpClientSpy.get.and.returnValue(of(jsonArray));
    spyOn<any>(service, "convertRankingJson$").withArgs(jsonArray).and.returnValue(from(expectedValues));

    let i: number = 0;
    service["importCurrentTeamRanking$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it("importCurrentTeamRanking$, ranking not available", (done: DoneFn) => {
    const argument: number = 2022;

    const defaultValue: TeamRankingImportData = {
      teamId: -1,
      matches: -1,
      points: -1,
      won: -1,
      draw: -1,
      lost: -1,
      goals: -1,
      goalsAgainst: -1
    };

    httpClientSpy.get.and.returnValue(of([]));
    spyOn<any>(service, "convertRankingJson$").withArgs([]).and.returnValue(from([]));

    let i: number = 0;
    service["importCurrentTeamRanking$"](argument).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );
  });


  // ---------------------------------------------------------------------------
  // getActiveTeams$
  // ---------------------------------------------------------------------------

  it("getActiveTeams$, teams available", (done: DoneFn) => {
    const argument: number = 2021;

    const jsonArray: any[] = [
      {
        "ShortName": "Kölle",
        "TeamGroupName": null,
        "TeamIconUrl": "https://foo-bar-bla.de/logo_fc.png",
        "TeamId": 65,
        "TeamName": "1. FC Köln"
      },
      {
        "ShortName": "Dortmund",
        "TeamGroupName": null,
        "TeamIconUrl": "https://foo-bar-bla.de/logo_bvb.png",
        "TeamId": 7,
        "TeamName": "BV Borussia Dortmund 09"
      },
      {
        "ShortName": "Freiburch",
        "TeamGroupName": null,
        "TeamIconUrl": "https://foo-bar-bla.de/logo_scf.png",
        "TeamId": 112,
        "TeamName": "SC Freiburg"
      }
    ];

    const expectedValues: number[] = [65, 7, 112];

    httpClientSpy.get.and.returnValue(of(jsonArray));
    spyOn<any>(service, "convertTeamJson$").withArgs(jsonArray).and.returnValue(from(expectedValues));

    let i: number = 0;
    service["getActiveTeams$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });

  it("getActiveTeams$, teams not available", (done: DoneFn) => {
    const argument: number = 2022;

    const defaultValue: number = -1;

    httpClientSpy.get.and.returnValue(of([]));
    spyOn<any>(service, "convertRankingJson$").withArgs([]).and.returnValue(from([]));

    let i: number = 0;
    service["getActiveTeams$"](argument).pipe(
      defaultIfEmpty(defaultValue)).subscribe(
        val => {
          expect(val).toEqual(defaultValue);
          done();
        }
      );
  });

});
