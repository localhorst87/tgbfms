import { describe, it } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import * as appdata from "../src/data_access/appdata_access";
import * as matchdata from "../src/data_access/matchdata_access";
import * as sync_live from "../src/sync_live/sync_live";
import * as sync_live_helper from "../src/sync_live/sync_live_helpers";
import * as util from "../src/util";
import { Match, SeasonResult} from "../../src/app/Businessrules/basic_datastructures";
import { MatchdayScoreSnapshot, SyncPhase, UpdateTime } from "../src/data_access/import_datastructures";
import * as rule_defined_values from "../src/business_rules/rule_defined_values";
import { SeasonBet } from "../src/business_rules/basic_datastructures";
import { Table } from "../src/data_access/export_datastructures";

describe('sync_live_helpers', () => {
    
    describe('getAllSeasonBets', () => {
        
        it('request one user => expect correct documents', async () => {
            const seasonBets: SeasonBet[] = await sync_live_helper.getAllSeasonBets(2022, [{
                documentId: "",
                id: "gLwLn9HxwkMwHf28drJGVhRbC1y1",
                isActive: true,
                isAdmin: true,
                email: "bla@gmx.de",
                displayName: "Avlov",
                configs: {
                    notificationLevel: 0,
                    notificationTime: 0.5,
                    theme: "light"
                }
            }]);

            expect(seasonBets.length).to.equal(5);
            expect(seasonBets.map(bet => bet.documentId).includes("4zNJZz402DfgMO9cRVNh")).to.be.true; // test one sample
        });

    });

    describe('getMatchdayScoreSnapshots', () => {
        
        it('snapshots available => expect to return correct score snapshots', async () => {
            const snapshots: MatchdayScoreSnapshot[] = await sync_live_helper.getMatchdayScoreSnapshots(2022, [9, 10, 11]);

            expect(snapshots.map(snapshot => snapshot.documentId)).to.deep.equal([
                "BrgD0YlcGCPm5nWzuUZ4",
                "nHJmzltvhHKWb5BXIy7H",
                "EfunylT4yphNVNII7o6G"
            ]);            
        });

        it('snapshots not available => expect dummy score snapshots', async () => {
            const snapshots: MatchdayScoreSnapshot[] = await sync_live_helper.getMatchdayScoreSnapshots(2050, [1, 2]);

            expect(snapshots).to.deep.equal([
                {
                    documentId: "",
                    season: 2050,
                    matchday: 1,
                    scores: []
                },
                {
                    documentId: "",
                    season: 2050,
                    matchday: 2,
                    scores: []
                },
            ]);
        });

    });

    describe('getSeasonScoreSnapshot', () => {

        it('basic function test', async () => {
            const scoreSnap: MatchdayScoreSnapshot = await sync_live_helper.getSeasonScoreSnapshot(2022, 5, [
                {
                    documentId: "",
                    id: "gLwLn9HxwkMwHf28drJGVhRbC1y1",
                    isActive: true,
                    isAdmin: true,
                    email: "bla@gmx.de",
                    displayName: "Avlov",
                    configs: {
                        notificationLevel: 0,
                        notificationTime: 0.5,
                        theme: "light"
                    }
                },
                {
                    documentId: "",
                    id: "QeJBkfpnDha5h28jxZvRnSJcr322",
                    isActive: true,
                    isAdmin: false,
                    email: "bla@gmx.de",
                    displayName: "Avlov",
                    configs: {
                        notificationLevel: 0,
                        notificationTime: 0.5,
                        theme: "light"
                    }
                }
            ]);
    
            expect(scoreSnap.scores.length).to.equal(2);
            expect(scoreSnap.scores[0].points == scoreSnap.scores[0].extraSeason).to.be.true; 
        });
             
    });

});

describe('syncMatches', () => {
    var sandbox: any;
    var relevantMatchIds: number[] = [64121, 64122, 64125]; // season 2022, matchday 29
    var matchesToSync: Match[] = [];

    async function getDBData(matchIds: number[]): Promise<Match[]> {
        let matchesToCheck: Match[] = [];
        for (let id of matchIds)
            matchesToCheck.push(await appdata.getMatch(id));
        
        return matchesToCheck;
    }

    function wait(timeSec: number): Promise<string> {
        return new Promise(function(resolve) {
            setTimeout(() => resolve(String(timeSec)), timeSec*1000);
        });
    }

    // first reset the data so that will not be the same as in the reference DB
    beforeEach(async () => {
        sandbox = sinon.createSandbox();

        sandbox.stub(rule_defined_values, "SEASON").value(2022);

        matchesToSync = [];        
        for (let id of relevantMatchIds) {
            let match: Match = await appdata.getMatch(id);

            match.goalsHome = -1,
            match.goalsAway = -1,
            match.isFinished = false;

            matchesToSync.push(match);
            await appdata.setMatch(match);
        }    
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('sync successful => expect output to be correct', async () => {
        const syncedMatches: Match[] = await sync_live.syncMatches(matchesToSync);

        expect(syncedMatches.map(match => match.matchId)).to.deep.equal(relevantMatchIds);
    });

    it('sync successful => expect sync timestamp to be updated', async () => {
        const timestampNow: number = util.getCurrentTimestamp();
        await sync_live.syncMatches(matchesToSync);
        const updateTime: number = (await appdata.getLastUpdateTime(2022, 29)).timestampMatches;

        expect(updateTime).to.be.greaterThanOrEqual(timestampNow);
    });

    it('sync successful => expect matches to be updated', async () => {
        await sync_live.syncMatches(matchesToSync);

        const matchesToCheck: Match[] = await getDBData(matchesToSync.map(match => match.matchId));
        
        expect(matchesToCheck.map(match => match.goalsHome).includes(-1)).to.not.be.true;
        expect(matchesToCheck.map(match => match.goalsAway).includes(-1)).to.not.be.true;
        expect(matchesToCheck.map(match => match.isFinished).includes(false)).to.not.be.true;
    });

    it('reference data not available => expect to not update anything', async () => {
        sandbox.stub(sync_live_helper, "getReferenceMatchData").resolves([]);
        
        const syncedMatches: Match[] = await sync_live.syncMatches(matchesToSync);

        const matchesToCheck: Match[] = await getDBData(matchesToSync.map(match => match.matchId));
        
        expect(syncedMatches).to.deep.equal([]);     
        expect(matchesToCheck.map(match => match.goalsHome)).to.deep.equal([-1, -1, -1]);
        expect(matchesToCheck.map(match => match.goalsAway)).to.deep.equal([-1, -1, -1]);
        expect(matchesToCheck.map(match => match.isFinished)).to.deep.equal([false, false, false]);   
    });

    it('reference data not available => expect to not update anything', async () => {
        sandbox.stub(sync_live_helper, "getReferenceMatchData").resolves([]);
        
        const syncedMatches: Match[] = await sync_live.syncMatches(matchesToSync);

        const matchesToCheck: Match[] = await getDBData(matchesToSync.map(match => match.matchId));
        
        expect(syncedMatches).to.deep.equal([]);     
        expect(matchesToCheck.map(match => match.goalsHome)).to.deep.equal([-1, -1, -1]);
        expect(matchesToCheck.map(match => match.goalsAway)).to.deep.equal([-1, -1, -1]);
        expect(matchesToCheck.map(match => match.isFinished)).to.deep.equal([false, false, false]);   
    });

    it('reference data partly available => expect to update only available matches', async () => {
        sandbox.stub(sync_live_helper, "getReferenceMatchData").resolves([
            {
                season: 2022,
                matchday: 29,
                matchId: 64121,
                datetime: "2023-04-23T17:30:00Z",
                isFinished: true,
                teamIdHome: 87,
                teamIdAway: 80,
                goalsHome: 0,
                goalsAway: 1
            }
        ]);

        const syncedMatches: Match[] = await sync_live.syncMatches(matchesToSync);

        const matchesToCheck: Match[] = await getDBData([64121]);
        
        expect(syncedMatches.map(match => match.matchId)).to.deep.equal([64121]);     
        expect(matchesToCheck.map(match => match.goalsHome)).to.deep.equal([0]);
        expect(matchesToCheck.map(match => match.goalsAway)).to.deep.equal([1]);
        expect(matchesToCheck.map(match => match.isFinished)).to.deep.equal([true]); 
    });   
    
    it('setMatch does not work properly => expect to not set matches', async () => {
        sandbox.stub(appdata, "setMatch").resolves(false);

        // wait at least 1 second to assure that update time in DB is not the same as the current timestamp
        // due to other tests before
        await wait(1); 
        const timestampFcnCall: number = util.getCurrentTimestamp();
        const syncedMatches: Match[] = await sync_live.syncMatches(matchesToSync);

        const updateTime: number = (await appdata.getLastUpdateTime(2022, 29)).timestampMatches;

        expect(syncedMatches).to.deep.equal([]);
        expect(updateTime).to.be.lessThan(timestampFcnCall);
    });

});

describe('syncTeamRanking', () => {
    var sandbox: any;

    async function getDBData(place: number): Promise<SeasonResult> {
        const rankingAppData: SeasonResult[] = await appdata.getSeasonResults(2022);
        
        return rankingAppData.filter(seasonResult => seasonResult.place == place)[0];
    }

    beforeEach(async () => {
        sandbox = sinon.createSandbox();

        // change some results to -1 before test begins
        let rankingAppData: SeasonResult[] = await appdata.getSeasonResults(2022);
        let place1: SeasonResult = rankingAppData.filter(seasonResult => seasonResult.place == 1)[0];
        let place18: SeasonResult = rankingAppData.filter(seasonResult => seasonResult.place == -1)[0];
        place1.teamId = -1;
        place18.teamId = -1;
        await appdata.setSeasonResult(place1);
        await appdata.setSeasonResult(place18);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('preconditions ok => expect return value to be true', async () => {
        const updateSuccessful: boolean = await sync_live.syncTeamRanking(2022);

        expect(updateSuccessful).to.be.true;        
    });

    it('preconditions ok => expect data to be updated', async () => {
        await sync_live.syncTeamRanking(2022);
        
        const place1: SeasonResult = await getDBData(1);
        const place18: SeasonResult = await getDBData(-1);

        expect(place1.teamId).to.not.equal(-1);
        expect(place18.teamId).to.not.equal(-1);
    });

    it('firestore does not yield data => expect to return false', async () => {
        sandbox.stub(appdata, "getSeasonResults").resolves([]);  
        const updateSuccessful: boolean = await sync_live.syncTeamRanking(2022);

        expect(updateSuccessful).to.be.false;

    });

    it('reference data not served => expect to return false', async () => {
        sandbox.stub(matchdata, "importCurrentTeamRanking").resolves([]);     
        const updateSuccessful: boolean = await sync_live.syncTeamRanking(2022);
        
        expect(updateSuccessful).to.be.false;
    });

    it('reference data not complete => expect to return false', async () => {
        sandbox.stub(matchdata, "importCurrentTeamRanking").resolves([
            {
                teamId: 78,
                matches: 2,
                points: 6,
                won: 2,
                draw: 0,
                lost: 0,
                goals: 7,
                goalsAgainst: 1
            },
            {
                teamId: 100,
                matches: 2,
                points: 6,
                won: 2,
                draw: 0,
                lost: 0,
                goals: 3,
                goalsAgainst: 0
            }
        ]);  

        const updateSuccessful: boolean = await sync_live.syncTeamRanking(2022);
        
        expect(updateSuccessful).to.be.false;        
    });

    it('setSeasonResult fails => expect to return false', async () => {
        sandbox.stub(appdata, "setSeasonResult").resolves(false);
        const updateSuccessful: boolean = await sync_live.syncTeamRanking(2022);
        
        expect(updateSuccessful).to.be.false;
    });
    
});

describe('updateScoreSnapshot', () => {
    var sandbox: any;

    beforeEach(async () => {
        sandbox = sinon.createSandbox();

        let scoreSnapshot: MatchdayScoreSnapshot = await appdata.getMatchdayScoreSnapshot(2022, 29);
        for (let i = 0; i < 8; i++) {
            scoreSnapshot.scores[i].points = 0;
            scoreSnapshot.scores[i].matches = 0;
        }
        await appdata.setMatchdayScoreSnapshot(scoreSnapshot);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('preconditions ok => expect return value to be true', async () => {
        const updateSuccessful: boolean = await sync_live.updateScoreSnapshot(2022, 29);

        expect(updateSuccessful).to.be.true;        
    });

    it('preconditions ok => expect data to be updated', async () => {
        await sync_live.updateScoreSnapshot(2022, 29);
        const scoreSnapshot: MatchdayScoreSnapshot = await appdata.getMatchdayScoreSnapshot(2022, 29);

        expect(scoreSnapshot.scores.map(score => score.points).reduce((sum, val) => sum + val, 0)).to.be.greaterThan(0);
        expect(scoreSnapshot.scores.map(score => score.matches).reduce((sum, val) => sum + val, 0)).to.be.greaterThan(0);
    });

    it('active users empty => expect return value to be false', async () => {
        sandbox.stub(appdata, "getActiveUsers").resolves([]);
        const updateSuccessful: boolean = await sync_live.updateScoreSnapshot(2022, 29);

        expect(updateSuccessful).to.be.false;
    });

    it('matches empty => expect return value to be false', async () => {
        sandbox.stub(appdata, "getMatchesByMatchday").resolves([]);
        const updateSuccessful: boolean = await sync_live.updateScoreSnapshot(2022, 29);

        expect(updateSuccessful).to.be.false;
    });

    it('allBets empty => expect return value to be false', async () => {
        sandbox.stub(sync_live_helper, "getAllBetsOfMatches").resolves([]);
        const updateSuccessful: boolean = await sync_live.updateScoreSnapshot(2022, 29);

        expect(updateSuccessful).to.be.false;
    });

});

describe('updateTablesView', () => {

    var sandbox: any;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('no active users => expect to not update', async () => {
        sandbox.stub(appdata, "getActiveUsers").resolves([]);
        const isSuccessful: boolean = await sync_live.updateTablesView(2021, 17);
        
        expect(isSuccessful).to.be.false;
    });

    it('all preconditions given, matchday = 17 => expect to set all Tables except second half', async () => {
        const isSuccessful: boolean = await sync_live.updateTablesView(2021, 17);

        const totalTable: Table = await appdata.getTableView("total", 2021, 17);
        const secondHalfTable: Table = await appdata.getTableView("second_half", 2021, 17);
        
        expect(isSuccessful).to.be.true;
        expect(totalTable.tableData[0].userName).to.deep.equal("Fede");
        expect(totalTable.tableData[0].points).to.equal(113);
        expect(secondHalfTable.tableData).to.deep.equal([]);
    }).timeout(5*60*1000);

    it('all preconditions given, matchday = 34 => expect to set all Tables correctly', async () => {
        const isSuccessful: boolean = await sync_live.updateTablesView(2021, 34);

        const totalTable: Table = await appdata.getTableView("total", 2021, 34);
        const finalTable: Table = await appdata.getTableView("final", 2021, 34);
        const secondHalfTable: Table = await appdata.getTableView("second_half", 2021, 34);
        const last5Table: Table = await appdata.getTableView("last_5", 2021, 34);

        expect(isSuccessful).to.be.true;
        expect(totalTable.tableData[0].userName).to.deep.equal("Fede");
        expect(totalTable.tableData[0].points).to.equal(214);
        expect(totalTable.tableData[7].userName).to.deep.equal("Christian");   
        expect(finalTable.tableData[0].points).to.equal(223);
        expect(secondHalfTable.tableData[0].userName).to.deep.equal("Marcel");
        expect(secondHalfTable.tableData[0].points).to.equal(109);
        expect(last5Table.tableData[0].userName).to.deep.equal("Mauri");
        expect(last5Table.tableData[0].points).to.equal(33);
    }).timeout(5*60*1000);
    
});

describe('syncLive', () => {
    var sandbox: any;

    beforeEach(async () => {
        sandbox = sinon.createSandbox();

        sandbox.stub(rule_defined_values, "SEASON").value(2022);

        // reset match results
        const matches29: Match[] = await appdata.getMatchesByMatchday(2022, 29);
        for (let match of matches29) {
            match.goalsAway = -1;
            match.goalsHome = -1;
            match.isFinished = false;

            await appdata.setMatch(match);
        }

        // reset ranking
        const rankingAppData: SeasonResult[] = await appdata.getSeasonResults(2022);
        for (let ranking of rankingAppData) {
            ranking.teamId = -1;
            await appdata.setSeasonResult(ranking);
        }

        // reset score snapshot 
        let scoreSnapshot: MatchdayScoreSnapshot = await appdata.getMatchdayScoreSnapshot(2022, 29);
        scoreSnapshot.scores = [];
        await appdata.setMatchdayScoreSnapshot(scoreSnapshot);

        // set sync phases
        const syncPhases: SyncPhase[] = [
            {
                documentId: "",
                start: 1682101800,
                matchIds: [64117]
            },
            {
                documentId: "",
                start: 1682170200,
                matchIds: [64119, 64125, 64124, 64123]
            },
            {
                documentId: "",
                start: 1682181000,
                matchIds: [64020]
            },
            {
                documentId: "",
                start: 1682256600,
                matchIds: [64122]
            },
            {
                documentId: "",
                start: 1682263800,
                matchIds: [64118]
            },
            {
                documentId: "",
                start: 1682271000,
                matchIds: [64121]
            }
        ];
        for (let syncPhase of syncPhases) {
            await appdata.setSyncPhase(syncPhase);
        }
    });

    afterEach(async () => {
        sandbox.restore();
        await appdata.deleteSyncPhases(">=", 1682101800);
    });

    it('current timestamp before first match => expect to do nothing', async () => {
        sandbox.stub(util, "getCurrentTimestamp").returns(1682101799);

        await sync_live.syncLive();
        
        const matchesData: Match[] = await appdata.getMatchesByMatchday(2022, 29);
        const rankingData: SeasonResult[] = await appdata.getSeasonResults(2022);
        const snapshotData: MatchdayScoreSnapshot = await appdata.getMatchdayScoreSnapshot(2022, 29);
        const updateData: UpdateTime = await appdata.getLastUpdateTime(2022, 29);

        expect(matchesData
                .map(match => match.goalsHome)
                .reduce((isMinus1, val) => isMinus1 && val == -1, true))
            .to.be.true; // all values -1

        expect(matchesData
            .map(match => match.goalsAway)
            .reduce((isMinus1, val) => isMinus1 && val == -1, true))
        .to.be.true; // all values -1

        expect(matchesData
            .map(match => match.isFinished)
            .reduce((isNotFinished, val) => isNotFinished && val === false, true))
        .to.be.true; // all values false

        expect(rankingData
            .map(ranking => ranking.teamId)
            .reduce((isMinus1, val) => isMinus1 && val == -1, true))
        .to.be.true; // all values -1

        expect(snapshotData.scores).to.deep.equal([]);

        expect(updateData.timestampMatches).to.not.equal(1682101799);
    });

    it('first sync phase has begun => expect to sync match of first sync phase', async () => {
        sandbox.stub(util, "getCurrentTimestamp").returns(1682108700);

        // first call
        await sync_live.syncLive();

        const matchesData: Match[] = await appdata.getMatchesByMatchday(2022, 29);
        const rankingData: SeasonResult[] = await appdata.getSeasonResults(2022);
        const snapshotData: MatchdayScoreSnapshot = await appdata.getMatchdayScoreSnapshot(2022, 29);
        const updateData: UpdateTime = await appdata.getLastUpdateTime(2022, 29);
        const syncPhasesFirstCall: SyncPhase[] = await appdata.getSyncPhases("==", 1682101800);

        // second call
        await sync_live.syncLive();
        const syncPhasesSecondCall: SyncPhase[] = await appdata.getSyncPhases("==", 1682101800);

        // match 64117
        expect(matchesData.filter(match => match.matchId == 64117)[0].goalsHome).to.equal(1);
        expect(matchesData.filter(match => match.matchId == 64117)[0].goalsAway).to.equal(1);
        expect(matchesData.filter(match => match.matchId == 64117)[0].isFinished).to.be.true;

        // other matches
        expect(matchesData
            .filter(match => match.matchId != 64117)
            .map(match => match.goalsHome)
            .reduce((isMinus1, val) => isMinus1 && val == -1, true))
        .to.be.true; // all values -1

        // ranking must be refreshed
        expect(rankingData
            .map(ranking => ranking.teamId)
            .includes(-1))
        .to.be.false; // no value must be -1

        // score must be refreshed
        expect(snapshotData.scores).to.not.deep.equal([]);

        // update time must be refreshed
        expect(updateData.timestampMatches).to.equal(1682108700);

        // sync phase must still exist (must be removed on next call)
        expect(syncPhasesFirstCall.length).to.equal(1);
        
        // sync phase must be removed after second call
        expect(syncPhasesSecondCall.length).to.equal(0);
    }).timeout(5000);

    it('on first call, first sync phase has begun. On second call, second sync phase has begun => expect to sync matches of first two sync phases', async () => {
        // first call
        let stub: any = sandbox.stub(util, "getCurrentTimestamp").returns(1682108700);
        await sync_live.syncLive();

        // second call
        stub.returns(1682177100);
        await sync_live.syncLive();

        const matchesData: Match[] = await appdata.getMatchesByMatchday(2022, 29);
        const rankingData: SeasonResult[] = await appdata.getSeasonResults(2022);
        const snapshotData: MatchdayScoreSnapshot = await appdata.getMatchdayScoreSnapshot(2022, 29);
        const updateData: UpdateTime = await appdata.getLastUpdateTime(2022, 29);
        const syncPhasesSecondCall: SyncPhase[] = await appdata.getSyncPhases("<=", 1682170200);

        // third call
        await sync_live.syncLive();
        const syncPhasesThirdCall: SyncPhase[] = await appdata.getSyncPhases("<=", 1682170200);

        // match 64117
        expect(matchesData.filter(match => match.matchId == 64117)[0].goalsHome).to.equal(1);
        expect(matchesData.filter(match => match.matchId == 64117)[0].goalsAway).to.equal(1);
        expect(matchesData.filter(match => match.matchId == 64117)[0].isFinished).to.be.true;

        // match 64119
        expect(matchesData.filter(match => match.matchId == 64119)[0].goalsHome).to.equal(1);
        expect(matchesData.filter(match => match.matchId == 64119)[0].goalsAway).to.equal(5);
        expect(matchesData.filter(match => match.matchId == 64119)[0].isFinished).to.be.true;

        // match 64125
        expect(matchesData.filter(match => match.matchId == 64125)[0].goalsHome).to.equal(3);
        expect(matchesData.filter(match => match.matchId == 64125)[0].goalsAway).to.equal(1);
        expect(matchesData.filter(match => match.matchId == 64125)[0].isFinished).to.be.true;

        // match 64124
        expect(matchesData.filter(match => match.matchId == 64124)[0].goalsHome).to.equal(1);
        expect(matchesData.filter(match => match.matchId == 64124)[0].goalsAway).to.equal(3);
        expect(matchesData.filter(match => match.matchId == 64124)[0].isFinished).to.be.true;

        // match 64123
        expect(matchesData.filter(match => match.matchId == 64123)[0].goalsHome).to.equal(2);
        expect(matchesData.filter(match => match.matchId == 64123)[0].goalsAway).to.equal(4);
        expect(matchesData.filter(match => match.matchId == 64123)[0].isFinished).to.be.true;

        // ranking must be refreshed
        expect(rankingData.map(ranking => ranking.teamId).includes(-1)).to.be.false;

        // score must be refreshed
        expect(snapshotData.scores).to.not.deep.equal([]);

        // update time must be refreshed
        expect(updateData.timestampMatches).to.equal(1682177100);

        // sync phase must still exist (must be removed on next call)
        expect(syncPhasesSecondCall.length).to.equal(1);
        
        // sync phase must be removed after second call
        expect(syncPhasesThirdCall.length).to.equal(0);
    }).timeout(5000);
    
});