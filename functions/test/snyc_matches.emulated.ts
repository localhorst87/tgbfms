import { describe, it } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import * as sync_matches from "../src/sync_matches";
import { NUMBER_OF_TEAMS } from "../../src/app/Businessrules/rule_defined_values";
import * as appdata from "../src/data_access/appdata_access";
// import * as matchdata from "../src/data_access/matchdata_access";
// import * as util from "../src/util";
import { Match } from "../../src/app/Businessrules/basic_datastructures";
import { UpdateTime } from "../src/data_access/import_datastructures";

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
    let updatedMatchdays = await sync_matches.updateMatchdays(2021, [1, 2]);

    expect(updatedMatchdays).to.deep.equal([]);
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
    });

    let updatedMatchdays = await sync_matches.updateMatchdays(2021, [1, 2]);

    // request updated data
    let updateTime1: UpdateTime = await appdata.getLastUpdateTime(2021, 1);
    let updateTime2: UpdateTime = await appdata.getLastUpdateTime(2021, 2);
    let updatedMatch: Match = await appdata.getMatch(60851);

    expect(updatedMatchdays).to.deep.equal([1]);
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
    });

    let updatedMatchdays = await sync_matches.updateMatchdays(2021, [1, 2]);

    // request updated data
    let updateTime1: UpdateTime = await appdata.getLastUpdateTime(2021, 1);
    let updateTime2: UpdateTime = await appdata.getLastUpdateTime(2021, 2);
    let updatedMatch: Match = await appdata.getMatch(60851);

    expect(updatedMatchdays).to.deep.equal([1]);
    expect(updatedMatch.teamIdHome).to.not.equal(-1);
    expect(updateTime1.timestamp > testStartTime).to.be.true;
    expect(updateTime2.timestamp < testStartTime).to.be.true;
  });

});
