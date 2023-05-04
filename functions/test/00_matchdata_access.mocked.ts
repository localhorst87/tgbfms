import { describe, it } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import { MatchImportData, TeamRankingImportData } from "../src/data_access/import_datastructures";
import * as matchdata_access from "../src/data_access/matchdata_access";
import * as matchdata_helpers from "../src/data_access/matchdata_helpers";
import * as util from "../src/util";
import axios from 'axios';

describe("getLastUpdateTime", () => {

  describe("mocked http service", () => {

    var sandbox: any;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("Promise resolves and yields data (200) => expect converted timestamp", async () => {
      sandbox.stub(axios, "get").resolves({
        status: 200,
        data: "2022-05-06T18:30:00Z"
      }); // equals timestamp 1651861800

      let updateTime: number = await matchdata_access.getLastUpdateTime(2021, 32);
      expect(updateTime).to.equal(1651861800);
    });

    it("Promise resolves and yields internal server error (500) => expect -1", async () => {
      sandbox.stub(axios, "get").resolves({
        status: 500,
        data: {}
      });

      let updateTime: number = await matchdata_access.getLastUpdateTime(2021, 32);
      expect(updateTime).to.equal(-1);
    });

    it("Promise rejects => expect -1", async () => {
      sandbox.stub(axios, "get").rejects("any error");

      let updateTime: number = await matchdata_access.getLastUpdateTime(2021, 32);
      expect(updateTime).to.equal(-1);
    });

  });

  describe("end-to-end-test with real http service", async () => {

    it("Request existing data => expect converted timestamp", async () => {
      let updateTime: number = await matchdata_access.getLastUpdateTime(2021, 32);
      // 2022-05-02T22:23:54.503 should be returned, which equals unix timestamp 1651523034
      expect(updateTime).to.equal(1651523034);
    });

    it("Request unlogical data => expect -1", async () => {
      let updateTime: number = await matchdata_access.getLastUpdateTime(2021, 35);
      // Only 34 matchdays available
      expect(updateTime).to.equal(-1);
    });

    it("Request future data => expect -1", async () => {
      let updateTime: number = await matchdata_access.getLastUpdateTime(2090, 17);
      // Only 34 matchdays available
      expect(updateTime).to.equal(-1);
    });

  });

});

describe("importMatchdata", () => {

  describe("mocked http service", () => {

    var sandbox: any;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("Promise resolves and yields data (200) => expect MatchImportData", async () => {
      sandbox.stub(axios, "get").resolves({
        status: 200,
        data: [
          {
            "matchID": 58814,
            "matchDateTimeUTC": "2021-04-03T13:30:00Z",
            "group": { "groupOrderID": 27 },
            "team1": { "teamId": 10 },
            "team2": { "teamId": 11 },
            "matchResults": [
              { "pointsTeam1": 0, "pointsTeam2": 0, "resultTypeID": 2 },
              { "pointsTeam1": 0, "pointsTeam2": 0, "resultTypeID": 1 },
            ],
            "matchIsFinished": true,
          },
          {
            "matchID": 58815,
            "matchDateTimeUTC": "2021-04-03T18:30:00Z",
            "group": { "groupOrderID": 27 },
            "team1": { "teamId": 20 },
            "team2": { "teamId": 21 },
            "matchResults": [
              { "pointsTeam1": 2, "pointsTeam2": 1, "resultTypeID": 2 },
              { "pointsTeam1": 2, "pointsTeam2": 0, "resultTypeID": 1 },
            ],
            "matchIsFinished": true,
          }
        ]
      });

      let expectedResult: MatchImportData[] = [
        {
          season: 2021,
          matchday: 27,
          matchId: 58814,
          datetime: "2021-04-03T13:30:00Z",
          isFinished: true,
          teamIdHome: 10,
          teamIdAway: 11,
          goalsHome: 0,
          goalsAway: 0
        },
        {
          season: 2021,
          matchday: 27,
          matchId: 58815,
          datetime: "2021-04-03T18:30:00Z",
          isFinished: true,
          teamIdHome: 20,
          teamIdAway: 21,
          goalsHome: 2,
          goalsAway: 1
        },
      ];

      let importData: MatchImportData[] = await matchdata_access.importMatchdata(2021, 32);
      expect(importData).to.deep.equal(expectedResult);
    });

    it("Promise resolves and yields internal server error (500) => expect empty array", async () => {
      sandbox.stub(axios, "get").resolves({
        status: 500,
        data: {}
      });

      let importData: MatchImportData[] = await matchdata_access.importMatchdata(2021, 32);
      expect(importData).to.deep.equal([]);
    });

    it("Promise rejects => expect empty array", async () => {
      sandbox.stub(axios, "get").rejects("any error");

      let importData: MatchImportData[] = await matchdata_access.importMatchdata(2021, 32);
      expect(importData).to.deep.equal([]);
    });

  });

  describe("end-to-end-test with real http service", async () => {

    it("Request existing data => expect converted MatchImportData", async () => {
      let importData: MatchImportData[] = await matchdata_access.importMatchdata(2021, 32);
      let expectedFirstResult: MatchImportData = {
        season: 2021,
        matchday: 32,
        matchId: 61132,
        datetime: "2022-04-29T18:30:00Z",
        isFinished: true,
        teamIdHome: 80,
        teamIdAway: 115,
        goalsHome: 1,
        goalsAway: 1
      };

      expect(importData.length).to.equal(9);
      expect(importData[0]).to.deep.equal(expectedFirstResult);
    });

    it("Request unlogical data => expect empty array", async () => {
      let importData: MatchImportData[] = await matchdata_access.importMatchdata(2021, 35);
      // Only 34 matchdays available

      expect(importData).to.deep.equal([]);
    });

    it("Request future data => expect empty array", async () => {
      let importData: MatchImportData[] = await matchdata_access.importMatchdata(2090, 17);
      // Only 34 matchdays available

      expect(importData).to.deep.equal([]);
    });

  });

});

describe("convertUpdateTime", () => {

  describe("unexpected argument", () => {

    it("argument has other representation than date string => expect -1", () => {
      let updateTime: string = "{2022-05-06T18:30:00}";

      expect(matchdata_helpers.convertUpdateTime(updateTime)).to.equal(-1);
    });

    it("argument is not a string => expect -1", () => {
      let updateTime: any = { "date": "2022-05-06T18:30:00" };

      expect(matchdata_helpers.convertUpdateTime(updateTime)).to.equal(-1);
    });

    it("argument is empty string => expect -1", () => {
      let updateTime: string = "";

      expect(matchdata_helpers.convertUpdateTime(updateTime)).to.equal(-1);
    });

  });

  describe("expected arguments", () => {

    var sandbox: any;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("date string straight in UTC => expect valid conversion", () => {
      let updateTime: string = "2022-05-06T18:30:00Z"; // 1651861800

      expect(matchdata_helpers.convertUpdateTime(updateTime)).to.equal(1651861800);
    });

    it("date string given in CET w/o DST => expect Date to be called with +01:00", () => {
      sandbox.stub(util, "isDstObserved").returns(false);
      let dateMock = { getTime: () => -1 };
      let dateStub = sandbox.stub(global, "Date").returns(dateMock);

      let updateTime: string = "2022-05-06T19:30:00";
      matchdata_helpers.convertUpdateTime(updateTime);

      expect(dateStub.calledWith("2022-05-06T19:30:00+01:00")).to.be.true;
    });

    it("date string given in CET with DST => expect Date to be called with +02:00", () => {
      sandbox.stub(util, "isDstObserved").returns(true);
      let dateMock = { getTime: () => -1 };
      let dateStub = sandbox.stub(global, "Date").returns(dateMock);

      let updateTime: string = "2022-05-06T20:30:00";
      matchdata_helpers.convertUpdateTime(updateTime);

      expect(dateStub.calledWith("2022-05-06T20:30:00+02:00")).to.be.true;
    });

    it("date string given in CET => expect same timestamp as UTC w/o offset", () => {
      sandbox.stub(util, "isDstObserved").returns(true);

      let updateTime: string = "2022-05-06T20:30:00"; // +02:00
      let utcResult: number = (new Date("2022-05-06T18:30:00Z")).getTime() / 1000;

      expect(matchdata_helpers.convertUpdateTime(updateTime)).to.equal(utcResult);
    });

  });

});

describe("convertMatchdayJson", () => {

  describe("unexpected arguments", () => {

    it("empty object => expect empty array", () => {
      let matchdayJson: any = {};

      expect(matchdata_helpers.convertMatchdayJson(matchdayJson, 2021)).to.deep.equal([]);
    });

    it("empty array => expect empty array", () => {
      let matchdayJson: any = [];

      expect(matchdata_helpers.convertMatchdayJson(matchdayJson, 2021)).to.deep.equal([]);
    });

    it("empty string => expect empty array", () => {
      let matchdayJson: string = "";

      expect(matchdata_helpers.convertMatchdayJson(matchdayJson, 2021)).to.deep.equal([]);
    });

  });

  describe("expected arguments", () => {

    var sandbox: any;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("multiple match imports => expect to return multiple matches", () => {
      let matchdayJson: any = [
        {
          "matchID": 58814,
          "matchDateTimeUTC": "2021-04-03T13:30:00Z",
          "group": { "groupOrderID": 27 },
          "team1": { "teamId": 10 },
          "team2": { "teamId": 11 },
          "matchResults": [
            { "pointsTeam1": 0, "pointsTeam2": 0, "resultTypeID": 2 },
            { "pointsTeam1": 0, "pointsTeam2": 0, "resultTypeID": 1 },
          ],
          "matchIsFinished": true,
        },
        {
          "matchID": 58815,
          "matchDateTimeUTC": "2021-04-03T18:30:00Z",
          "group": { "groupOrderID": 27 },
          "team1": { "teamId": 20 },
          "team2": { "teamId": 21 },
          "matchResults": [
            { "pointsTeam1": 2, "pointsTeam2": 1, "resultTypeID": 2 },
            { "pointsTeam1": 2, "pointsTeam2": 0, "resultTypeID": 1 },
          ],
          "matchIsFinished": true,
        }
      ];

      sandbox.useFakeTimers((new Date("2021-04-03T20:30:00Z")).getTime());

      let expectedResult: MatchImportData[] = [
        {
          season: 2021,
          matchday: 27,
          matchId: 58814,
          datetime: "2021-04-03T13:30:00Z",
          isFinished: true,
          teamIdHome: 10,
          teamIdAway: 11,
          goalsHome: 0,
          goalsAway: 0
        },
        {
          season: 2021,
          matchday: 27,
          matchId: 58815,
          datetime: "2021-04-03T18:30:00Z",
          isFinished: true,
          teamIdHome: 20,
          teamIdAway: 21,
          goalsHome: 2,
          goalsAway: 1
        },
      ];

      expect(matchdata_helpers.convertMatchdayJson(matchdayJson, 2021)).to.deep.equal(expectedResult);
    });

    it("match started and final result available => expect to extract final results", () => {
      let matchdayJson: any = [
        {
          "matchID": 58814,
          "matchDateTimeUTC": "2021-04-03T13:30:00Z",
          "group": { "groupOrderID": 27 },
          "team1": { "teamId": 10 },
          "team2": { "teamId": 11 },
          "matchResults": [
            { "pointsTeam1": 3, "pointsTeam2": 2, "resultTypeID": 2 },
            { "pointsTeam1": 2, "pointsTeam2": 1, "resultTypeID": 1 },
          ],
          "matchIsFinished": true,
        }
      ];

      sandbox.useFakeTimers((new Date("2021-04-03T15:30:00Z")).getTime());

      let expectedResult: MatchImportData[] = [
        {
          season: 2021,
          matchday: 27,
          matchId: 58814,
          datetime: "2021-04-03T13:30:00Z",
          isFinished: true,
          teamIdHome: 10,
          teamIdAway: 11,
          goalsHome: 3,
          goalsAway: 2
        }
      ];

      expect(matchdata_helpers.convertMatchdayJson(matchdayJson, 2021)).to.deep.equal(expectedResult);
    });

    it("match started and only half-time result available. Goal entries available => expect to extract live score", () => {
      let matchdayJson: any = [
        {
          "matchID": 58814,
          "matchDateTimeUTC": "2021-04-03T13:30:00Z",
          "group": { "groupOrderID": 27 },
          "team1": { "teamId": 10 },
          "team2": { "teamId": 11 },
          "matchResults": [
            { "pointsTeam1": 2, "pointsTeam2": 1, "resultTypeID": 1 },
          ],
          "goals": [
            { "scoreTeam1": 1, "scoreTeam2": 0 }
          ],
          "matchIsFinished": false,
        }
      ];

      sandbox.useFakeTimers((new Date("2021-04-03T14:30:00Z")).getTime());

      let expectedResult: MatchImportData[] = [
        {
          season: 2021,
          matchday: 27,
          matchId: 58814,
          datetime: "2021-04-03T13:30:00Z",
          isFinished: false,
          teamIdHome: 10,
          teamIdAway: 11,
          goalsHome: 1,
          goalsAway: 0
        }
      ];

      expect(matchdata_helpers.convertMatchdayJson(matchdayJson, 2021)).to.deep.equal(expectedResult);
    });

    it("match started. No goal entries available => expect to extract 0:0", () => {
      let matchdayJson: any = [
        {
          "matchID": 58814,
          "matchDateTimeUTC": "2021-04-03T13:30:00Z",
          "group": { "groupOrderID": 27 },
          "team1": { "teamId": 10 },
          "team2": { "teamId": 11 },
          "matchResults": [],
          "goals": [],
          "matchIsFinished": false,
        }
      ];

      sandbox.useFakeTimers((new Date("2021-04-03T13:31:00Z")).getTime());

      let expectedResult: MatchImportData[] = [
        {
          season: 2021,
          matchday: 27,
          matchId: 58814,
          datetime: "2021-04-03T13:30:00Z",
          isFinished: false,
          teamIdHome: 10,
          teamIdAway: 11,
          goalsHome: 0,
          goalsAway: 0
        }
      ];

      expect(matchdata_helpers.convertMatchdayJson(matchdayJson, 2021)).to.deep.equal(expectedResult);
    });

    it("match not started => expect -1 for goal properties", () => {
      let matchdayJson: any = [
        {
          "matchID": 58814,
          "matchDateTimeUTC": "2021-04-03T13:30:00Z",
          "group": { "groupOrderID": 27 },
          "team1": { "teamId": 10 },
          "team2": { "teamId": 11 },
          "matchIsFinished": false,
        }
      ];

      sandbox.useFakeTimers((new Date("2021-04-03T13:29:00Z")).getTime());

      let expectedResult: MatchImportData[] = [
        {
          season: 2021,
          matchday: 27,
          matchId: 58814,
          datetime: "2021-04-03T13:30:00Z",
          isFinished: false,
          teamIdHome: 10,
          teamIdAway: 11,
          goalsHome: -1,
          goalsAway: -1
        }
      ];

      expect(matchdata_helpers.convertMatchdayJson(matchdayJson, 2021)).to.deep.equal(expectedResult);
    });

  });

});

describe('importCurrentTeamRanking', () => {

  describe('mocked http service', () => {

    var sandbox: any;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Promise resolves and yields data (200) => expect TeamRankingImportData', async () => {
      sandbox.stub(axios, "get").resolves({
        status: 200,
        data: [
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
        ]
      });

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

      const importedData: TeamRankingImportData[] = await matchdata_access.importCurrentTeamRanking(2021);
      expect(importedData).to.deep.equal(expectedValues);      
    });

    it('Promise resolves and yields internal server error (500) => expect empty array', async () => {
      sandbox.stub(axios, "get").resolves({
        status: 500,
        data: "internal server error"
      });

      const importedData: TeamRankingImportData[] = await matchdata_access.importCurrentTeamRanking(2021);
      expect(importedData).to.deep.equal([]);      
    });

    it('Promise rejects => expect empty array', async () => {
      sandbox.stub(axios, "get").rejects("any error");

      const importedData: TeamRankingImportData[] = await matchdata_access.importCurrentTeamRanking(2021);
      expect(importedData).to.deep.equal([]);
    });

  });

  describe("end-to-end-test with real http service", async () => {

    it("Request existing data => expect converted TeamRankingImportData", async () => {
      const importData: TeamRankingImportData[] = await matchdata_access.importCurrentTeamRanking(2021);
      const expectedFirstResult: TeamRankingImportData = {
        teamId: 40,
        matches: 34,
        points: 77,
        won: 24,
        draw: 5,
        lost: 5,
        goals: 97,
        goalsAgainst: 37
      };

      const expectedLastResult: TeamRankingImportData = {
        teamId: 115,
        matches: 34,
        points: 18,
        won: 3,
        draw: 9,
        lost: 22,
        goals: 28,
        goalsAgainst: 82
      };

      expect(importData.length).to.equal(18);
      expect(importData[0]).to.deep.equal(expectedFirstResult);
      expect(importData[importData.length - 1]).to.deep.equal(expectedLastResult);
    });

    it("Request non existing data => expect empty array", async () => {
      const importedData: TeamRankingImportData[] = await matchdata_access.importCurrentTeamRanking(1871);

      expect(importedData).to.deep.equal([]);
    });

    it("Request future data => expect empty array", async () => {
      const importedData: TeamRankingImportData[] = await matchdata_access.importCurrentTeamRanking(2090);

      expect(importedData).to.deep.equal([]);
    });

  });

})

// describe("getLastUpdateTime", () => {
//   var sandbox: any;
//
//   beforeEach(() => {
//     sandbox = sinon.createSandbox();
//   });
//
//   afterEach(() => {
//     sandbox.restore();
//   });
//
//   it("...", async () => {
//     sandbox.stub(axios, "get").resolves({
//       status: 200,
//       data: "2022-05-06T18:30:00Z"
//     }); // equals timestamp 1651861800
//
//     // sandbox.useFakeTimers((new Date("1987-09-25T09:30:00")).getTime());
//
//     let updateTime: number = await getLastUpdateTime(2021, 32);
//     expect(updateTime).to.equal(1651861800);
//   });
//
// });
