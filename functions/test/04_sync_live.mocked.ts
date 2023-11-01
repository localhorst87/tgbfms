import { describe, it } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import * as sync_live_helpers from "../src/sync_live/sync_live_helpers";
import * as appdata from "../src/data_access/appdata_access";
import { User } from "../src/business_rules/basic_datastructures";
import { MatchdayScoreSnapshot, UpdateTime } from "../src/data_access/import_datastructures";
import { Table, TableData } from "../src/data_access/export_datastructures";
import { Match } from "../src/business_rules/basic_datastructures";

describe('sync_live_helpers', () => {

    const allScoreSnapshots: MatchdayScoreSnapshot[] = [
        {
            documentId: "scoresnap_01",
            season: 2099,
            matchday: 1,
            scores: [
                {
                    userId: "user_01",
                    points: 4,
                    matches: 2,
                    results: 1,
                    extraTop: 1,
                    extraOutsider: 0,
                    extraSeason: 0
                },
                {
                    userId: "user_02",
                    points: 9,
                    matches: 5,
                    results: 1,
                    extraTop: 1,
                    extraOutsider: 2,
                    extraSeason: 0
                },
                {
                    userId: "user_03",
                    points: 6,
                    matches: 4,
                    results: 0,
                    extraTop: 1,
                    extraOutsider: 1,
                    extraSeason: 0
                }                   
            ]
        },
        {
            documentId: "scoresnap_02",
            season: 2099,
            matchday: 2,
            scores: [
                {
                    userId: "user_02",
                    points: 10,
                    matches: 8,
                    results: 2,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 0
                },
                {
                    userId: "user_01",
                    points: 4,
                    matches: 2,
                    results: 0,
                    extraTop: 1,
                    extraOutsider: 1,
                    extraSeason: 0
                },
                {
                    userId: "user_03",
                    points: 7,
                    matches: 3,
                    results: 2,
                    extraTop: 0,
                    extraOutsider: 2,
                    extraSeason: 0
                }                   
            ]
        },
        {
            documentId: "scoresnap_03",
            season: 2099,
            matchday: 3,
            scores: [
                {
                    userId: "user_03",
                    points: 6,
                    matches: 6,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 0
                },
                {
                    userId: "user_01",
                    points: 6,
                    matches: 3,
                    results: 0,
                    extraTop: 1,
                    extraOutsider: 2,
                    extraSeason: 0
                },
                {
                    userId: "user_02",
                    points: 3,
                    matches: 2,
                    results: 1,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 0
                }                   
            ]
        },
    ];

    const seasonScoreSnapshot: MatchdayScoreSnapshot = {
        documentId: "scoresnap_season",
        season: 2099,
        matchday: 3,
        scores: [
            {
                userId: "user_01",
                points: 2,
                matches: 0,
                results: 0,
                extraTop: 0,
                extraOutsider: 0,
                extraSeason: 2
            },
            {
                userId: "user_02",
                points: 3,
                matches: 0,
                results: 0,
                extraTop: 0,
                extraOutsider: 0,
                extraSeason: 3
            },
            {
                userId: "user_03",
                points: 0,
                matches: 0,
                results: 0,
                extraTop: 0,
                extraOutsider: 0,
                extraSeason: 0
            }                   
        ]
    };

    const activeUsers: User[] = [
        {
            documentId: "user_profile_01",
            id: "user_01",
            displayName: "userOne",
            isAdmin: false,
            isActive: true,
            configs: {
                notificationLevel: 0,
                notificationTime: 2,
                theme: "dark"
            }
        },
        {
            documentId: "user_profile_02",
            id: "user_02",
            displayName: "userTwo",
            isAdmin: false,
            isActive: true,
            configs: {
                notificationLevel: 0,
                notificationTime: 2,
                theme: "dark"
            }
        },
        {
            documentId: "user_profile_03",
            id: "user_03",
            displayName: "userThree",
            isAdmin: false,
            isActive: true,
            configs: {
                notificationLevel: 0,
                notificationTime: 2,
                theme: "dark"
            }
        }
    ];

    describe('makeTable', () => {

        it('request most recent matchday => expect to return added, ordered table', () => {
            const table: TableData[] = sync_live_helpers.makeTable(1, 3, activeUsers, allScoreSnapshots);
            expect(table).to.deep.equal([
                {
                    position: 1,
                    userName: "userTwo",
                    points: 22,
                    matches: 15,
                    results: 4,
                    extraTop: 1,
                    extraOutsider: 2,
                    extraSeason: 0
                },
                {
                    position: 2,
                    userName: "userThree",
                    points: 19,
                    matches: 13,
                    results: 2,
                    extraTop: 1,
                    extraOutsider: 3,
                    extraSeason: 0
                },
                {
                    position: 3,
                    userName: "userOne",
                    points: 14,
                    matches: 7,
                    results: 1,
                    extraTop: 3,
                    extraOutsider: 3,
                    extraSeason: 0
                }
            ]
            );
        });

        it('requested matchday greater than most recent matchday => expect to return total table of most recent matchday', async () => {
            const table: TableData[] = sync_live_helpers.makeTable(1, 4, activeUsers, allScoreSnapshots);
            expect(table).to.deep.equal([
                {
                    position: 1,
                    userName: "userTwo",
                    points: 22,
                    matches: 15,
                    results: 4,
                    extraTop: 1,
                    extraOutsider: 2,
                    extraSeason: 0
                },
                {
                    position: 2,
                    userName: "userThree",
                    points: 19,
                    matches: 13,
                    results: 2,
                    extraTop: 1,
                    extraOutsider: 3,
                    extraSeason: 0
                },
                {
                    position: 3,
                    userName: "userOne",
                    points: 14,
                    matches: 7,
                    results: 1,
                    extraTop: 3,
                    extraOutsider: 3,
                    extraSeason: 0
                }
            ]);
        });

        it('requested matchday smaller than most recent matchday => expect to return total table of requested matchday', async () => {
            const table: TableData[] = sync_live_helpers.makeTable(1, 2, activeUsers, allScoreSnapshots);
            expect(table).to.deep.equal([
                {
                    position: 1,
                    userName: "userTwo",
                    points: 19,
                    matches: 13,
                    results: 3,
                    extraTop: 1,
                    extraOutsider: 2,
                    extraSeason: 0
                },
                {
                    position: 2,
                    userName: "userThree",
                    points: 13,
                    matches: 7,
                    results: 2,
                    extraTop: 1,
                    extraOutsider: 3,
                    extraSeason: 0
                },
                {
                    position: 3,
                    userName: "userOne",
                    points: 8,
                    matches: 4,
                    results: 1,
                    extraTop: 2,
                    extraOutsider: 1,
                    extraSeason: 0
                }
            ]);
        });
        
    });

    describe('makeFinalTable', () => {

        it('basic functionality test', () => {
            const table: Table = sync_live_helpers.makeFinalTable(2099, 3, activeUsers, allScoreSnapshots, seasonScoreSnapshot);
            expect(table).to.deep.equal({
                documentId: "",
                id: "final",
                season: 2099,
                matchday: 3,
                tableData: [
                    {
                        position: 1,
                        userName: "userTwo",
                        points: 25,
                        matches: 15,
                        results: 4,
                        extraTop: 1,
                        extraOutsider: 2,
                        extraSeason: 3
                    },
                    {
                        position: 2,
                        userName: "userThree",
                        points: 19,
                        matches: 13,
                        results: 2,
                        extraTop: 1,
                        extraOutsider: 3,
                        extraSeason: 0
                    },
                    {
                        position: 3,
                        userName: "userOne",
                        points: 16,
                        matches: 7,
                        results: 1,
                        extraTop: 3,
                        extraOutsider: 3,
                        extraSeason: 2
                    }
                ]
            });
        });
        
    });

    describe.only('getMatchdayForStatUpdate', () => {

        var unknownMatch: Match = {            
            documentId: "",
            season: -1,
            matchday: -1,
            matchId: -1,
            timestamp: -1,
            isFinished: false,
            isTopMatch: false,
            teamIdHome: -1,
            teamIdAway: -1,
            goalsHome: -1,
            goalsAway: -1
        };

        describe('no finished last match available', () => {

            var sandbox: sinon.SinonSandbox;

            beforeEach(() => {
                sandbox = sinon.createSandbox();
            });
    
            afterEach(() => {
                sandbox.restore();
            });
            
            it('no (finished) last match available => expect to return empty array', async () => {
                sandbox.stub(appdata, "getLastMatch").resolves(unknownMatch);
                let nextMatchdaySpy: sinon.SinonSpy = sandbox.spy(appdata, "getNextMatch");

                const matchday: number = await sync_live_helpers.getMatchdayForStatsUpdate(2022);

                expect(matchday).to.deep.equal(-1);
                expect(nextMatchdaySpy.notCalled).to.be.true;
            });

        });

        describe('finished match available, no pending matches', () => { 
            
            var lastMatch: Match = {
                documentId: "last_match",
                season: 2022,
                matchday: 10,
                matchId: 299,
                timestamp: 1000,
                isFinished: true,
                isTopMatch: false,
                teamIdHome: 120,
                teamIdAway: 98,
                goalsHome: 2,
                goalsAway: 1
            };

            var lastUpdateTime: UpdateTime = {
                documentId: "update_time",
                season: 2022,
                matchday: 10,
                timestampMatches: 123456789,
                timestampStats: -1
            };

            var sandbox: sinon.SinonSandbox;

            beforeEach(() => {
                sandbox = sinon.createSandbox();
            });
    
            afterEach(() => {
                sandbox.restore();
            });

            it('no pending matches left (all finished), next match from next matchday, update time is -1 => expect to return matchday of last finished match', async () => {
                lastUpdateTime.timestampStats = -1;

                let otherMatch1: Match = {...lastMatch};
                let otherMatch2: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                nextMatch.matchday = 11;
                otherMatch1.timestamp = 800;
                otherMatch2.timestamp = 1000;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch);
                sandbox.stub(appdata, "getMatchesByMatchday").resolves([otherMatch1, otherMatch2]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchday: number = await sync_live_helpers.getMatchdayForStatsUpdate(2022);

                expect(matchday).to.deep.equal(10);       
            });

            it('no pending matches left (all finished), next match from next matchday, update time is > 0 => expect to return -1', async () => {
                lastUpdateTime.timestampStats = 1100;

                let otherMatch1: Match = {...lastMatch};
                let otherMatch2: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                nextMatch.matchday = 11;
                otherMatch1.timestamp = 800;
                otherMatch2.timestamp = 1000;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch);
                sandbox.stub(appdata, "getMatchesByMatchday").resolves([otherMatch1, otherMatch2]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchday: number = await sync_live_helpers.getMatchdayForStatsUpdate(2022);

                expect(matchday).to.deep.equal(-1);       
            });

            it('pending matches available => expect to return -1', async () => {
                lastUpdateTime.timestampStats = -1;

                let otherMatch1: Match = {...lastMatch};
                let otherMatch2: Match = {...lastMatch};
                let otherMatch3: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                nextMatch.matchday = 11;
                otherMatch1.timestamp = 500;
                otherMatch2.timestamp = 1000;
                otherMatch3.timestamp = 1200;
                otherMatch2.isFinished = false;
                otherMatch3.isFinished = false;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch);
                sandbox.stub(appdata, "getMatchesByMatchday").resolves([otherMatch1, otherMatch2, otherMatch3]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchday: number = await sync_live_helpers.getMatchdayForStatsUpdate(2022);

                expect(matchday).to.deep.equal(-1);       
            });

            it('pending matches available, but postponed to later date => expect to return matchday of last finished match', async () => {
                lastUpdateTime.timestampStats = -1;

                let otherMatch1: Match = {...lastMatch};
                let otherMatch2: Match = {...lastMatch};
                let otherMatch3: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                nextMatch.matchday = 11;
                otherMatch1.timestamp = 500;
                otherMatch2.timestamp = 1000;
                otherMatch3.timestamp = otherMatch1.timestamp + sync_live_helpers.THRESHOLD_POSTPONED_MATCH + 1;
                otherMatch3.isFinished = false;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch);
                sandbox.stub(appdata, "getMatchesByMatchday").resolves([otherMatch1, otherMatch2, otherMatch3]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchday: number = await sync_live_helpers.getMatchdayForStatsUpdate(2022);

                expect(matchday).to.deep.equal(10);       
            });

            it('last finished match was a postponed match, stats update time > 0 => expect to return matchday of last finished match anyway', async () => {
                lastUpdateTime.timestampStats = 30;

                let otherMatch1: Match = {...lastMatch};
                let otherMatch2: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                nextMatch.matchday = 13;
                otherMatch1.timestamp = 10;
                otherMatch2.timestamp = 20;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch);
                sandbox.stub(appdata, "getMatchesByMatchday").resolves([otherMatch1, otherMatch2]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchday: number = await sync_live_helpers.getMatchdayForStatsUpdate(2022);

                expect(matchday).to.deep.equal(10);
            });
            
        });

    });
    
});