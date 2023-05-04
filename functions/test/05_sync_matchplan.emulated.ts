import { describe, it } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import * as sync_matches from "../src/sync_matchplan";
import { NUMBER_OF_TEAMS } from "../../src/app/Businessrules/rule_defined_values";
import * as appdata from "../src/data_access/appdata_access";
import { Match } from "../../src/app/Businessrules/basic_datastructures";
import { SyncPhase, UpdateTime } from "../src/data_access/import_datastructures";

describe('sync_matchplan', () => {

  describe("MatchList, end-to-end tests", () => {

    describe("fillMatchList", () => {
  
      var sandbox: any;
      const MOCKED_MATCHDAYS_PER_SEASON = 3;
      const MATCHES_PER_MATCHDAY = Math.floor(NUMBER_OF_TEAMS / 2);
  
      beforeEach(() => {
        sandbox = sinon.createSandbox();
      });
  
      afterEach(() => {
        sandbox.restore();
      });
  
      it("request matches, matches are available => expect to receive all matches", async () => {
        sandbox.stub(sync_matches.MatchList, 'MATCHDAYS_PER_SEASON').value(MOCKED_MATCHDAYS_PER_SEASON);
        let matchList = new sync_matches.MatchList(2021);
  
        // await matchList.fillMatchList();
        await matchList.fillMatchList();
  
        const expectedNumOfMatches = MOCKED_MATCHDAYS_PER_SEASON * MATCHES_PER_MATCHDAY;
  
        expect(matchList.matches.length).to.equal(expectedNumOfMatches);
      });
  
      it("request matches, no matches available => expect to receive nothing", async () => {
        let matchList = new sync_matches.MatchList(2025);
  
        await matchList.fillMatchList();
  
        expect(matchList.matches.length).to.equal(0);
      });
  
    });
  
  });
  
  describe("getMatchdaysToUpdate, end-to-end test", () => {
    const MOCKED_MATCHDAYS_PER_SEASON = 3;
    var sandbox: any;
  
    before(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(sync_matches.MatchList, 'MATCHDAYS_PER_SEASON').value(MOCKED_MATCHDAYS_PER_SEASON);
    });
  
    beforeEach(async () => {
      // change a Match in the app database, so that this Match will be identified as pending match
      await appdata.setMatch({
        documentId: "0089BQGd9WtsTGETSFsf",
        season: 2021,
        matchday: 1,
        matchId: 60851,
        timestamp: 1628947800,
        isFinished: false, // before: true
        isTopMatch: false,
        teamIdHome: 16,
        teamIdAway: 115,
        goalsHome: 5,
        goalsAway: 1
      });
    });
  
    afterEach(async () => {
      // reset to original value
      await appdata.setMatch({
        documentId: "0089BQGd9WtsTGETSFsf",
        season: 2021,
        matchday: 1,
        matchId: 60851,
        timestamp: 1628947800,
        isFinished: true,
        isTopMatch: false,
        teamIdHome: 16,
        teamIdAway: 115,
        goalsHome: 5,
        goalsAway: 1
      });
    });
  
    after(() => {
      sandbox.restore();
    });
  
    it("one matchday pending and newer data available => expect to be updated", async () => {
      // change the last update time to an OLDER date, so that the matchday is identified to be updated
      await appdata.setUpdateTime({
        documentId: "7AUFFurUslTErUacAd0U",
        season: 2021,
        matchday: 1,
        timestamp: 1629391220 // matchdata update time is 1629391221
      });
  
      let matchList = new sync_matches.MatchList(2021);
      await matchList.fillMatchList();
  
      let matchdaysToUpdate = await sync_matches.getMatchdaysToUpdate(matchList);
  
      expect(matchdaysToUpdate).to.deep.equal([1]);
    });
  
    it("one matchday pending but no newer data available => expect not to be updated", async () => {
      // change the last update time to an OLDER date, so that the matchday is identified to be updated
      await appdata.setUpdateTime({
        documentId: "7AUFFurUslTErUacAd0U",
        season: 2021,
        matchday: 1,
        timestamp: 1629391222 // matchdata update time is 1629391221
      });
  
      let matchList = new sync_matches.MatchList(2021);
      await matchList.fillMatchList();
  
      let matchdaysToUpdate = await sync_matches.getMatchdaysToUpdate(matchList);
  
      expect(matchdaysToUpdate).to.deep.equal([]);
    });
  
  });
  
  describe("updateMatchdays, end-to-end test", () => {
    var testStartTime: number;
  
    before(() => {
      let currentDate = new Date();
      testStartTime = currentDate.getTime() / 1000;
    });
  
    it("all matches equal => expect nothing to update", async () => {
      let updatedMatches: Match[] = await sync_matches.updateMatchdays(2021, [1, 2]);
  
      expect(updatedMatches).to.deep.equal([]);
    });
  
    it("one match different => expect to update the according matchday", async () => {
      // change a Match
      await appdata.setMatch({
        documentId: "0089BQGd9WtsTGETSFsf",
        season: 2021,
        matchday: 1,
        matchId: 60851,
        timestamp: 1628947800,
        isFinished: false, // before: true
        isTopMatch: false,
        teamIdHome: 16,
        teamIdAway: 115,
        goalsHome: 5,
        goalsAway: 1
      });
  
      let updatedMatchesReturn = await sync_matches.updateMatchdays(2021, [1, 2]);
  
      // request updated data
      let updateTime1: UpdateTime = await appdata.getLastUpdateTime(2021, 1);
      let updateTime2: UpdateTime = await appdata.getLastUpdateTime(2021, 2);
      let updatedMatch: Match = await appdata.getMatch(60851);
  
      expect(updatedMatchesReturn.length).to.equal(1);
      expect(updatedMatch.isFinished).to.be.true;
      expect(updateTime1.timestamp > testStartTime).to.be.true;
      expect(updateTime2.timestamp < testStartTime).to.be.true;
    });
  
    it("one matchday not complete => expect to update the according matchday", async () => {
      // change season of the Match, so matchday is not complete any more
      await appdata.setMatch({
        documentId: "0089BQGd9WtsTGETSFsf",
        season: 9999, // before: 2021
        matchday: 1,
        matchId: 99999, // before: 60851
        timestamp: 1628947800,
        isFinished: true,
        isTopMatch: false,
        teamIdHome: 16,
        teamIdAway: 115,
        goalsHome: 5,
        goalsAway: 1
      });
  
      let updatedMatches: Match[] = await sync_matches.updateMatchdays(2021, [1, 2]);
  
      // request updated data
      let updateTime1: UpdateTime = await appdata.getLastUpdateTime(2021, 1);
      let updateTime2: UpdateTime = await appdata.getLastUpdateTime(2021, 2);
      let updatedMatch: Match = await appdata.getMatch(60851);
  
      expect(updatedMatches[0].matchId).to.equal(60851);
      expect(updatedMatch.teamIdHome).to.not.equal(-1);
      expect(updateTime1.timestamp > testStartTime).to.be.true;
      expect(updateTime2.timestamp < testStartTime).to.be.true;
    });
  
  });
  
  describe("updateSyncPhases", () => {
    const syncPhases: SyncPhase[] = [
      { documentId: '', start: 1683311400, matchIds: [ 64136, 64142 ] },
      { documentId: '', start: 1683390600, matchIds: [ 64143, 64144 ] },
      { documentId: '', start: 1683473400, matchIds: [ 64137 ] },
    ];
  
    afterEach(() => {
      appdata.deleteSyncPhases(">", 1680000000);
    });
  
    it('no sync phase existing => expect to add new sync phases', async () => {
      await sync_matches.updateSyncPhases(syncPhases);
  
      const allSyncPhases: SyncPhase[] = await appdata.getSyncPhases(">", 1680000000);
      
      expect(allSyncPhases.length).to.equal(3);
    });
  
    it('one sync phase already existing => expect to override sync phase', async () => {
      appdata.setSyncPhase({
        documentId: 'M2e2PeQZgLjnKsulRxYx',
        start: 1683390600,
        matchIds: [ 64143 ] 
      });
  
      await sync_matches.updateSyncPhases(syncPhases);
  
      const allSyncPhases: SyncPhase[] = await appdata.getSyncPhases(">", 1680000000);
      
      expect(allSyncPhases.length).to.equal(3);
      expect(allSyncPhases.filter(sp => sp.start == 1683390600)[0].matchIds).to.deep.equal([ 64143, 64144 ]);
    });
  
  });
  
});