import { describe, it } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import * as sync_live_helpers from "../src/sync_live/sync_live_helpers";
import * as appdata from "../src/data_access/appdata_access";
import { Match, Bet, User, Score } from "../../src/app/Businessrules/basic_datastructures";
import { UpdateTime, SyncPhase, MatchImportData, MatchdayScoreSnapshot } from "../src/data_access/import_datastructures";
import * as util from "../src/util";

describe('sync_live_helpers', () => {

    describe('getAllBetsOfMatches', () => {
        const matches: Match[] = [
            {
                matchId: 5000,
                documentId: "",
                season: -1,
                matchday: 1,
                goalsAway: -1,
                goalsHome: -1,
                timestamp: -1,
                isFinished: false,
                isTopMatch: false,
                teamIdHome: -1,
                teamIdAway: -1
            },
            {
                matchId: 5001,
                documentId: "",
                season: -1,
                matchday: 1,
                goalsAway: -1,
                goalsHome: -1,
                timestamp: -1,
                isFinished: false,
                isTopMatch: false,
                teamIdHome: -1,
                teamIdAway: -1
            },
            {
                matchId: 5002,
                documentId: "",
                season: -1,
                matchday: 1,
                goalsAway: -1,
                goalsHome: -1,
                timestamp: -1,
                isFinished: false,
                isTopMatch: false,
                teamIdHome: -1,
                teamIdAway: -1
            },            
        ];

        const users: User[] = [
            {
                id: "user_id_0",
                documentId: "",
                email: "",
                displayName: "",
                isAdmin: false,
                isActive: true
            },
            {
                id: "user_id_1",
                documentId: "",
                email: "",
                displayName: "",
                isAdmin: false,
                isActive: true
            },    
            {
                id: "user_id_2",
                documentId: "",
                email: "",
                displayName: "",
                isAdmin: false,
                isActive: true
            }     
        ];

        it('all bets available => expect correct content', async () => {
            let requestedMatches: Match[] = matches.slice(0, 2); // 5000, 5001
            let requestedUsers: User[] = users.slice(0, 2); // user_id_0, user_id_1

            const bets: Bet[] = await sync_live_helpers.getAllBetsOfMatches(requestedMatches, requestedUsers);

            const expectedBets: Bet[] = [
                {
                    documentId: "MZZ0b17I9BPmxGj9X1Qs",
                    goalsAway: 1,
                    goalsHome: 3,
                    isFixed: true,
                    matchId: 5000,
                    userId: "user_id_0"
                },
                {
                    documentId: "63US1bDBefHfMJ78YFjC",
                    goalsAway: 0,
                    goalsHome: 2,
                    isFixed: true,
                    matchId: 5000,
                    userId: "user_id_1"
                },    
                {
                    documentId: "ls7sjVN9tFO3SSkSSKZo",
                    goalsAway: 1,
                    goalsHome: 0,
                    isFixed: false,
                    matchId: 5001,
                    userId: "user_id_0"
                },
                {
                    documentId: "rplVOMZF0AQdlDzxggaL",
                    goalsAway: 2,
                    goalsHome: 3,
                    isFixed: true,
                    matchId: 5001,
                    userId: "user_id_1"
                }                            
            ];

            expect(bets).to.deep.equal(expectedBets);            
        });

        it('not all bets available => expect -1:-1 for non existing bets', async () => {
            let requestedMatches: Match[] = matches;
            let requestedUsers: User[] = users.slice(0, 2); // user_id_0, user_id_1

            const bets: Bet[] = await sync_live_helpers.getAllBetsOfMatches(requestedMatches, requestedUsers);

            const expectedBets: Bet[] = [
                {
                    documentId: "MZZ0b17I9BPmxGj9X1Qs",
                    goalsAway: 1,
                    goalsHome: 3,
                    isFixed: true,
                    matchId: 5000,
                    userId: "user_id_0"
                },
                {
                    documentId: "63US1bDBefHfMJ78YFjC",
                    goalsAway: 0,
                    goalsHome: 2,
                    isFixed: true,
                    matchId: 5000,
                    userId: "user_id_1"
                },    
                {
                    documentId: "ls7sjVN9tFO3SSkSSKZo",
                    goalsAway: 1,
                    goalsHome: 0,
                    isFixed: false,
                    matchId: 5001,
                    userId: "user_id_0"
                },
                {
                    documentId: "rplVOMZF0AQdlDzxggaL",
                    goalsAway: 2,
                    goalsHome: 3,
                    isFixed: true,
                    matchId: 5001,
                    userId: "user_id_1"
                },
                {
                    documentId: "suc6kuHR7FQGa68pSj5U",
                    goalsAway: 2,
                    goalsHome: 2,
                    isFixed: false,
                    matchId: 5002,
                    userId: "user_id_0"
                },      
                {
                    documentId: "",
                    goalsAway: -1,
                    goalsHome: -1,
                    isFixed: false,
                    matchId: 5002,
                    userId: "user_id_1"
                },                                 
            ];

            expect(bets).to.deep.equal(expectedBets);            
        });
                
    });

    describe('getRelevantMatchesToSync', () => {
        var sandbox: any;

        beforeEach(() => {
          sandbox = sinon.createSandbox();
        });
    
        afterEach(() => {
          sandbox.restore();
        });

        it('current timestamp before any sync phases => expect empty array', async () => {
            sandbox.stub(util, "getCurrentTimestamp").returns(1565900000);

            const matches: Match[] = await sync_live_helpers.getRelevantMatchesToSync();

            expect(matches).to.deep.equal([]);
        });

        it('current timestamp between two sync phases, but matches of older SyncPhase all finished => expect empty array', async () => {
            sandbox.stub(util, "getCurrentTimestamp").returns(1566000000);

            const matches: Match[] = await sync_live_helpers.getRelevantMatchesToSync();

            expect(matches).to.deep.equal([]);
        });

        it('current timestamp after two sync phases, two matches pending => expect two matches', async () => {
            sandbox.stub(util, "getCurrentTimestamp").returns(1566054900);
            // sync phases older than current mocked timestamp: 
            // 1565980200 (all finished)
            // 1566048600 (2 not finished)

            const matches: Match[] = await sync_live_helpers.getRelevantMatchesToSync();
            const expectedDocIds: string[] = ["x9JdQauSADM0W9qoTBIg", "bBOYbDmq1OcVPeqJNHWQ"];

            expect(matches.map((match: Match) => match.documentId)).to.deep.equal(expectedDocIds);
        });
        
    });

    describe('getRelevantSyncPhases', () => {
        var sandbox: any;

        beforeEach(() => {
          sandbox = sinon.createSandbox();
        });
    
        afterEach(() => {
          sandbox.restore();
        });

        it('current timestamp is before any sync phase starts in DB => expect empty array', async () => {
            sandbox.stub(util, "getCurrentTimestamp").returns(1550000000); // oldest sync phase is 1566048600
            const phases: SyncPhase[] = await sync_live_helpers.getRelevantSyncPhases();
            
            expect(phases).to.deep.equal([]);
        });

        it('current timestamp is same as oldest sync phase start in DB => expect one Sync Phase', async () => {
            sandbox.stub(util, "getCurrentTimestamp").returns(1566048600); // oldest sync phase is 1566048600
            const phases: SyncPhase[] = await sync_live_helpers.getRelevantSyncPhases();

            const expectedPhases = [
                {
                    documentId: "0D4SHcnBxR76jCPx3nYN",
                    matchIds: [20511, 20512, 20513],
                    start: 1566048600
                }
            ];
            
            expect(phases).to.deep.equal(expectedPhases);
        });

        it('current timestamp is after four sync phase start in DB => expect three Sync Phases', async () => {
            sandbox.stub(util, "getCurrentTimestamp").returns(1629570000);
            const phases: SyncPhase[] = await sync_live_helpers.getRelevantSyncPhases();
            const phasesSorted: SyncPhase[] = phases.sort((a, b) => a.start - b.start);

            const expectedPhases = [
                {
                    documentId: "0D4SHcnBxR76jCPx3nYN",
                    matchIds: [20511, 20512, 20513],
                    start: 1566048600
                },
                {
                    documentId: "SvLk6AqxhbuNO1HPBxuo",
                    matchIds: [60862],
                    start: 1629484200
                },
                {
                    documentId: "gkBUYK3E5ATO19MaoHku",
                    matchIds: [60859, 60857, 60858, 60856, 60860],
                    start: 1629552600
                },     
                {
                    documentId: "gLzjaOzK7al23Il2cXE1",
                    matchIds: [60854],
                    start: 1629563400
                }        
            ];
            
            expect(phasesSorted).to.deep.equal(expectedPhases);
        });
        
    });

    describe('getMatchesFromSyncPhase', () => {

        it('SyncPhase has no matches => expect empty match array', async () => {
            const snycPhase: SyncPhase = {
                documentId: "",
                matchIds: [],
                start: -1
            };

            const matches: Match[] = await sync_live_helpers.getMatchesFromSyncPhase(snycPhase);

            expect(matches).to.deep.equal([]);            
        });

        it('SyncPhase has only finished matches => expect empty array', async () => {
            const snycPhase: SyncPhase = {
                documentId: "test_id", // not important
                matchIds: [60863, 60869], // both are finished!
                start: -1 // not important
            };

            const matches: Match[] = await sync_live_helpers.getMatchesFromSyncPhase(snycPhase);

            expect(matches).to.deep.equal([]);             
        });

        it('SyncPhase has only not-finished matches => expect correct documents', async () => {
            const snycPhase: SyncPhase = {
                documentId: "test_id", // not important
                matchIds: [1000, 1001], // both not finished
                start: -1 // not important
            };

            const matches: Match[] = await sync_live_helpers.getMatchesFromSyncPhase(snycPhase);

            const expectedDocIds: string[] = ["9cKcskEZ3nqlzMaALDtZ", "0ncSX1D6CH4mKg3wRfYr"];

            expect(matches.map((match: Match) => match.documentId)).to.deep.equal(expectedDocIds);            
        });

        it('SyncPhase has finished and not-finished matches => expect only not-finished matches', async () => {
            const snycPhase: SyncPhase = {
                documentId: "test_id", // not important
                matchIds: [60863, 1001], // both not finished
                start: -1 // not important
            };

            const matches: Match[] = await sync_live_helpers.getMatchesFromSyncPhase(snycPhase);

            const expectedDocIds: string[] = ["0ncSX1D6CH4mKg3wRfYr"];

            expect(matches.map((match: Match) => match.documentId)).to.deep.equal(expectedDocIds);            
        });
        
    });

    describe('getReferenceMatchData', () => {

        const matches: Match[] = [
            {
                documentId: "0089BQGd9WtsTGETSFsf",
                season: 2021,
                matchday: 1,
                goalsHome: 5,
                goalsAway: 1,
                isFinished: true,
                isTopMatch: false,
                teamIdHome: 16,
                teamIdAway: 115,
                timestamp: 1628947800,
                matchId: 60851                
            },
            {
                documentId: "DvKrMLxNvfi0NGFcNpy7",
                season: 2021,
                matchday: 1,
                goalsHome: 1,
                goalsAway: 0,
                isFinished: true,
                isTopMatch: false,
                teamIdHome: 81,
                teamIdAway: 1635,
                timestamp: 1629034200,
                matchId: 60850                
            },    
            {
                documentId: "0yxcMUM1HKjgraab2r71",
                season: 2021,
                matchday: 3,
                goalsHome: 1,
                goalsAway: 1,
                isFinished: true,
                isTopMatch: false,
                teamIdHome: 83,
                teamIdAway: 91,
                timestamp: 1630157400,
                matchId: 60863   
            }       
        ];

        it('one match from one matchday => expect data from one match', async () => {
            const data: MatchImportData[] = await sync_live_helpers.getReferenceMatchData(matches.slice(0, 1));
            const expectedData: MatchImportData[] = [
                {
                    season: 2021,
                    matchday: 1,
                    matchId: 60851,
                    datetime: "2021-08-14T13:30:00Z",
                    isFinished: true,
                    teamIdHome: 16,
                    teamIdAway: 115,
                    goalsHome: 5,
                    goalsAway: 1
                }
            ];
            
            expect(data).to.deep.equal(expectedData);
        });

        it('two matches from one matchday => expect data from two matches', async () => {
            const data: MatchImportData[] = await sync_live_helpers.getReferenceMatchData(matches.slice(0, 2));
            const expectedData: MatchImportData[] = [
                {
                    season: 2021,
                    matchday: 1,
                    matchId: 60851,
                    datetime: "2021-08-14T13:30:00Z",
                    isFinished: true,
                    teamIdHome: 16,
                    teamIdAway: 115,
                    goalsHome: 5,
                    goalsAway: 1
                },
                {
                    season: 2021,
                    matchday: 1,
                    matchId: 60850,
                    datetime: "2021-08-15T13:30:00Z",
                    isFinished: true,
                    teamIdHome: 81,
                    teamIdAway: 1635,
                    goalsHome: 1,
                    goalsAway: 0
                }
            ];
            
            expect(data).to.deep.equal(expectedData);
        });

        it('three matches from two matchdays => expect data from three matches', async () => {
            const data: MatchImportData[] = await sync_live_helpers.getReferenceMatchData(matches);
            const expectedData: MatchImportData[] = [
                {
                    season: 2021,
                    matchday: 1,
                    matchId: 60851,
                    datetime: "2021-08-14T13:30:00Z",
                    isFinished: true,
                    teamIdHome: 16,
                    teamIdAway: 115,
                    goalsHome: 5,
                    goalsAway: 1
                },
                {
                    season: 2021,
                    matchday: 1,
                    matchId: 60850,
                    datetime: "2021-08-15T13:30:00Z",
                    isFinished: true,
                    teamIdHome: 81,
                    teamIdAway: 1635,
                    goalsHome: 1,
                    goalsAway: 0
                },
                {
                    season: 2021,
                    matchday: 3,
                    matchId: 60863,
                    datetime: "2021-08-28T13:30:00Z",
                    isFinished: true,
                    teamIdHome: 83,
                    teamIdAway: 91,
                    goalsHome: 1,
                    goalsAway: 1
                }
            ];
            
            expect(data).to.deep.equal(expectedData);
        });
        
    });

    describe('setNewUpdateTimes', () => {

        function wait(timeSec: number): Promise<string> {
            return new Promise(function(resolve) {
                setTimeout(() => resolve(String(timeSec)), timeSec*1000);
            });
        }

        // wait 1 sec, because the updated timestamp of the first test
        // should not affect the result of the second test
        beforeEach(async () => await wait(1));

        it('one matchday', async () => {
            const updateTimeBefore: UpdateTime = await appdata.getLastUpdateTime(2030, 1);
            const matchdaysUpdated: number[] = await sync_live_helpers.setNewUpdateTimes(2030, [1]);
            const updateTimeAfter: UpdateTime = await appdata.getLastUpdateTime(2030, 1);
    
            expect(matchdaysUpdated).to.deep.equal([1]);
            expect(updateTimeAfter.timestamp).to.be.greaterThan(updateTimeBefore.timestamp);        
        });
    
        it('two matchdays', async () => {
            const updateTime1Before: UpdateTime = await appdata.getLastUpdateTime(2030, 1);
            const updateTime2Before: UpdateTime = await appdata.getLastUpdateTime(2030, 2);
            const matchdaysUpdated: number[] = await sync_live_helpers.setNewUpdateTimes(2030, [1, 2]);
            const updateTime1After: UpdateTime = await appdata.getLastUpdateTime(2030, 1);
            const updateTime2After: UpdateTime = await appdata.getLastUpdateTime(2030, 2);
    
            expect(matchdaysUpdated).to.deep.equal([1, 2]);
            expect(updateTime1After.timestamp).to.be.greaterThan(updateTime1Before.timestamp);   
            expect(updateTime2After.timestamp).to.be.greaterThan(updateTime2Before.timestamp);       
        });
        
    });

    describe('addLiveData', () => {

        it('data changed', () => {
            const match: Match = {
                documentId: "test_id",
                season: 2030,
                matchday: 12,
                matchId: 70000,
                timestamp: 1919187000,
                isFinished: false,
                isTopMatch: false,
                teamIdHome: 1000,
                teamIdAway: 2000,
                goalsHome: 1,
                goalsAway: 1
            };

            const importedMatch: MatchImportData = {
                season: 2030,
                matchday: 12,
                matchId: 70000,
                datetime: "2030-10-25T19:30:00Z",
                isFinished: true,
                teamIdHome: 1000,
                teamIdAway: 2000,
                goalsHome: 2,
                goalsAway: 3
            };

            const updatedMatch: Match = sync_live_helpers.addLiveData(match, importedMatch);

            expect(updatedMatch).to.deep.equal({
                documentId: "test_id",
                season: 2030,
                matchday: 12,
                matchId: 70000,
                timestamp: 1919187000,
                isFinished: true,
                isTopMatch: false,
                teamIdHome: 1000,
                teamIdAway: 2000,
                goalsHome: 2,
                goalsAway: 3
            });            
        });
    
    });

    describe('convertToScoreSnapshot', () => {

        it('ScoreArray is empty => expect MatchdayScoreSnapshot with empty arrays', () => {
            const scoreSnapshot: MatchdayScoreSnapshot = sync_live_helpers.convertToScoreSnapshot(2030, 12, []);
            
            expect(scoreSnapshot).to.deep.equal({
                documentId: "",
                season: 2030,
                matchday: 12,
                userId: [],
                points: [],
                matches: [],
                results: [],
                extraTop: [],
                extraOutsider: [],
                extraSeason: []
            });
            
        });

        it('ScoreArray not empty => expect transformed data', () => {
            const scores: Score[] = [
                {
                    userId: "user_0",
                    points: 10,
                    matches: 6,
                    results: 2,
                    extraTop: 1,
                    extraOutsider: 1,
                    extraSeason: 0
                },
                {
                    userId: "user_1",
                    points: 5,
                    matches: 4,
                    results: 0,
                    extraTop: 1,
                    extraOutsider: 0,
                    extraSeason: 0
                },   
                {
                    userId: "user_2",
                    points: 7,
                    matches: 4,
                    results: 1,
                    extraTop: 1,
                    extraOutsider: 1,
                    extraSeason: 0
                }             
            ];

            const scoreSnapshot: MatchdayScoreSnapshot = sync_live_helpers.convertToScoreSnapshot(2030, 12, scores);
            
            expect(scoreSnapshot).to.deep.equal({
                documentId: "",
                season: 2030,
                matchday: 12,
                userId: ["user_0", "user_1", "user_2"],
                points: [10, 5, 7],
                matches: [6, 4, 4],
                results: [2, 0, 1],
                extraTop: [1, 1, 1],
                extraOutsider: [1, 0, 1],
                extraSeason: [0, 0, 0]
            });
        });
        
    });
    
});

// import * as admin from "firebase-admin";
// import * as appdata_helpers from "../src/data_access/appdata_helpers";

// describe.only('sync_live', () => {

//     describe('syncMatches', () => {

//         interface Result {
//             documentId: string;
//             matchId: number,
//             goalsHome: number,
//             goalsAway: number
//         };

//         function getResult(matchId: number): Promise<Result> {
//             let query: admin.firestore.Query = admin.firestore().collection('results')
//             .where("matchId", "==", matchId);
          
//             return query.get().then(
//               (querySnapshot: admin.firestore.QuerySnapshot) => {
//                 let resultList: Result[] = appdata_helpers.processSnapshot<Result>(querySnapshot);
//                 if (resultList.length > 0) {
//                   return resultList[0];
//                 }
//                 else {
//                   return {
//                     documentId: "",
//                     matchId: matchId,
//                     goalsHome: -1,
//                     goalsAway: -1
//                   }
//                 }
//               }
//             );
//           }

//         it('update 2021 data', async () => {
//             let allMatches: Match[] = await appdata.getAllMatches(2021);
//             for (let match of allMatches) {
//                 const result: Result = await getResult(match.matchId);

//                 match.goalsAway = result.goalsAway;
//                 match.goalsHome = result.goalsHome;

//                 await appdata.setMatch(match);
//             }
//         }).timeout(20000);

//         it('update 2022 data', async () => {
//             let allMatches: Match[] = await appdata.getAllMatches(2022);
//             for (let match of allMatches) {
//                 const result: Result = await getResult(match.matchId);

//                 match.goalsAway = result.goalsAway;
//                 match.goalsHome = result.goalsHome;

//                 await appdata.setMatch(match);
//             }
//         }).timeout(20000);
        
//     });
    
// });

