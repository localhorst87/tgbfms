import { describe, it } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import * as sync_matches from "../src/sync_matchplan/sync_matchplan";
import * as sync_matches_helpers from "../src/sync_matchplan/sync_matchplan_helpers";
import * as appdata from "../src/data_access/appdata_access";
import * as matchdata from "../src/data_access/matchdata_access";
import * as util from "../src/util";
import { Match } from "../../src/app/Businessrules/basic_datastructures";
import { MatchImportData, SyncPhase } from "../src/data_access/import_datastructures";

describe('sync_matchplan', () => {

  describe("MatchList", () => {

    describe("constructor", () => {
  
      it("constructor => expect season property to be set", () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
  
        expect(matchList.season).to.equal(2022);
      });
  
      it("constructor => expect matches property to be an empty array", () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
  
        expect(matchList.matches).to.deep.equal([]);
      });
  
    });
  
    describe("fillMatchList", () => {
  
      var sandbox: any;
      var allMatches: Match[] = [
        {
          documentId: "0ncSX1D6CH4mKg3wRfYr",
          season: 2022,
          matchday: 1,
          matchId: 1001,
          timestamp: 1234567890,
          isFinished: false,
          isTopMatch: true,
          teamIdHome: 200,
          teamIdAway: 100,
          goalsHome: 0,
          goalsAway: 1
        },
        {
          documentId: "9cKcskEZ3nqlzMaALDtZ",
          season: 2022,
          matchday: 1,
          matchId: 1000,
          timestamp: 1234567890,
          isFinished: false,
          isTopMatch: false,
          teamIdHome: 20,
          teamIdAway: 10,
          goalsHome: 2,
          goalsAway: 1
        }
      ];
  
      beforeEach(() => {
        sandbox = sinon.createSandbox();
      });
  
      afterEach(() => {
        sandbox.restore();
      });
  
      it("appdata resolves => expect Match array to copy into matches property", async () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
  
        sandbox.stub(appdata, "getAllMatches").resolves(allMatches);
        await matchList.fillMatchList();
  
        expect(matchList.matches).to.deep.equal(allMatches);
      });
  
      it("appdata rejects => expect empty matches property", async () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
  
        sandbox.stub(appdata, "getAllMatches").rejects();
        await matchList.fillMatchList();
  
        expect(matchList.matches).to.deep.equal([]);
      });
  
    });
  
    describe("getPendingMatchdays", () => {
  
      var allMatches: Match[] = [
        {
          documentId: "0ncSX1D6CH4mKg3wRfYr",
          season: 2022,
          matchday: 1,
          matchId: 1001,
          timestamp: 1234567890,
          isFinished: true,
          isTopMatch: true,
          teamIdHome: 200,
          teamIdAway: 100,
          goalsHome: 0,
          goalsAway: 1
        },
        {
          documentId: "6ncSX1DzT5mKg3wRfYr",
          season: 2022,
          matchday: 1,
          matchId: 1002,
          timestamp: 1234567890,
          isFinished: true,
          isTopMatch: true,
          teamIdHome: 210,
          teamIdAway: 110,
          goalsHome: 4,
          goalsAway: 1
        },
        {
          documentId: "9cKcskEZ3nqlzMaALDtZ",
          season: 2022,
          matchday: 2,
          matchId: 1000,
          timestamp: 1234567890,
          isFinished: true,
          isTopMatch: false,
          teamIdHome: 20,
          teamIdAway: 10,
          goalsHome: 2,
          goalsAway: 1
        },
        {
          documentId: "45tzskEZ3nqlzMaALDtZ",
          season: 2022,
          matchday: 3,
          matchId: 1004,
          timestamp: 1234567890,
          isFinished: true,
          isTopMatch: false,
          teamIdHome: 26,
          teamIdAway: 16,
          goalsHome: 2,
          goalsAway: 2
        }
      ];
  
      it("no matches available => expect to return empty array ", () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
  
        let pendingMatches: number[] = matchList.getPendingMatchdays();
  
        expect(pendingMatches).to.deep.equal([]);
      });
  
      it("all matches finished => expect to return empty array ", () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
        matchList["_matches"] = allMatches;
  
        let pendingMatches: number[] = matchList.getPendingMatchdays();
  
        expect(pendingMatches).to.deep.equal([]);
      });
  
      it("one match not finished => expect this matchday to be pending", () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
        matchList["_matches"] = allMatches;
        matchList["_matches"][0].isFinished = false;
  
        let pendingMatches: number[] = matchList.getPendingMatchdays();
  
        expect(pendingMatches).to.deep.equal([1]);
      });
  
      it("many matches not finished => expect many matchdays pending", () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
        matchList["_matches"] = allMatches;
        matchList["_matches"][0].isFinished = false;
        matchList["_matches"][2].isFinished = false;
        matchList["_matches"][3].isFinished = false;
  
        let pendingMatches: number[] = matchList.getPendingMatchdays();
  
        expect(pendingMatches).to.deep.equal([1, 2, 3]);
      });
  
    });
  
    describe("getIncompleteMatchdays", () => {
  
      var sandbox: any;
      var allMatches: Match[] = [
        {
          documentId: "0ncSX1D6CH4mKg3wRfYr",
          season: 2022,
          matchday: 1,
          matchId: 1001,
          timestamp: 1234567890,
          isFinished: true,
          isTopMatch: true,
          teamIdHome: 200,
          teamIdAway: 100,
          goalsHome: 0,
          goalsAway: 1
        },
        {
          documentId: "6ncSX1DzT5mKg3wRfYr",
          season: 2022,
          matchday: 1,
          matchId: 1002,
          timestamp: 1234567890,
          isFinished: true,
          isTopMatch: true,
          teamIdHome: 210,
          teamIdAway: 110,
          goalsHome: 2,
          goalsAway: 1
        },
        {
          documentId: "9cKcskEZ3nqlzMaALDtZ",
          season: 2022,
          matchday: 2,
          matchId: 1000,
          timestamp: 1234567890,
          isFinished: true,
          isTopMatch: false,
          teamIdHome: 20,
          teamIdAway: 10,
          goalsHome: 1,
          goalsAway: 1
        },
        {
          documentId: "45tzskEZ3nqlzMaALDtZ",
          season: 2022,
          matchday: 2,
          matchId: 1004,
          timestamp: 1234567890,
          isFinished: true,
          isTopMatch: false,
          teamIdHome: 26,
          teamIdAway: 16,
          goalsHome: 0,
          goalsAway: 3
        },
        {
          documentId: "q5ttvdEZ3nqlzMaALDtZ",
          season: 2022,
          matchday: 3,
          matchId: 1007,
          timestamp: 1234567890,
          isFinished: true,
          isTopMatch: false,
          teamIdHome: 29,
          teamIdAway: 996,
          goalsHome: 2,
          goalsAway: 0
        },
        {
          documentId: "gTztvdEZ3nqlzMaALDtZ",
          season: 2022,
          matchday: 3,
          matchId: 1009,
          timestamp: 1234567890,
          isFinished: true,
          isTopMatch: false,
          teamIdHome: 259,
          teamIdAway: 46,
          goalsHome: 0,
          goalsAway: 0
        }
      ];
  
      var allMatchdays: number[] = [];
      for (let i = 1; i <= 34; i++) {
        allMatchdays.push(i);
      } // [1, 2, 3, ..., 32, 33, 34]
  
      beforeEach(() => {
        sandbox = sinon.createSandbox();
      });
  
      afterEach(() => {
        sandbox.restore();
      });
  
      it("no matches available => expect all matchdays to be incomplete", () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
  
        let incompleteMatchdays: number[] = matchList.getIncompleteMatchdays();
  
        expect(incompleteMatchdays).to.deep.equal(allMatchdays);
      });
  
      it("only matches from 1,2,3 available => expect all matchdays except 1,2,3 to be incomplete", () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
        matchList["_matches"] = allMatches;
        sandbox.stub(sync_matches_helpers.MatchList, 'MATCHES_PER_DAY').value(2);
  
        let incompleteMatchdays: number[] = matchList.getIncompleteMatchdays();
        let expectedValue: number[] = allMatchdays.slice(3); // [4, 5, 6, ..., 33, 34]
  
        expect(incompleteMatchdays).to.deep.equal(expectedValue);
      });
  
      it("matches from 1, 2 complete, from 3 incomplete, rest not available  => expect all matchdays except 1,2 to be incomplete", () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
        matchList["_matches"] = allMatches.slice(0, -1); // cut last match
        sandbox.stub(sync_matches_helpers.MatchList, 'MATCHES_PER_DAY').value(2);
  
        let incompleteMatchdays: number[] = matchList.getIncompleteMatchdays();
        let expectedValue: number[] = allMatchdays.slice(2); // [3, 4, 5, ..., 33, 34]
  
        expect(incompleteMatchdays).to.deep.equal(expectedValue);
      });
  
    });
  
    describe("getNextMatches", () => {
  
      var clock: any;
      var allMatches: Match[] = [
        {
          documentId: "0ncSX1D6CH4mKg3wRfYr",
          season: 2022,
          matchday: 1,
          matchId: 999,
          timestamp: 1663957800, // 2022-09-23T18:30Z
          isFinished: true,
          isTopMatch: true,
          teamIdHome: 97,
          teamIdAway: 45,
          goalsHome: 0,
          goalsAway: 1
        },
        {
          documentId: "0ncSX1D6CH4mKg3wRfYr",
          season: 2022,
          matchday: 1,
          matchId: 1000,
          timestamp: 1664037000, // 2022-09-24T16:30Z
          isFinished: true,
          isTopMatch: true,
          teamIdHome: 90,
          teamIdAway: 570,
          goalsHome: 3,
          goalsAway: 0
        },
        {
          documentId: "0ncSX1D6CH4mKg3wRfYr",
          season: 2022,
          matchday: 1,
          matchId: 1001,
          timestamp: 1664112600, // 2022-09-25T13:30Z
          isFinished: false,
          isTopMatch: true,
          teamIdHome: 200,
          teamIdAway: 100,
          goalsHome: 1,
          goalsAway: 1
        },
        {
          documentId: "6ncSX1DzT5mKg3wRfYr",
          season: 2022,
          matchday: 1,
          matchId: 1002,
          timestamp: 1664119800, // 2022-09-25T15:30Z
          isFinished: false,
          isTopMatch: true,
          teamIdHome: 210,
          teamIdAway: 110,
          goalsHome: 4,
          goalsAway: 2
        },
      ];
  
      afterEach(() => {
        clock.restore();
      });
  
      it("get next matches, days = 0 => expect matches of the same day", () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
        matchList["_matches"] = allMatches;
        clock = sinon.useFakeTimers(new Date("2022-09-23T08:00Z"));
  
        const nextMatches = matchList.getNextMatches(0);
  
        expect(nextMatches).to.deep.equal(allMatches.slice(0, 1));
      });
  
      it("get next matches, days = 1 => expect matches of the same and next day", () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
        matchList["_matches"] = allMatches;
        clock = sinon.useFakeTimers(new Date("2022-09-23T08:00Z"));
  
        const nextMatches = matchList.getNextMatches(1);
  
        expect(nextMatches).to.deep.equal(allMatches.slice(0, 2));
      });
  
      it("get next matches, days = 1 => expect matches of the same and next day and not the passed day", () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
        matchList["_matches"] = allMatches;
        clock = sinon.useFakeTimers(new Date("2022-09-24T08:00Z"));
  
        const nextMatches = matchList.getNextMatches(1);
  
        expect(nextMatches).to.deep.equal(allMatches.slice(1, 4));
      });
  
    });
  
  });
  
  describe("createSyncPhases", () => {
  
    it("no matches => expect empty array", () => {
      let syncPhases: SyncPhase[] = sync_matches.createSyncPhases([]);
  
      expect(syncPhases).to.deep.equal([]);
    });
  
    it("many matches parallel => expect to subsum matches with same start", () => {
      let nextMatches: Match[] = [
        {
          documentId: "0ncSX1D6CH4mKg3wRfYr",
          season: 2022,
          matchday: 1,
          matchId: 999,
          timestamp: 1664044200, // 2022-09-24T18:30Z
          isFinished: false,
          isTopMatch: true,
          teamIdHome: 97,
          teamIdAway: 45,
          goalsHome: 0,
          goalsAway: 1
        },
        {
          documentId: "0ncSX1D6CH4mKg3wRfYr",
          season: 2022,
          matchday: 1,
          matchId: 1000,
          timestamp: 1664112600, // 2022-09-25T13:30Z
          isFinished: false,
          isTopMatch: true,
          teamIdHome: 90,
          teamIdAway: 570,
          goalsHome: 0,
          goalsAway: 1
        },
        {
          documentId: "0ncSX1D6CH4mKg3wRfYr",
          season: 2022,
          matchday: 1,
          matchId: 1001,
          timestamp: 1664112600, // 2022-09-25T13:30Z
          isFinished: false,
          isTopMatch: true,
          teamIdHome: 200,
          teamIdAway: 100,
          goalsHome: 1,
          goalsAway: 1
        },
        {
          documentId: "0ncSX1D6CH4mKg3wRfYr",
          season: 2022,
          matchday: 1,
          matchId: 1002,
          timestamp: 1664119800, // 2022-09-25T15:30Z
          isFinished: false,
          isTopMatch: true,
          teamIdHome: 120,
          teamIdAway: 678,
          goalsHome: 5,
          goalsAway: 1
        },
        {
          documentId: "6ncSX1DzT5mKg3wRfYr",
          season: 2022,
          matchday: 1,
          matchId: 1003,
          timestamp: 1664119800, // 2022-09-25T15:30Z
          isFinished: false,
          isTopMatch: true,
          teamIdHome: 210,
          teamIdAway: 110,
          goalsHome: 2,
          goalsAway: 3
        },
        {
          documentId: "6ncSX1DzT5mKg3wRfYr",
          season: 2022,
          matchday: 1,
          matchId: 1004,
          timestamp: 1664119800, // 2022-09-25T15:30Z
          isFinished: false,
          isTopMatch: true,
          teamIdHome: 904,
          teamIdAway: 112,
          goalsHome: 1,
          goalsAway: 2
        },
      ];
  
      let expectedResult: SyncPhase[] = [
        {
          documentId: "",
          start: 1664044200,
          matchIds: [999],
        },
        {
          documentId: "",
          start: 1664112600,
          matchIds: [1000, 1001]
        },
        {
          documentId: "",
          start: 1664119800,
          matchIds: [1002, 1003, 1004]
        }
      ];
  
      let syncPhases: SyncPhase[] = sync_matches.createSyncPhases(nextMatches);
  
      expect(syncPhases).to.deep.equal(expectedResult);
    });
  
  });
  
  describe("getMatchdaysToUpdate", () => {
  
    var sandbox: any;
  
    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });
  
    afterEach(() => {
      sandbox.restore();
    });
  
    describe("data comes as expected", () => {
  
      it("only pending matchdays => return matchdays, where new data is available", async () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
  
        sandbox.stub(matchList, "fillMatchList").resolves();
        sandbox.stub(matchList, "getIncompleteMatchdays").returns([]);
        sandbox.stub(matchList, "getPendingMatchdays").returns([33, 34]);
        sandbox.stub(appdata, "getLastUpdateTime")
          .withArgs(2022, 33).resolves({
            documentId: "2022_33",
            season: 2022,
            matchday: 34,
            timestamp: 12345
          })
          .withArgs(2022, 34).resolves({
            documentId: "2022_34",
            season: 2022,
            matchday: 34,
            timestamp: 12000
          });
        sandbox.stub(matchdata, "getLastUpdateTime")
          .withArgs(2022, 33).resolves(12345)
          .withArgs(2022, 34).resolves(12345);
  
        let toUpdate: number[] = await sync_matches.getMatchdaysToUpdate(matchList);
  
        expect(toUpdate).to.deep.equal([34]);
      });
  
      it("pending and incomplete matchdays => return incomplete matchdays, and where new data is available", async () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
  
        sandbox.stub(matchList, "fillMatchList").resolves();
        sandbox.stub(matchList, "getIncompleteMatchdays").returns([33]);
        sandbox.stub(matchList, "getPendingMatchdays").returns([33, 34]);
        sandbox.stub(appdata, "getLastUpdateTime")
          .withArgs(2022, 33).resolves({
            documentId: "2022_33",
            season: 2022,
            matchday: 33,
            timestamp: 12345
          })
          .withArgs(2022, 34).resolves({
            documentId: "2022_34",
            season: 2022,
            matchday: 34,
            timestamp: 12000
          });
        sandbox.stub(matchdata, "getLastUpdateTime")
          .withArgs(2022, 33).resolves(12345)
          .withArgs(2022, 34).resolves(12345);
  
        let toUpdate: number[] = await sync_matches.getMatchdaysToUpdate(matchList);
  
        expect(toUpdate).to.deep.equal([33, 34]);
      });
  
      it("only incomplete matchdays => return incomplete matchdays", async () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
  
        sandbox.stub(matchList, "fillMatchList").resolves();
        sandbox.stub(matchList, "getIncompleteMatchdays").returns([31, 32, 33, 34]);
        sandbox.stub(matchList, "getPendingMatchdays").returns([]);
  
        let toUpdate: number[] = await sync_matches.getMatchdaysToUpdate(matchList);
  
        expect(toUpdate).to.deep.equal([31, 32, 33, 34]);
      });
  
    });
  
    describe("data unavailability", () => {
  
      it("appdata not available => expect to add corresponding matchday", async () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
  
        sandbox.stub(matchList, "fillMatchList").resolves();
        sandbox.stub(matchList, "getIncompleteMatchdays").returns([]);
        sandbox.stub(matchList, "getPendingMatchdays").returns([33, 34]);
        sandbox.stub(appdata, "getLastUpdateTime")
          .withArgs(2022, 33).resolves({
            documentId: "2022_33",
            season: 2022,
            matchday: 33,
            timestamp: -1
          })
          .withArgs(2022, 34).resolves({
            documentId: "2022_34",
            season: 2022,
            matchday: 34,
            timestamp: 12345
          });
        sandbox.stub(matchdata, "getLastUpdateTime")
          .withArgs(2022, 33).resolves(12345)
          .withArgs(2022, 34).resolves(12345);
  
        let toUpdate: number[] = await sync_matches.getMatchdaysToUpdate(matchList);
  
        expect(toUpdate).to.deep.equal([33]);
      });
  
      it("matchdata not available => expect not to add corresponding matchdays", async () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
  
        sandbox.stub(matchList, "fillMatchList").resolves();
        sandbox.stub(matchList, "getIncompleteMatchdays").returns([]);
        sandbox.stub(matchList, "getPendingMatchdays").returns([33, 34]);
        sandbox.stub(appdata, "getLastUpdateTime")
          .withArgs(2022, 33).resolves({
            documentId: "2022_33",
            season: 2022,
            matchday: 33,
            timestamp: 12345
          })
          .withArgs(2022, 34).resolves({
            documentId: "2022_34",
            season: 2022,
            matchday: 34,
            timestamp: 12345
          });
        sandbox.stub(matchdata, "getLastUpdateTime")
          .withArgs(2022, 33).resolves(-1)
          .withArgs(2022, 34).resolves(-1);
  
        let toUpdate: number[] = await sync_matches.getMatchdaysToUpdate(matchList);
  
        expect(toUpdate).to.deep.equal([]);
      });
  
      it("matchdata and appdata not available => expect not to add corresponding matchdays", async () => {
        let matchList = new sync_matches_helpers.MatchList(2022);
  
        sandbox.stub(matchList, "fillMatchList").resolves();
        sandbox.stub(matchList, "getIncompleteMatchdays").returns([]);
        sandbox.stub(matchList, "getPendingMatchdays").returns([33, 34]);
        sandbox.stub(appdata, "getLastUpdateTime")
          .withArgs(2022, 33).resolves({
            documentId: "2022_33",
            season: 2022,
            matchday: 33,
            timestamp: -1
          })
          .withArgs(2022, 34).resolves({
            documentId: "2022_34",
            season: 2022,
            matchday: 34,
            timestamp: -1
          });
        sandbox.stub(matchdata, "getLastUpdateTime")
          .withArgs(2022, 33).resolves(-1)
          .withArgs(2022, 34).resolves(-1);
  
        let toUpdate: number[] = await sync_matches.getMatchdaysToUpdate(matchList);
  
        expect(toUpdate).to.deep.equal([]);
      });
  
    });
  
  });
  
  describe("updateMatchdays", () => {
  
    describe("data comes as expected", () => {
  
      var sandbox: any;
  
      beforeEach(() => {
        sandbox = sinon.createSandbox();
      });
  
      afterEach(() => {
        sandbox.restore();
      });
  
      var importMatchData25: MatchImportData[] = [{
        season: 2021,
        matchday: 25,
        matchId: 251,
        datetime: "2022-03-05T14:30:00Z",
        isFinished: true,
        teamIdHome: 2511,
        teamIdAway: 2512,
        goalsHome: 1,
        goalsAway: 0
      },
      {
        season: 2021,
        matchday: 25,
        matchId: 252,
        datetime: "2022-03-05T17:30:00Z",
        isFinished: false,
        teamIdHome: 2521,
        teamIdAway: 2522,
        goalsHome: 2,
        goalsAway: 3
      }];
  
      var importMatchData26: MatchImportData[] = [{
        season: 2021,
        matchday: 26,
        matchId: 261,
        datetime: "2022-03-12T14:30:00Z",
        isFinished: false,
        teamIdHome: 2611,
        teamIdAway: 2612,
        goalsHome: -1,
        goalsAway: -1
      },
      {
        season: 2021,
        matchday: 26,
        matchId: 262,
        datetime: "2022-03-12T14:30:00Z",
        isFinished: false,
        teamIdHome: 2621,
        teamIdAway: 2622,
        goalsHome: -1,
        goalsAway: -1
      }];
  
      var importAppData251: Match = {
        documentId: "251_id",
        season: 2021,
        matchday: 25,
        matchId: 251,
        timestamp: 1646490600,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 2511,
        teamIdAway: 2512,
        goalsHome: 1,
        goalsAway: 0
      };
      var importAppData252: Match = {
        documentId: "252_id",
        season: 2021,
        matchday: 25,
        matchId: 252,
        timestamp: 1646501400,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 2521,
        teamIdAway: 2522,
        goalsHome: 2,
        goalsAway: 3
      };
      var importAppData261: Match = {
        documentId: "261_id",
        season: 2021,
        matchday: 26,
        matchId: 261,
        timestamp: 1647095400,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 2611,
        teamIdAway: 2612,
        goalsHome: -1,
        goalsAway: -1
      };
      var importAppData262: Match = {
        documentId: "262_id",
        season: 2021,
        matchday: 26,
        matchId: 262,
        timestamp: 1647095400,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 2621,
        teamIdAway: 2622,
        goalsHome: -1,
        goalsAway: -1
      };
  
      it("one match of one matchday to be updated, update successful => expect setMatch to be called once", async () => {
        sandbox.stub(matchdata, "importMatchdata")
          .withArgs(2021, 25).resolves(importMatchData25)
          .withArgs(2021, 26).resolves(importMatchData26);
  
        sandbox.stub(appdata, "getMatch")
          .withArgs(251).resolves(importAppData251)
          .withArgs(252).resolves(importAppData252)
          .withArgs(261).resolves(importAppData261)
          .withArgs(262).resolves(importAppData262);
  
        let setMatchSpy: any = sandbox.stub(appdata, "setMatch").resolves(true);
  
        sandbox.stub(appdata, "getLastUpdateTime")
          .withArgs(2021, 25).resolves({
            documentId: "2022_25",
            season: 2021,
            matchday: 25,
            timestamp: 1002003004,
          })
          .withArgs(2021, 26).resolves({
            documentId: "2022_26",
            season: 2021,
            matchday: 26,
            timestamp: 1002003004,
          });
  
        sandbox.stub(util, "getCurrentTimestamp").returns(1234567890);
        sandbox.stub(appdata, "setUpdateTime").resolves(true);
  
        let syncedMatches: Match[] = await sync_matches.updateMatchdays(2021, [25, 26]);
  
        sinon.assert.calledOnce(setMatchSpy);
        expect(syncedMatches.length).to.equal(1); 
      });
  
      it("one match of one matchday to be updated, update successful => expect setUpdateTime to be called once", async () => {
        sandbox.stub(matchdata, "importMatchdata")
          .withArgs(2021, 25).resolves(importMatchData25)
          .withArgs(2021, 26).resolves(importMatchData26);
  
        sandbox.stub(appdata, "getMatch")
          .withArgs(251).resolves(importAppData251)
          .withArgs(252).resolves(importAppData252)
          .withArgs(261).resolves(importAppData261)
          .withArgs(262).resolves(importAppData262);
  
        sandbox.stub(appdata, "setMatch").resolves(true);
        sandbox.stub(appdata, "getLastUpdateTime")
          .withArgs(2021, 25).resolves({
            documentId: "2022_25",
            season: 2021,
            matchday: 25,
            timestamp: 1002003004,
          })
          .withArgs(2021, 26).resolves({
            documentId: "2022_26",
            season: 2021,
            matchday: 26,
            timestamp: 1002003004,
          });
  
        sandbox.stub(util, "getCurrentTimestamp").returns(1234567890);
        let setUpdateTimeSpy: any = sandbox.stub(appdata, "setUpdateTime").resolves();
  
        let syncedMatches: Match[] = await sync_matches.updateMatchdays(2021, [25, 26]);
  
        sinon.assert.calledOnce(setUpdateTimeSpy);
        expect(syncedMatches.length).to.equal(1);
      });
  
      it("one match of one matchday to be updated, update not successful => expect setUpdateTime not to be called", async () => {
        sandbox.stub(matchdata, "importMatchdata")
          .withArgs(2021, 25).resolves(importMatchData25)
          .withArgs(2021, 26).resolves(importMatchData26);
  
        sandbox.stub(appdata, "getMatch")
          .withArgs(251).resolves(importAppData251)
          .withArgs(252).resolves(importAppData252)
          .withArgs(261).resolves(importAppData261)
          .withArgs(262).resolves(importAppData262);
  
        sandbox.stub(appdata, "setMatch").onFirstCall().resolves(false);
  
        sandbox.stub(appdata, "getLastUpdateTime")
          .withArgs(2021, 25).resolves({
            documentId: "2022_25",
            season: 2021,
            matchday: 25,
            timestamp: 1002003004,
          })
          .withArgs(2021, 26).resolves({
            documentId: "2022_26",
            season: 2021,
            matchday: 26,
            timestamp: 1002003004,
          });
  
        sandbox.stub(util, "getCurrentTimestamp").returns(1234567890);
        let setUpdateTimeSpy: any = sandbox.stub(appdata, "setUpdateTime").resolves();
  
        let syncedMatches: Match[] = await sync_matches.updateMatchdays(2021, [25, 26]);
  
        sinon.assert.notCalled(setUpdateTimeSpy);
        expect(syncedMatches.length).to.equal(0);
      });
  
      it("both matches of one matchday to be updated, update of one match not successful => expect setUpdateTime not to be called", async () => {
        importMatchData25[1].isFinished = true; // change also second match
  
        sandbox.stub(matchdata, "importMatchdata")
          .withArgs(2021, 25).resolves(importMatchData25)
          .withArgs(2021, 26).resolves(importMatchData26);
  
        sandbox.stub(appdata, "getMatch")
          .withArgs(251).resolves(importAppData251)
          .withArgs(252).resolves(importAppData252)
          .withArgs(261).resolves(importAppData261)
          .withArgs(262).resolves(importAppData262);
  
        sandbox.stub(appdata, "setMatch")
          .onFirstCall().resolves(true)
          .onSecondCall().resolves(false);
  
        sandbox.stub(appdata, "getLastUpdateTime")
          .withArgs(2021, 25).resolves({
            documentId: "2022_25",
            season: 2021,
            matchday: 25,
            timestamp: 1002003004,
          })
          .withArgs(2021, 26).resolves({
            documentId: "2022_26",
            season: 2021,
            matchday: 26,
            timestamp: 1002003004,
          });
  
        sandbox.stub(util, "getCurrentTimestamp").returns(1234567890);
        let setUpdateTimeSpy: any = sandbox.stub(appdata, "setUpdateTime").resolves();
  
        let syncedMatches: Match[] = await sync_matches.updateMatchdays(2021, [25, 26]);
  
        sinon.assert.notCalled(setUpdateTimeSpy);
        expect(syncedMatches.length).to.equal(1);
      });
  
      it("both matchdays to be updated, update of one match not successful => expect setUpdateTime to be called once", async () => {
        importMatchData25[1].isFinished = true;
        importMatchData26[0].isFinished = true;
  
        sandbox.stub(matchdata, "importMatchdata")
          .withArgs(2021, 25).resolves(importMatchData25)
          .withArgs(2021, 26).resolves(importMatchData26);
  
        sandbox.stub(appdata, "getMatch")
          .withArgs(251).resolves(importAppData251)
          .withArgs(252).resolves(importAppData252)
          .withArgs(261).resolves(importAppData261)
          .withArgs(262).resolves(importAppData262);
  
        sandbox.stub(appdata, "setMatch")
          .onFirstCall().resolves(true)
          .onSecondCall().resolves(false)
          .resolves(true);
  
        sandbox.stub(appdata, "getLastUpdateTime")
          .withArgs(2021, 25).resolves({
            documentId: "2022_25",
            season: 2021,
            matchday: 25,
            timestamp: 1002003004,
          })
          .withArgs(2021, 26).resolves({
            documentId: "2022_26",
            season: 2021,
            matchday: 26,
            timestamp: 1002003004,
          });
  
        sandbox.stub(util, "getCurrentTimestamp").returns(1234567890);
        let setUpdateTimeSpy: any = sandbox.stub(appdata, "setUpdateTime").resolves();
  
        let syncedMatches: Match[] = await sync_matches.updateMatchdays(2021, [25, 26]);
  
        sinon.assert.calledOnce(setUpdateTimeSpy);
        expect(syncedMatches.length).to.equal(2);
      });
  
    });
  
    describe("data unavailability", () => {
  
      var sandbox: any;
  
      beforeEach(() => {
        sandbox = sinon.createSandbox();
      });
  
      afterEach(() => {
        sandbox.restore();
      });
  
      var importMatchData25: MatchImportData[] = [{
        season: 2021,
        matchday: 25,
        matchId: 251,
        datetime: "2022-03-05T14:30:00Z",
        isFinished: false,
        teamIdHome: 2511,
        teamIdAway: 2512,
        goalsHome: 1,
        goalsAway: 0
      },
      {
        season: 2021,
        matchday: 25,
        matchId: 252,
        datetime: "2022-03-05T17:30:00Z",
        isFinished: false,
        teamIdHome: 2521,
        teamIdAway: 2522,
        goalsHome: 2,
        goalsAway: 3
      }];
  
      var importMatchData26: MatchImportData[] = [{
        season: 2021,
        matchday: 26,
        matchId: 261,
        datetime: "2022-03-12T14:30:00Z",
        isFinished: false,
        teamIdHome: 2611,
        teamIdAway: 2612,
        goalsHome: -1,
        goalsAway: -1
      },
      {
        season: 2021,
        matchday: 26,
        matchId: 262,
        datetime: "2022-03-12T14:30:00Z",
        isFinished: false,
        teamIdHome: 2621,
        teamIdAway: 2622,
        goalsHome: -1,
        goalsAway: -1
      }];
  
      var importAppData252: Match = {
        documentId: "252_id",
        season: 2021,
        matchday: 25,
        matchId: 252,
        timestamp: 1646501400,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 2521,
        teamIdAway: 2522,
        goalsHome: 2,
        goalsAway: 3
      };
      var importAppData261: Match = {
        documentId: "261_id",
        season: 2021,
        matchday: 26,
        matchId: 261,
        timestamp: 1647095400,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 2611,
        teamIdAway: 2612,
        goalsHome: -1,
        goalsAway: -1
      };
      var importAppData262: Match = {
        documentId: "262_id",
        season: 2021,
        matchday: 26,
        matchId: 262,
        timestamp: 1647095400,
        isFinished: false,
        isTopMatch: false,
        teamIdHome: 2621,
        teamIdAway: 2622,
        goalsHome: -1,
        goalsAway: -1
      };
  
      it("imported matchdata empty => expect to do nothing", async () => {
        sandbox.stub(matchdata, "importMatchdata").resolves([]);
        let setUpdateTimeSpy: any = sandbox.stub(appdata, "setUpdateTime").resolves();
        let setMatchSpy: any = sandbox.stub(appdata, "setMatch").resolves(true);
  
        let syncedMatches: Match[] = await sync_matches.updateMatchdays(2021, [25, 26]);
  
        sinon.assert.notCalled(setUpdateTimeSpy);
        sinon.assert.notCalled(setMatchSpy);
        expect(syncedMatches.length).to.equal(0);
      });
  
      it("one match from appdata not available => expect to update this matchday", async () => {
        sandbox.stub(matchdata, "importMatchdata")
          .withArgs(2021, 25).resolves(importMatchData25)
          .withArgs(2021, 26).resolves(importMatchData26);
  
        sandbox.stub(appdata, "getMatch")
          .withArgs(251).resolves({
            documentId: "",
            season: -1,
            matchday: -1,
            matchId: 251,
            timestamp: -1,
            isFinished: false,
            isTopMatch: false,
            teamIdHome: -1,
            teamIdAway: -1
          }) // unknown match
          .withArgs(252).resolves(importAppData252)
          .withArgs(261).resolves(importAppData261)
          .withArgs(262).resolves(importAppData262);
  
        let setMatchSpy: any = sandbox.stub(appdata, "setMatch").resolves(true);
  
        sandbox.stub(appdata, "getLastUpdateTime")
          .withArgs(2021, 25).resolves({
            documentId: "2022_25",
            season: 2021,
            matchday: 25,
            timestamp: 1002003004,
          })
          .withArgs(2021, 26).resolves({
            documentId: "2022_26",
            season: 2021,
            matchday: 26,
            timestamp: 1002003004,
          });
  
        sandbox.stub(util, "getCurrentTimestamp").returns(1234567890);
        sandbox.stub(appdata, "setUpdateTime").resolves(true);
  
        let syncedMatches: Match[] = await sync_matches.updateMatchdays(2021, [25, 26]);
  
        sinon.assert.calledOnce(setMatchSpy);
        expect(syncedMatches.length).to.equal(1);
      });
  
    });
  
  });

});