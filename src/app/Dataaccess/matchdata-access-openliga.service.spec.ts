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

    const argument: any = { "matchDateTime": "2021-04-03T15:30:00" };
    jasmine.clock().mockDate(new Date(argument.matchDateTime));
    jasmine.clock().tick(10);

    const expectedValue: boolean = true;
    expect(service["isMatchStarted"](argument)).toBe(expectedValue);

    jasmine.clock().uninstall();
  });

  it("isMatchStarted, time now lower", () => {
    jasmine.clock().install();

    const argument: any = { "matchDateTime": "2021-04-03T15:30:00" };
    jasmine.clock().mockDate(new Date(argument.matchDateTime));
    jasmine.clock().tick(-10);

    const expectedValue: boolean = false;
    expect(service["isMatchStarted"](argument)).toBe(expectedValue);

    jasmine.clock().uninstall();
  });

  it("isMatchStarted, time now equal", () => {
    jasmine.clock().install();

    const argument: any = { "matchDateTime": "2021-04-03T15:30:00" };
    jasmine.clock().mockDate(new Date(argument.matchDateTime));

    const expectedValue: boolean = true;
    expect(service["isMatchStarted"](argument)).toBe(expectedValue);

    jasmine.clock().uninstall();
  });

  it("isMatchStarted, corrupt format", () => {
    const argument: any = { "matchDateTime": "2021-0403T15:30:00" };
    const expectedValue: boolean = false;
    expect(service["isMatchStarted"](argument)).toBe(expectedValue);
  });

  // ---------------------------------------------------------------------------
  // extractResult
  // ---------------------------------------------------------------------------

  it("extractResult, MatchResult and goals available, match not yet started", () => {
    spyOn<any>(service, "isMatchStarted").and.returnValue(false);
    const argument: any = {
      "matchResults": [
        { "pointsTeam1": 2, "pointsTeam2": 1, "resultTypeID": 2 },
        { "pointsTeam1": 2, "pointsTeam2": 0, "resultTypeID": 1 },
      ],
      "goals": [
        { "scoreTeam1": 1, "scoreTeam2": 0 },
        { "scoreTeam1": 2, "scoreTeam2": 0 },
        { "scoreTeam1": 2, "scoreTeam2": 1 }
      ]
    };
    const expectedValue: number[] = [-1, -1];
    expect(service["extractResult"](argument)).toEqual(expectedValue);
  });

  it("extractResult, MatchResult and goals available, match started", () => {
    spyOn<any>(service, "isMatchStarted").and.returnValue(true);
    const argument: any = {
      "matchResults": [
        { "pointsTeam1": 2, "pointsTeam2": 1, "resultTypeID": 2 },
        { "pointsTeam1": 2, "pointsTeam2": 0, "resultTypeID": 1 },
      ],
      "goals": [
        { "scoreTeam1": 1, "scoreTeam2": 0 },
        { "scoreTeam1": 2, "scoreTeam2": 0 },
        { "scoreTeam1": 2, "scoreTeam2": 1 }
      ]
    };
    const expectedValue: number[] = [2, 1];
    expect(service["extractResult"](argument)).toEqual(expectedValue);
  });

  it("extractResult, only goals available, match started", () => {
    spyOn<any>(service, "isMatchStarted").and.returnValue(true);
    const argument: any = {
      "matchResults": [],
      "goals": [
        { "scoreTeam1": 1, "scoreTeam2": 0 },
        { "scoreTeam1": 2, "scoreTeam2": 0 },
        { "scoreTeam1": 2, "scoreTeam2": 1 }
      ]
    };
    const expectedValue: number[] = [2, 1];
    expect(service["extractResult"](argument)).toEqual(expectedValue);
  });

  it("extractResult, only matchResults available, match started", () => {
    spyOn<any>(service, "isMatchStarted").and.returnValue(true);
    const argument: any = {
      "matchResults": [
        { "pointsTeam1": 2, "pointsTeam2": 1, "resultTypeID": 2 },
        { "pointsTeam1": 2, "pointsTeam2": 0, "resultTypeID": 1 },
      ],
      "goals": []
    };
    const expectedValue: number[] = [2, 1];
    expect(service["extractResult"](argument)).toEqual(expectedValue);
  });

  it("extractResult, ResultTypeId==1 and goals available, match started", () => {
    spyOn<any>(service, "isMatchStarted").and.returnValue(true);
    const argument: any = {
      "matchResults": [
        { "pointsTeam1": 0, "pointsTeam2": 0, "resultTypeID": 1 },
      ],
      "goals": [
        { "scoreTeam1": 1, "scoreTeam2": 0 }
      ]
    };
    const expectedValue: number[] = [1, 0];
    expect(service["extractResult"](argument)).toEqual(expectedValue);
  });

  it("extractResult, nor matchResults, nor goals available, match started", () => {
    spyOn<any>(service, "isMatchStarted").and.returnValue(true);
    const argument: any = {
      "matchResults": [],
      "goals": []
    };
    const expectedValue: number[] = [0, 0];
    expect(service["extractResult"](argument)).toEqual(expectedValue);
  });

  it("extractResult, nor matchResults, nor goals available, match not started", () => {
    spyOn<any>(service, "isMatchStarted").and.returnValue(false);
    const argument: any = {
      "matchResults": [],
      "goals": []
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
        "matchID": 58814,
        "matchDateTime": "2021-04-03T15:30:00",
        "group": { "groupOrderID": 27 },
        "team1": { "teamId": 10 },
        "team2": { "teamId": 11 },
        "matchIsFinished": true,
      },
      {
        "matchID": 58815,
        "matchDateTime": "2021-04-03T18:30:00",
        "group": { "groupOrderID": 27 },
        "team1": { "teamId": 100 },
        "team2": { "teamId": 101 },
        "matchIsFinished": false,
      }
    ];

    spyOn<any>(service, "extractResult")
      .withArgs(argument[0]).and.returnValue([3, 2])
      .withArgs(argument[1]).and.returnValue([0, 0]);

    const expectedValue0: MatchImportData = {
      matchday: argument[0].group.groupOrderID,
      matchId: argument[0].matchID,
      datetime: argument[0].matchDateTime,
      isFinished: argument[0].matchIsFinished,
      teamIdHome: argument[0].team1.teamId,
      teamIdAway: argument[0].team2.teamId,
      goalsHome: 3,
      goalsAway: 2
    };

    const expectedValue1: MatchImportData = {
      matchday: argument[1].group.groupOrderID,
      matchId: argument[1].matchID,
      datetime: argument[1].matchDateTime,
      isFinished: argument[1].matchIsFinished,
      teamIdHome: argument[1].team1.teamId,
      teamIdAway: argument[1].team2.teamId,
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
        "shortName": "Kölle",
        "teamgroupName": null,
        "teamIconUrl": "https://foo-bar-bla.de/logo_fc.png",
        "teamId": 65,
        "teamName": "1. FC Köln"
      },
      {
        "shortName": "Dortmund",
        "teamgroupName": null,
        "teamIconUrl": "https://foo-bar-bla.de/logo_bvb.png",
        "teamId": 7,
        "teamName": "BV Borussia Dortmund 09"
      },
      {
        "shortName": "Freiburch",
        "teamgroupName": null,
        "teamIconUrl": "https://foo-bar-bla.de/logo_scf.png",
        "teamId": 112,
        "teamName": "SC Freiburg"
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
        "draw": 5,
        "goals": 92,
        "lost": 4,
        "matches": 32,
        "opponentGoals": 40,
        "points": 74,
        "teamInfoId": 40,
        "won": 23
      },
      {
        "draw": 7,
        "goals": 57,
        "lost": 6,
        "matches": 32,
        "opponentGoals": 28,
        "points": 64,
        "teamInfoId": 1635,
        "won": 19
      },
      {
        "draw": 9,
        "goals": 57,
        "lost": 6,
        "matches": 32,
        "opponentGoals": 32,
        "points": 60,
        "teamInfoId": 131,
        "won": 17
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
  // convertCurrentMatchdayJson$
  // ---------------------------------------------------------------------------

  it("convertCurrentMatchdayJson$, received http error as argument", (done: DoneFn) => {
    const argument = new HttpErrorResponse({
      error: 'test error',
      status: 400,
      statusText: 'bad request'
    });
    const expectedValue: number = -1;

    let i: number = 0;
    service["convertCurrentMatchdayJson$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
        done();
      }
    );
  });

  it("convertCurrentMatchdayJson$, received values", (done: DoneFn) => {
    const argument: any = {
      "groupID": 38202,
      "groupName": "26. Spieltag",
      "groupOrderID": 26
    };

    const expectedValue: number = 26;

    let i: number = 0;
    service["convertCurrentMatchdayJson$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValue);
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
        "matchID": 58814,
        "matchDateTime": "2021-04-03T15:30:00",
        "group": { "groupOrderID": 27 },
        "team1": { "teamId": 10 },
        "team2": { "teamId": 11 },
        "matchIsFinished": true,
        "matchResults": [
          { "pointsTeam1": 2, "pointsTeam2": 1, "resultTypeID": 2 },
          { "pointsTeam1": 2, "pointsTeam2": 0, "resultTypeID": 1 },
        ],
        "goals": [
          { "scoreTeam1": 1, "scoreTeam2": 0 },
          { "scoreTeam1": 2, "scoreTeam2": 0 },
          { "scoreTeam1": 2, "scoreTeam2": 1 }
        ]
      },
      {
        "matchID": 58815,
        "matchDateTime": "2021-04-03T18:30:00",
        "group": { "groupOrderID": 27 },
        "team1": { "teamId": 100 },
        "team2": { "teamId": 101 },
        "matchIsFinished": false,
        "matchResults": [],
        "goals": []
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
        "draw": 5,
        "goals": 92,
        "lost": 4,
        "matches": 32,
        "opponentGoals": 40,
        "points": 74,
        "teamInfoId": 40,
        "won": 23
      },
      {
        "draw": 7,
        "goals": 57,
        "lost": 6,
        "matches": 32,
        "opponentGoals": 28,
        "points": 64,
        "teamInfoId": 1635,
        "won": 19
      },
      {
        "draw": 9,
        "goals": 57,
        "lost": 6,
        "matches": 32,
        "opponentGoals": 32,
        "points": 60,
        "teamInfoId": 131,
        "won": 17
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
        "shortName": "Kölle",
        "teamgroupName": null,
        "teamIconUrl": "https://foo-bar-bla.de/logo_fc.png",
        "teamId": 65,
        "teamName": "1. FC Köln"
      },
      {
        "shortName": "Dortmund",
        "teamgroupName": null,
        "teamIconUrl": "https://foo-bar-bla.de/logo_bvb.png",
        "teamId": 7,
        "teamName": "BV Borussia Dortmund 09"
      },
      {
        "shortName": "Freiburch",
        "teamgroupName": null,
        "teamIconUrl": "https://foo-bar-bla.de/logo_scf.png",
        "teamId": 112,
        "teamName": "SC Freiburg"
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
