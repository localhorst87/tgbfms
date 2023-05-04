import { describe, it } from "mocha";
import { expect } from "chai";
import * as admin from "firebase-admin";
import { Match, Bet, SeasonBet, SeasonResult, User, TopMatchVote } from "../../src/app/Businessrules/basic_datastructures";
import { UpdateTime, SyncPhase, MatchdayScoreSnapshot } from "../src/data_access/import_datastructures";
import * as appdata_access from "../src/data_access/appdata_access";

describe("getAllMatches, end-to-end-test", () => {

  it("More than one data sample available => expect correct samples in array", async () => {
    let matches = await appdata_access.getAllMatches(2019);

    expect(matches.length).to.equal(4);
  });

  it("No data samples available => expect empty array", async () => {
    let matches = await appdata_access.getAllMatches(2129);

    expect(matches).to.deep.equal([]);
  });

});

describe('getMatchesByMatchday, end-to-end-test', () => {
  var docIds1Expected: string[] = [
    "Ky9SuhU7TMv4BYCvMO8u",
    "qG7pgB6c9l3NJeHNHS6X"
  ];

  var matches2Expected: Match[] = [
    {
      documentId: "Ty5CSNey39iDeo8HEWMp",
      matchId: 99002,
      season: 2099,
      matchday: 2,
      goalsAway: -1,
      goalsHome: -1,
      isFinished: false,
      isTopMatch: false,
      teamIdAway: 500,
      teamIdHome: 400,
      timestamp: 4089810600
    }
  ];

  it("data available => expect correct documents", async () => {
    const matches: Match[] = await appdata_access.getMatchesByMatchday(2099, 1);
    const docIdsRequested: string[] = matches.map(match => match.documentId);

    expect(docIdsRequested).to.deep.equal(docIds1Expected);
  });

  it('data available => expect correct content', async () => {
    const matchesRequested: Match[] = await appdata_access.getMatchesByMatchday(2099, 2);

    expect(matchesRequested).to.deep.equal(matches2Expected);    
  });

  it('data not available => expect empty array', async () => {
    const matchesRequested: Match[] = await appdata_access.getMatchesByMatchday(2099, 3);

    expect(matchesRequested).to.deep.equal([]);   
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
    goalsHome: -1,
    goalsAway: -1
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

describe('getBet, end-to-end-test', () => {

  it('Bet is available => expect correct content', async () => {
    const expectedBet: Bet = {
      documentId: "AxIma007HA4EA6x40FUa",
      matchId: 10000,
      goalsAway: 0,
      goalsHome: 1,
      isFixed: false,
      userId: "user_id_0"
    };

    const requestedBet: Bet = await appdata_access.getBet(10000, "user_id_0");

    expect(requestedBet).to.deep.equal(expectedBet);    
  });

  it('Bet is not available => expect dummy Bet', async () => {
    const dummyBet: Bet = {
      documentId: "",
      matchId: 10000,
      goalsAway: -1,
      goalsHome: -1,
      isFixed: false,
      userId: "user_id_99"
    };

    const requestedBet: Bet = await appdata_access.getBet(10000, "user_id_99");

    expect(requestedBet).to.deep.equal(dummyBet);    
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

    expect(syncPhases.length).to.equal(4)
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

describe('getSeasonBets, end-to-end-test', () => {

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

describe('getSeasonResults, end-to-end-test', () => {

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

describe('setSeasonResult, end-to-end-test', () => {

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

describe('getActiveUsers, end-to-end-test', () => {
  it('request active users => expect correct documents', async () => {
    const expectedDocIds: string[] = [
      "kssjQjGl7g373uTO20U4",
      "tAy6zg4JWHchx6zYDG5S"
    ];
    const requestedUsers: User[] = await appdata_access.getActiveUsers();
    const docIds: string[] = requestedUsers.map(user => user.documentId);
    
    expect(docIds).to.deep.equal(expectedDocIds);
  });  
});

describe('getMatchdayScoreSnapshot, end-to-end-test', () => {

  it('snapshot available => expect correct document', async () => {
    const expectedDocId: string = "QmfKZDzUVD9rgxDDisV4";
    const snapshot: MatchdayScoreSnapshot = await appdata_access.getMatchdayScoreSnapshot(2030, 10);

    expect(snapshot.documentId).to.deep.equal(expectedDocId);    
  });

  it('snapshot available => expect correct content', async () => {
    const expectedSnapshot: MatchdayScoreSnapshot = {
      documentId: "QmfKZDzUVD9rgxDDisV4",
      season: 2030,
      matchday: 10,
      userId: ["test_user_0", "test_user_1", "test_user_2"],
      points: [5, 14, 6],
      matches: [4, 8, 4],
      results: [1, 3, 1],
      extraOutsider: [0, 3, 1],
      extraTop: [0, 0, 0],
      extraSeason: [0, 0, 0]
    };

    const snapshot: MatchdayScoreSnapshot = await appdata_access.getMatchdayScoreSnapshot(2030, 10);

    expect(snapshot).to.deep.equal(expectedSnapshot);    
  });

  it('snapshot not available => expect dummy snapshot', async () => {
    const expectedSnapshot: MatchdayScoreSnapshot = {
      documentId: "",
      season: 2030,
      matchday: 34,
      userId: [],
      points: [],
      matches: [],
      results: [],
      extraOutsider: [],
      extraTop: [],
      extraSeason: []
    };

    const snapshot: MatchdayScoreSnapshot = await appdata_access.getMatchdayScoreSnapshot(2030, 34);

    expect(snapshot).to.deep.equal(expectedSnapshot);    
  });

});

describe('setMatchdayScoreSnapshot, end-to-end-test', () => {

  it('snapshot not yet existing => expect to add new snapshot', async () => {
    const snapshot: MatchdayScoreSnapshot = {
      documentId: "",
      season: 2030,
      matchday: 11,
      userId: ["test_user_0", "test_user_1", "test_user_2"],
      points: [4, 2, 5],
      matches: [4, 1, 3],
      results: [0, 1, 0],
      extraOutsider: [0, 0, 1],
      extraTop: [0, 0, 1],
      extraSeason: [0, 0, 0]
    };

    let snapshotBefore: MatchdayScoreSnapshot = await appdata_access.getMatchdayScoreSnapshot(2030, 11);
    await appdata_access.setMatchdayScoreSnapshot(snapshot);
    let snapshotAfter: MatchdayScoreSnapshot = await appdata_access.getMatchdayScoreSnapshot(2030, 11);

    expect(snapshotBefore.points).to.deep.equal([]);
    expect(snapshotAfter.points).to.deep.equal([4, 2, 5]);   
  });

  it('snapshot already existing => expect to update snapshot', async () => {
    const snapshotUpdate: MatchdayScoreSnapshot = {
      documentId: "QmfKZDzUVD9rgxDDisV4",
      season: 2030,
      matchday: 10,
      userId: ["test_user_0", "test_user_1", "test_user_2"],
      points: [7, 14, 9],
      matches: [5, 8, 5],
      results: [1, 3, 2],
      extraOutsider: [0, 3, 2],
      extraTop: [1, 0, 0],
      extraSeason: [0, 0, 0]
    };

    let snapshotBefore: MatchdayScoreSnapshot = await appdata_access.getMatchdayScoreSnapshot(2030, 10);
    await appdata_access.setMatchdayScoreSnapshot(snapshotUpdate);
    let snapshotAfter: MatchdayScoreSnapshot = await appdata_access.getMatchdayScoreSnapshot(2030, 10);

    expect(snapshotBefore.points).to.deep.equal([5, 14, 6]);
    expect(snapshotAfter.points).to.deep.equal([7, 14, 9]);   
  });
  
});

describe('getTopMatch, end-to-end-test', () => {

  it('top match existing => expect to return real match', async () => {
    const topMatch: Match = await appdata_access.getTopMatch(2099, 1);
    expect(topMatch.matchId).to.equal(99001);    
  });

  it('top match not existing => expect to return dummy match', async () => {
    const topMatch: Match = await appdata_access.getTopMatch(2099, 2);
    expect(topMatch.matchId).to.equal(-1);
  });

  it('no match at all existing for requested combination => expect to return dummy match', async () => {
    const topMatch: Match = await appdata_access.getTopMatch(2099, 3);
    expect(topMatch.matchId).to.equal(-1);
  });
  
});

describe('getTopMatchVotes, end-to-end-test', () => {
  it('votes available => expect to return all votes', async () => {
    const votes: TopMatchVote[] = await appdata_access.getTopMatchVotes(2099, 1);
    expect(votes.length).to.equal(3);
  });

  it('votes available => expect to return correct documents', async () => {
    const votes: TopMatchVote[] = await appdata_access.getTopMatchVotes(2099, 1);
    expect(votes
      .map(vote => vote.documentId)
      .sort())
    .to.deep.equal(["MvNhIcwvQikZkKxQYXVt", "QRw1DbX3w684eMnnXa1C", "eg2vwLf9rnShulRta5dD"]);
  });

  it('votes not available => expect to return empty array', async () => {
    const votes: TopMatchVote[] = await appdata_access.getTopMatchVotes(2099, 2);
    expect(votes).to.deep.equal([]);
  });
});