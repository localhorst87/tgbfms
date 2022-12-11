import { describe, it } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import { MatchImportData } from "../src/data_access/import_datastructures";
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
            "MatchID": 58814,
            "MatchDateTimeUTC": "2021-04-03T13:30:00Z",
            "Group": { "GroupOrderID": 27 },
            "Team1": { "TeamId": 10 },
            "Team2": { "TeamId": 11 },
            "MatchResults": [
              { "PointsTeam1": 0, "PointsTeam2": 0, "ResultTypeID": 2 },
              { "PointsTeam1": 0, "PointsTeam2": 0, "ResultTypeID": 1 },
            ],
            "MatchIsFinished": true,
          },
          {
            "MatchID": 58815,
            "MatchDateTimeUTC": "2021-04-03T18:30:00Z",
            "Group": { "GroupOrderID": 27 },
            "Team1": { "TeamId": 20 },
            "Team2": { "TeamId": 21 },
            "MatchResults": [
              { "PointsTeam1": 2, "PointsTeam2": 1, "ResultTypeID": 2 },
              { "PointsTeam1": 2, "PointsTeam2": 0, "ResultTypeID": 1 },
            ],
            "MatchIsFinished": true,
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
          "MatchID": 58814,
          "MatchDateTimeUTC": "2021-04-03T13:30:00Z",
          "Group": { "GroupOrderID": 27 },
          "Team1": { "TeamId": 10 },
          "Team2": { "TeamId": 11 },
          "MatchResults": [
            { "PointsTeam1": 0, "PointsTeam2": 0, "ResultTypeID": 2 },
            { "PointsTeam1": 0, "PointsTeam2": 0, "ResultTypeID": 1 },
          ],
          "MatchIsFinished": true,
        },
        {
          "MatchID": 58815,
          "MatchDateTimeUTC": "2021-04-03T18:30:00Z",
          "Group": { "GroupOrderID": 27 },
          "Team1": { "TeamId": 20 },
          "Team2": { "TeamId": 21 },
          "MatchResults": [
            { "PointsTeam1": 2, "PointsTeam2": 1, "ResultTypeID": 2 },
            { "PointsTeam1": 2, "PointsTeam2": 0, "ResultTypeID": 1 },
          ],
          "MatchIsFinished": true,
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
          "MatchID": 58814,
          "MatchDateTimeUTC": "2021-04-03T13:30:00Z",
          "Group": { "GroupOrderID": 27 },
          "Team1": { "TeamId": 10 },
          "Team2": { "TeamId": 11 },
          "MatchResults": [
            { "PointsTeam1": 3, "PointsTeam2": 2, "ResultTypeID": 2 },
            { "PointsTeam1": 2, "PointsTeam2": 1, "ResultTypeID": 1 },
          ],
          "MatchIsFinished": true,
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
          "MatchID": 58814,
          "MatchDateTimeUTC": "2021-04-03T13:30:00Z",
          "Group": { "GroupOrderID": 27 },
          "Team1": { "TeamId": 10 },
          "Team2": { "TeamId": 11 },
          "MatchResults": [
            { "PointsTeam1": 2, "PointsTeam2": 1, "ResultTypeID": 1 },
          ],
          "Goals": [
            { "ScoreTeam1": 1, "ScoreTeam2": 0 }
          ],
          "MatchIsFinished": false,
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
          "MatchID": 58814,
          "MatchDateTimeUTC": "2021-04-03T13:30:00Z",
          "Group": { "GroupOrderID": 27 },
          "Team1": { "TeamId": 10 },
          "Team2": { "TeamId": 11 },
          "MatchResults": [],
          "Goals": [],
          "MatchIsFinished": false,
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
          "MatchID": 58814,
          "MatchDateTimeUTC": "2021-04-03T13:30:00Z",
          "Group": { "GroupOrderID": 27 },
          "Team1": { "TeamId": 10 },
          "Team2": { "TeamId": 11 },
          "MatchIsFinished": false,
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
