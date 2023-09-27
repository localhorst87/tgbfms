import { describe, it } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import * as sync_live_helpers from "../src/sync_live/sync_live_helpers";
import * as appdata from "../src/data_access/appdata_access";
import { User } from "../../src/app/Businessrules/basic_datastructures";
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
            email: "user1@tgbfms.de",
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
            email: "user2@tgbfms.de",
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
            email: "user3@tgbfms.de",
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

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([]);
                expect(nextMatchdaySpy.notCalled).to.be.true;
            });

        });

        describe('finished match available, no other matches at the same kickoff time', () => { 
            
            var lastMatch: Match = {
                documentId: "last_match",
                season: 2022,
                matchday: 10,
                matchId: 299,
                timestamp: 123456789,
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

            it('no next match available, update time == -1 => expect to return matchday of last match', async () => {
                lastUpdateTime.timestampStats = -1;
                
                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch]);
                sandbox.stub(appdata, "getNextMatch").resolves(unknownMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([lastMatch.matchday]);       
            });

            it('no next match available, update time > 0 => expect to return empty array', async () => {
                lastUpdateTime.timestampStats = 123456789;
                
                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch]);
                sandbox.stub(appdata, "getNextMatch").resolves(unknownMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([]);       
            });

            it('next match is from same matchday => expect to return empty array', async () => {
                let nextMatch = {...lastMatch};
                
                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([]);   
            });

            it('next match is from next matchday, update time == -1 => expect to return matchday of last match', async () => {
                let nextMatch = {...lastMatch};
                nextMatch.matchday = lastMatch.matchday + 1;
                lastUpdateTime.timestampStats = -1;
                
                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([lastMatch.matchday]);
            });

            it('next match is from next matchday, update time > 0 => expect to return empty array', async () => {
                let nextMatch = {...lastMatch};
                nextMatch.matchday = lastMatch.matchday + 1;
                lastUpdateTime.timestampStats = 123456789;
                
                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([]);
            });            

            it('next match is from over-next matchday (last matchday was postponed), update time > 0 => expect to return matchday of last match', async () => {
                let nextMatch = {...lastMatch};
                nextMatch.matchday = lastMatch.matchday + 2;
                lastUpdateTime.timestampStats = 123456789;
                
                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([lastMatch.matchday]);
            });

            it('next match is from former (postponed) matchday, update time == -1 => expect to return matchday of last match', async () => {
                let nextMatch = {...lastMatch};
                nextMatch.matchday = lastMatch.matchday - 3;
                lastUpdateTime.timestampStats = -1;
                
                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([lastMatch.matchday]);
            });

            it('next match is from former (postponed) matchday, update time > 0 => expect to return empty array', async () => {
                let nextMatch = {...lastMatch};
                nextMatch.matchday = lastMatch.matchday - 3;
                lastUpdateTime.timestampStats = 1234556789;
                
                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([]);
            });
            
        });

        describe('finished match available, other matches at the same kickoff time from same matchday available', () => {
            
            var lastMatch: Match = {
                documentId: "last_match",
                season: 2022,
                matchday: 10,
                matchId: 299,
                timestamp: 123456789,
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

            it('next match is from next matchday, but not all last matches are finished => expect to return empty array', async () => {
                lastUpdateTime.timestampStats = -1;

                let lastMatch1: Match = {...lastMatch};
                let lastMatch2: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                lastMatch1.isFinished = true;
                lastMatch2.isFinished = false;
                nextMatch.matchday = lastMatch1.matchday + 1;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch1);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch1, lastMatch2]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([]);       
            });

            it('next match is from next matchday, all last matches are finished, update time == -1 => expect to return matchday of last matches', async () => {
                lastUpdateTime.timestampStats = -1;

                let lastMatch1: Match = {...lastMatch};
                let lastMatch2: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                lastMatch1.isFinished = true;
                lastMatch2.isFinished = true;
                nextMatch.matchday = lastMatch1.matchday + 1;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch1);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch1, lastMatch2]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([lastMatch.matchday]);
            });

            it('next match is from next matchday, all last matches are finished, update time > 0 => expect to return empty array', async () => {
                lastUpdateTime.timestampStats = 123456789;

                let lastMatch1: Match = {...lastMatch};
                let lastMatch2: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                lastMatch1.isFinished = true;
                lastMatch2.isFinished = true;
                nextMatch.matchday = lastMatch1.matchday + 1;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch1);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch1, lastMatch2]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([]);
            });

            it('next match is from former (postponed) matchday, but not all last matches are finished => expect to return empty array', async () => {
                lastUpdateTime.timestampStats = -1;

                let lastMatch1: Match = {...lastMatch};
                let lastMatch2: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                lastMatch1.isFinished = true;
                lastMatch2.isFinished = false;
                nextMatch.matchday = lastMatch1.matchday - 1;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch1);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch1, lastMatch2]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([]);       
            });

            it('next match is from former (postponed) matchday, all last matches are finished, update time == -1 => expect to return matchday of last matches', async () => {
                lastUpdateTime.timestampStats = -1;

                let lastMatch1: Match = {...lastMatch};
                let lastMatch2: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                lastMatch1.isFinished = true;
                lastMatch2.isFinished = true;
                nextMatch.matchday = lastMatch1.matchday - 1;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch1);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch1, lastMatch2]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([lastMatch.matchday]);
            });

            it('next match is from former (postponed) matchday, all last matches are finished, update time > 0 => expect to return empty array', async () => {
                lastUpdateTime.timestampStats = 123456789;

                let lastMatch1: Match = {...lastMatch};
                let lastMatch2: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                lastMatch1.isFinished = true;
                lastMatch2.isFinished = true;
                nextMatch.matchday = lastMatch1.matchday - 1;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch1);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch1, lastMatch2]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([]);
            });

        });

        describe('finished match available, other matches at the same kickoff time from same and other matchday available', () => {
            
            var lastMatch: Match = {
                documentId: "last_match",
                season: 2022,
                matchday: 10,
                matchId: 299,
                timestamp: 123456789,
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

            it('next match is from next matchday, all last matches from all matchdays (including postponed) are finished, last update time of both matches == -1 => expect to return matchdays of current and postponed match', async () => {
                lastUpdateTime.timestampStats = -1;

                let lastMatch11: Match = {...lastMatch};
                let lastMatch12: Match = {...lastMatch};
                let lastMatch21: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                lastMatch11.isFinished = true;
                lastMatch12.isFinished = true;
                lastMatch21.isFinished = true;
                lastMatch21.matchday = 8;
            
                nextMatch.matchday = 11;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch11);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch11, lastMatch12, lastMatch21]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([10, 8]);     
            });

            it('next match is from next matchday, all last matches from all matchdays (including postponed) are finished, last update time of postponed match > 0 => expect to return matchdays of current and postponed match', async () => {
                let lastUpdateTime1: UpdateTime = {...lastUpdateTime};
                let lastUpdateTime2: UpdateTime = {...lastUpdateTime};
                
                lastUpdateTime1.timestampStats = -1;
                lastUpdateTime2.timestampStats = 123456789;

                let lastMatch11: Match = {...lastMatch};
                let lastMatch12: Match = {...lastMatch};
                let lastMatch21: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                lastMatch11.isFinished = true;
                lastMatch12.isFinished = true;
                lastMatch21.isFinished = true;
                lastMatch21.matchday = 8;
            
                nextMatch.matchday = 11;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch11);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch11, lastMatch12, lastMatch21]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime")
                    .withArgs(2022, 10).resolves(lastUpdateTime1)
                    .withArgs(2022, 8).resolves(lastUpdateTime2);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([10, 8]);     
            });

            it('next match is from next matchday, postponed match is not finished, the current matches are finished, last update time of both matches == -1 => expect to return only matchday of current matches', async () => {
                lastUpdateTime.timestampStats = -1;

                let lastMatch11: Match = {...lastMatch};
                let lastMatch12: Match = {...lastMatch};
                let lastMatch21: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                lastMatch11.isFinished = true;
                lastMatch12.isFinished = true;
                lastMatch21.isFinished = false;
                lastMatch21.matchday = 8;
            
                nextMatch.matchday = 11;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch11);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch11, lastMatch12, lastMatch21]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime").resolves(lastUpdateTime);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([10]);     
            });

            it('next match is from next matchday, postponed match finished, but not all of the current matches are finished, last update time of postponed match > 0 => expect to return only matchday of postponed match', async () => {
                let lastUpdateTime1: UpdateTime = {...lastUpdateTime};
                let lastUpdateTime2: UpdateTime = {...lastUpdateTime};
                
                lastUpdateTime1.timestampStats = -1;
                lastUpdateTime2.timestampStats = 123456789;

                let lastMatch11: Match = {...lastMatch};
                let lastMatch12: Match = {...lastMatch};
                let lastMatch21: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                lastMatch11.isFinished = true;
                lastMatch12.isFinished = false;
                lastMatch21.isFinished = true;
                lastMatch21.matchday = 8;
            
                nextMatch.matchday = 11;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch11);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch11, lastMatch12, lastMatch21]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime")
                    .withArgs(2022, 10).resolves(lastUpdateTime1)
                    .withArgs(2022, 8).resolves(lastUpdateTime2);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([8]);     
            });

            it('next match is from current matchday, all last matches from all matchdays (including postponed) are finished, last update time of postponed match > 0 => expect to return only matchdays of postponed match', async () => {
                let lastUpdateTime1: UpdateTime = {...lastUpdateTime};
                let lastUpdateTime2: UpdateTime = {...lastUpdateTime};
                
                lastUpdateTime1.timestampStats = -1;
                lastUpdateTime2.timestampStats = 123456789;

                let lastMatch11: Match = {...lastMatch};
                let lastMatch12: Match = {...lastMatch};
                let lastMatch21: Match = {...lastMatch};
                let nextMatch = {...lastMatch};
                
                lastMatch11.isFinished = true;
                lastMatch12.isFinished = true;
                lastMatch21.isFinished = true;
                lastMatch21.matchday = 8;
            
                nextMatch.matchday = 10;

                sandbox.stub(appdata, "getLastMatch").resolves(lastMatch11);
                sandbox.stub(appdata, "getMatchesByTimestamp").resolves([lastMatch11, lastMatch12, lastMatch21]);
                sandbox.stub(appdata, "getNextMatch").resolves(nextMatch);
                sandbox.stub(appdata, "getLastUpdateTime")
                    .withArgs(2022, 10).resolves(lastUpdateTime1)
                    .withArgs(2022, 8).resolves(lastUpdateTime2);

                const matchdays: number[] = await sync_live_helpers.getMatchdaysForStatsUpdate(2022);

                expect(matchdays).to.deep.equal([8]);     
            });

        });

    });
    
});