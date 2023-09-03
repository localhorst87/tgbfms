import * as rule_defined_values from "../src/business_rules/rule_defined_values";
import {describe, it} from "mocha";
import {expect} from "chai";
import * as sinon from "sinon";
import * as sync_topmatch_helpers from "../src/sync_topmatch/sync_topmatch_helpers";
import * as appdata from "../src/data_access/appdata_access";
import {Match} from "../../src/app/Businessrules/basic_datastructures";
import * as util from "../src/util";

describe('sync_topmatch_helpers', () => {

    describe('getNextMatches', () => {
        var sandbox: any;

        // make target match to be not finished to have a logically correct use case
        // (as getCurrentTimestamp will be mocked to be before the match starts)
        before(async () => {
            let match: Match = await appdata.getMatch(20510);
            match.isFinished = false;
            await appdata.setMatch(match);
        });

        beforeEach(() => {
            sandbox = sinon.createSandbox();        
        });

        afterEach(() => {
            sandbox.restore();
        });

        // restore original state
        after(async () => {
            let match: Match = await appdata.getMatch(20510);
            match.isFinished = true;
            await appdata.setMatch(match);
        });

        it('matches within time limit available => expect to return matches', async () => {
            const timestampSyncPhase: number = 1565980200;
            const timestampBefore: number = timestampSyncPhase - 3599;
            sandbox.stub(util, "getCurrentTimestamp").returns(timestampBefore);

            const nextMatches: Match[] = await sync_topmatch_helpers.getNextMatches();

            expect(nextMatches[0].documentId).to.deep.equal("vAWKf1MEEsDEtHr9bCqp");
        });

        it('no matches within time limit available => expect to return empty array', async () => {
            const timestampSyncPhase: number = 1565980200;
            const timestampBefore: number = timestampSyncPhase - 3601;
            sandbox.stub(util, "getCurrentTimestamp").returns(timestampBefore);

            const nextMatches: Match[] = await sync_topmatch_helpers.getNextMatches();

            expect(nextMatches).to.deep.equal([]);
        });
    
    });

    describe('getPendingTopMatchMatchdays', () => {
        var sandbox: any;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            sandbox.stub(rule_defined_values, "SEASON").value(2019);    
        });

        afterEach(() => {
            sandbox.restore();
        });

        // change matchday of matches, to be not equal to matchday of matches 20510, 20511, ...
        before(async () => {
            let match1000: Match = await appdata.getMatch(1000);
            let match1001: Match = await appdata.getMatch(1001);
            match1000.season = 2019;
            match1000.matchday = 2;
            match1001.season = 2019;
            match1001.matchday = 2;
            await appdata.setMatch(match1000);
            await appdata.setMatch(match1001);
        });

        // restore original data
        after(async () => {
            let match1000: Match = await appdata.getMatch(1000);
            let match1001: Match = await appdata.getMatch(1001);
            match1000.season = 2022;
            match1000.matchday = 1;
            match1001.season = 2022;
            match1001.matchday = 1;
            await appdata.setMatch(match1000);
            await appdata.setMatch(match1001);
        });

        it('only matches of one matchday, TM not selected => expect to return corresponding matchday', async () => {
            let matches: Match[] = [];
            matches.push(await appdata.getMatch(20511));
            matches.push(await appdata.getMatch(20512));
            matches.push(await appdata.getMatch(20513));

            const matchday: number[] = await sync_topmatch_helpers.getPendingTopMatchMatchdays(matches);

            expect(matchday[0]).to.equal(1);
        });

        it('matches of two matchdays, TM selected for one matchday => expect to return only corresponding matchday', async () => {
            let matches: Match[] = [];
            matches.push(await appdata.getMatch(20511));
            matches.push(await appdata.getMatch(1000));

            const matchday: number[] = await sync_topmatch_helpers.getPendingTopMatchMatchdays(matches);

            expect(matchday[0]).to.equal(1);
        });
 
        it('only matches with selected top match => expect empty array', async () => {
            let matches: Match[] = [];
            matches.push(await appdata.getMatch(1000));
            matches.push(await appdata.getMatch(1001));

            const matchday: number[] = await sync_topmatch_helpers.getPendingTopMatchMatchdays(matches);

            expect(matchday).to.deep.equal([]);
        });
    });

});