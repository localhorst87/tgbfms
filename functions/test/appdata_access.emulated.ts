import { describe, it } from "mocha";
import { expect } from "chai";
import * as admin from "firebase-admin";
import { Match, SeasonBet, SeasonResult } from "../../src/app/Businessrules/basic_datastructures";
import { UpdateTime, SyncPhase } from "../src/data_access/import_datastructures";
import * as appdata_access from "../src/data_access/appdata_access";

describe("getAllMatches, end-to-end-test", () => {

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

  it("More than one data sample available => expect correct samples in array", async () => {
    let matches = await appdata_access.getAllMatches(2022);

    expect(matches).to.deep.equal(allMatches);
  });

  it("No data samples available => expect empty array", async () => {
    let matches = await appdata_access.getAllMatches(2019);

    expect(matches).to.deep.equal([]);
  });

});

describe("getMatch, end-to-end test", () => {

  var queriedMatch: Match = {
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
  };

  var unknownMatch: Match = {
    documentId: "",
    season: -1,
    matchday: -1,
    matchId: 999,
    timestamp: -1,
    isFinished: false,
    isTopMatch: false,
    teamIdHome: -1,
    teamIdAway: -1,
    goalsHome: 2,
    goalsAway: 1
  };

  it("Match is available => expect correct match to be returned", async () => {
    let match = await appdata_access.getMatch(1001);

    expect(match).to.deep.equal(queriedMatch);
  });

  it("Match is not available => expect unknown Match", async () => {
    let match = await appdata_access.getMatch(999);

    expect(match).to.deep.equal(unknownMatch);
  });

});

describe("setMatch, end-to-end-test", () => {

  it("Match is not yet available => expect to add new dataset", async () => {
    let newMatch: Match = {
      documentId: "",
      season: 2023,
      matchday: 1,
      matchId: 20231,
      timestamp: 1234567890,
      isFinished: false,
      isTopMatch: false,
      teamIdHome: 11,
      teamIdAway: 12,
      goalsHome: -1,
      goalsAway: -1
    };

    await appdata_access.setMatch(newMatch);
    let requestedMatch: Match = await appdata_access.getMatch(20231);

    expect(requestedMatch.documentId).to.not.equal("");
  });

  it("Match is already available => expect to update dataset", async () => {
    let matchToUpdate: Match = {
      documentId: "0ncSX1D6CH4mKg3wRfYr",
      season: 2022,
      matchday: 1,
      matchId: 1001,
      timestamp: 1234567890,
      isFinished: true,
      isTopMatch: true,
      teamIdHome: 200,
      teamIdAway: 100,
      goalsHome: -1,
      goalsAway: -1
    };

    await appdata_access.setMatch(matchToUpdate);
    let requestedMatch: Match = await appdata_access.getMatch(1001);

    expect(requestedMatch).to.deep.equal(matchToUpdate);
  });

});

describe("getLastUpdateTime, end-to-end test", () => {

  var queriedUpdateTime: UpdateTime = {
    documentId: "AXf0qFILTjRoUPccRMv0",
    season: 2022,
    matchday: 1,
    timestamp: 1234567890
  };

  var unknownUpdateTime: UpdateTime = {
    documentId: "",
    season: 2019,
    matchday: 1,
    timestamp: -1
  };

  it("UpdateTime is available => expect correct UpdateTime to be returned", async () => {
    let updateTime = await appdata_access.getLastUpdateTime(2022, 1);

    expect(updateTime).to.deep.equal(queriedUpdateTime);
  });

  it("UpdateTime is not available => expect unknown UpdateTime", async () => {
    let updateTime = await appdata_access.getLastUpdateTime(2019, 1);

    expect(updateTime).to.deep.equal(unknownUpdateTime);
  });

});

describe("setUpdateTime, end-to-end-test", () => {

  it("UpdateTime is not yet available => expect to add new dataset", async () => {
    let newUpdateTime: UpdateTime = {
      documentId: "",
      season: 2023,
      matchday: 1,
      timestamp: 1234567890
    };

    await appdata_access.setUpdateTime(newUpdateTime);
    let requestedUpdateTime: UpdateTime = await appdata_access.getLastUpdateTime(2023, 1);

    expect(requestedUpdateTime.documentId).to.not.equal("");
  });

  it("UpdateTime is already available => expect to update dataset", async () => {
    let updatetimeToUpdate: UpdateTime = {
      documentId: "AXf0qFILTjRoUPccRMv0",
      season: 2022,
      matchday: 1,
      timestamp: 2234567890
    };

    await appdata_access.setUpdateTime(updatetimeToUpdate);
    let requestedUpdateTime: UpdateTime = await appdata_access.getLastUpdateTime(2022, 1);

    expect(requestedUpdateTime).to.deep.equal(updatetimeToUpdate);
  });

});

describe("getSyncPhases, end-to-end test", () => {

  it("get SyncPhases < timestamp, data available => expect two SyncPhases in array", async () => {
    let syncPhases: SyncPhase[] = await appdata_access.getSyncPhases("<", 1629560000);

    expect(syncPhases.length).to.equal(2)
  });

  it("get SyncPhases == timestamp, data available => expect exactly one SyncPhase in array", async () => {
    let syncPhases: SyncPhase[] = await appdata_access.getSyncPhases("==", 1629563400);

    expect(syncPhases.length).to.equal(1)
  });

  it("get SyncPhases > timestamp, data available => expect exactly one SyncPhase in array", async () => {
    let syncPhases: SyncPhase[] = await appdata_access.getSyncPhases(">", 1629550000);

    expect(syncPhases.length).to.equal(2)
  });

  it('get SyncPhases == timestamp, data not available => expect empty array', async () => {
    let syncPhases: SyncPhase[] = await appdata_access.getSyncPhases("==", 1629563401);

    expect(syncPhases).to.deep.equal([]);
  });

});

describe("setSyncPhase, end-to-end test", () => {

  it('SyncPhase not yet available => expect to add new dataset', async () => {
    let syncPhase: SyncPhase = {
      documentId: "",
      start: 1630168200,
      matchIds: [100, 101, 102]
    };

    let syncPhasesBefore: SyncPhase[] = await appdata_access.getSyncPhases("==", syncPhase.start);
    await appdata_access.setSyncPhase(syncPhase);
    let syncPhasesAfter: SyncPhase[] = await appdata_access.getSyncPhases("==", syncPhase.start);

    expect(syncPhasesBefore.length).to.equal(0);
    expect(syncPhasesAfter.length).to.equal(1);
    expect(syncPhasesAfter[0].matchIds).to.deep.equal(syncPhase.matchIds);
  });

  it('SyncPhase already available => expect to update dataset', async () => {
    let syncPhase: SyncPhase = {
      documentId: "SvLk6AqxhbuNO1HPBxuo",
      start: 1629484200,
      matchIds: [60862, 103] // before [60862]
    };

    let syncPhasesBefore: SyncPhase[] = await appdata_access.getSyncPhases("==", syncPhase.start);
    await appdata_access.setSyncPhase(syncPhase);
    let syncPhasesAfter: SyncPhase[] = await appdata_access.getSyncPhases("==", syncPhase.start);

    expect(syncPhasesBefore[0].matchIds).to.deep.equal([60862]);
    expect(syncPhasesAfter[0].matchIds).to.deep.equal(syncPhase.matchIds);
  });

});

describe('deleteSyncPhases, end-to-end-test', () => {

  it('delete a single snyc phase', async () => {
    let snapshotBefore: admin.firestore.DocumentSnapshot = await admin.firestore().collection("sync_phases").doc("SvLk6AqxhbuNO1HPBxuo").get();
    let isDeleted: boolean = await appdata_access.deleteSyncPhases("<", 1629500000);
    let snapshotAfter: admin.firestore.DocumentSnapshot = await admin.firestore().collection("sync_phases").doc("SvLk6AqxhbuNO1HPBxuo").get();

    expect(isDeleted).to.be.true;
    expect(snapshotBefore.exists).to.be.true;
    expect(snapshotAfter.exists).to.be.false;    
  });

  it('delete more than one sync phase', async () => {
    // deletes all other documents!

    let documentsBefore: admin.firestore.DocumentReference[] = await admin.firestore().collection("sync_phases").listDocuments();
    let isDeleted: boolean = await appdata_access.deleteSyncPhases(">", 1629500000);
    let documentsAfter: admin.firestore.DocumentReference[] = await admin.firestore().collection("sync_phases").listDocuments(); 

    expect(isDeleted).to.be.true;
    expect(documentsBefore.length).to.be.above(0);
    expect(documentsAfter.length).to.equal(0);   
  });
  
});

describe('getSeasonBets end-to-end-test', () => {

  var seasonBets01DocumentIds: string[] = [
    "kjwO6cNmT9Hd64fNPbpp",
    "2wCsKzKBaLkqwPrXOw4m",
    "ozPntmiVztdLA1hX7ZxT",
    "cmQcykXjBszjgzazrpx3",
    "AKyUavBoosFJxHMds2Pp"
  ];

  var seasonBets02DocumentIds: string[] = [
    "2wNEqCn803yTmclbbMtf",
    "",
    "",
    "",
    "px5HfGXTFvNu0GuL0x5w"
  ];

  it('bets completely available => expect correct documents ordered by place', async () => {
    const seasonBets: SeasonBet[] = await appdata_access.getSeasonBets(2030, "test_user_01");
    const documentIds: string[] = seasonBets.map((bet: SeasonBet) => bet.documentId);

    expect(documentIds).to.deep.equal(seasonBets01DocumentIds);    
  });

  it('bets completely available => expect correct content', async () => {
    const seasonBets: SeasonBet[] = await appdata_access.getSeasonBets(2030, "test_user_01");

    expect(seasonBets[0]).to.deep.equal({
      documentId: "kjwO6cNmT9Hd64fNPbpp",
      season: 2030,
      userId: "test_user_01",
      isFixed: true,
      place: 1,
      teamId: 101
    });
  });

  it('bets not completely available => expect correct documents ordered by place', async () => {
    const seasonBets: SeasonBet[] = await appdata_access.getSeasonBets(2030, "test_user_02");
    const documentIds: string[] = seasonBets.map((bet: SeasonBet) => bet.documentId);

    expect(documentIds).to.deep.equal(seasonBets02DocumentIds);
  });

  it('bets not completely available => expect correct content', async () => {
    const seasonBets: SeasonBet[] = await appdata_access.getSeasonBets(2030, "test_user_02");

    expect(seasonBets[1]).to.deep.equal({
      documentId: "",
      season: 2030,
      userId: "test_user_02",
      isFixed: false,
      place: 2,
      teamId: -1
    });

    expect(seasonBets[4]).to.deep.equal({
      documentId: "px5HfGXTFvNu0GuL0x5w",
      season: 2030,
      userId: "test_user_02",
      isFixed: false,
      place: -1,
      teamId: 211
    });
  });
  
});

describe('getSeasonResults', () => {

  var seasonResults01DocumentIds: string[] = [
    "PqRwniEdeYUTe6FaLRmH",
    "XhWfwca9T1uwgSXGGLMG",
    "TgxXdgPjEDIGROWZ2PZl",
    "nTpiSFQ8gWAcGbWY6rha",
    "2G56e7q0T64ejEzusCbV"
  ];

  var seasonResults02DocumentIds: string[] = [
    "ExsVpYhPi1bVV8ElqKUo",
    "",
    "",
    "",
    ""
  ];

  it('results completely available => expect correct documents ordered by place', async () => {
    const results: SeasonResult[] = await appdata_access.getSeasonResults(2030);
    const docIds: string[] = results.map((res: SeasonResult) => res.documentId);

    expect(docIds).to.deep.equal(seasonResults01DocumentIds);    
  });

  it('results completely available => expect correct content', async () => {
    const results: SeasonResult[] = await appdata_access.getSeasonResults(2030);

    expect(results[0]).to.deep.equal({
      documentId: "PqRwniEdeYUTe6FaLRmH",
      place: 1,
      season: 2030,
      teamId: 301
    });

    expect(results[4]).to.deep.equal({
      documentId: "2G56e7q0T64ejEzusCbV",
      place: -1,
      season: 2030,
      teamId: 311
    });
  });

  it('results not completely available => expect correct documents ordered by place', async () => {
    const results: SeasonResult[] = await appdata_access.getSeasonResults(2031);
    const docIds: string[] = results.map((res: SeasonResult) => res.documentId);

    expect(docIds).to.deep.equal(seasonResults02DocumentIds);   
  });

  it('results not completely available => expect correct content', async () => {
    const results: SeasonResult[] = await appdata_access.getSeasonResults(2031);   
    
    expect(results[0]).to.deep.equal({
      documentId: "ExsVpYhPi1bVV8ElqKUo",
      place: 1,
      season: 2031,
      teamId: 3001
    });

    expect(results[4]).to.deep.equal({
      documentId: "",
      place: -1,
      season: 2031,
      teamId: -1
    });
  });

});

describe.only('setSeasonResult', () => {

  it('SeasonResult not yet available => expect to add new dataset', async () => {
    let result: SeasonResult = {
      documentId: "",
      season: 2032,
      place: 1,
      teamId: 100
    };

    let seasonResultsBefore: SeasonResult[] = await appdata_access.getSeasonResults(2032);
    await appdata_access.setSeasonResult(result);
    let seasonResultsAfter: SeasonResult[] = await appdata_access.getSeasonResults(2032);

    expect(seasonResultsBefore[0].teamId).to.equal(-1);
    expect(seasonResultsAfter[0].teamId).to.equal(100);    
  });

  it('SeasonResult already available => expect to update dataset', async () => {
    let resultToUpdate: SeasonResult = {
      documentId: "BIkrwJ7F21GGyE4Jq7iz",
      season: 2032,
      place: -1,
      teamId: 19
    };

    let seasonResultsBefore: SeasonResult[] = await appdata_access.getSeasonResults(2032);
    await appdata_access.setSeasonResult(resultToUpdate);
    let seasonResultsAfter: SeasonResult[] = await appdata_access.getSeasonResults(2032);

    expect(seasonResultsBefore[4].teamId).to.equal(18);
    expect(seasonResultsAfter[4].teamId).to.equal(19); 
  });
  
});