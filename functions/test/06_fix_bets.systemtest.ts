import {describe, it} from "mocha";
import {expect} from "chai";
import * as sinon from "sinon";
import * as appdata from "../src/data_access/appdata_access";
import * as fix_bets_helpers from "../src/fix_bets/fix_bets_helper";
import * as fix_bets from "../src/fix_bets/fix_bets";
import * as util from "../src/util";
import {Bet} from "../../src/app/Businessrules/basic_datastructures";
import {SyncPhase} from "../src/data_access/import_datastructures";

describe('fix_bets_helper', () => {

    describe('getRelevantBets', () => {
        var sandbox: any;

        const syncPhase: SyncPhase = {
            documentId: "mtEAeAdhcmcUC4nY1FUF",
            start: 1683311400,
            matchIds: [64136, 64142]
        };

        before(async () => {

            await appdata.setBet({
                documentId: "bet641360",
                goalsHome: 1,
                goalsAway: 0,
                isFixed: true,
                matchId: 64136,
                userId: "user_0"
            });

            await appdata.setBet({
                documentId: "bet641361",
                goalsHome: 1,
                goalsAway: 1,
                isFixed: true,
                matchId: 64136,
                userId: "user_1"
            });

            await appdata.setBet({
                documentId: "bet641420",
                goalsHome: 2,
                goalsAway: 0,
                isFixed: true,
                matchId: 64142,
                userId: "user_0"
            });

            await appdata.setBet({
                documentId: "bet641421",
                goalsHome: 3,
                goalsAway: 0,
                isFixed: true,
                matchId: 64142,
                userId: "user_1"
            });
        });

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('no bets pending => expect to return empty array', async () => {
            const bets: Bet[] = await fix_bets_helpers.getRelevantBets([syncPhase]);

            expect(bets).to.deep.equal([]);            
        });

        it('bets pending => expect to return pending bets', async () => {
            await appdata.setBet({
                documentId: "bet641362",
                goalsHome: 4,
                goalsAway: 1,
                isFixed: false,
                matchId: 64136,
                userId: "user_2"
            });

            await appdata.setBet({
                documentId: "bet641423",
                goalsHome: 0,
                goalsAway: 1,
                isFixed: false,
                matchId: 64142,
                userId: "user_3"
            });

            await appdata.setBet({
                documentId: "bet641443",
                goalsHome: 0,
                goalsAway: 0,
                isFixed: false,
                matchId: 64144,
                userId: "user_3"
            });

            const bets: Bet[] = await fix_bets_helpers.getRelevantBets([syncPhase]);

            expect(bets.length).to.equal(2);            
        });
        
    });

    describe('updateBets', () => {
        var sandbox: any;

        beforeEach(async () => {
            sandbox = sinon.createSandbox();

            await appdata.setBet({
                documentId: "bet641362",
                goalsHome: 4,
                goalsAway: 1,
                isFixed: false,
                matchId: 64136,
                userId: "user_2"
            });

            await appdata.setBet({
                documentId: "bet641423",
                goalsHome: 0,
                goalsAway: 1,
                isFixed: false,
                matchId: 64142,
                userId: "user_3"
            });
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('bet array empty => expect to do nothing and return true', async () => {
            const spy = sandbox.spy(appdata, "setBet");

            const isSuccessful: boolean = await fix_bets_helpers.updateBets([]);
            
            expect(spy.notCalled).to.be.true;
            expect(isSuccessful).to.be.true;            
        });

        it('two bets pending => expect to return true and call setBet twice', async () => {
            const spy = sandbox.spy(appdata, "setBet");

            const bets: Bet[] = [
                {
                    documentId: "bet641362",
                    goalsHome: 4,
                    goalsAway: 1,
                    isFixed: false,
                    matchId: 64136,
                    userId: "user_2"
                },
                {
                    documentId: "bet641423",
                    goalsHome: 0,
                    goalsAway: 1,
                    isFixed: false,
                    matchId: 64142,
                    userId: "user_3"
                }
            ];

            const isSuccessful: boolean = await fix_bets_helpers.updateBets(bets);

            expect(spy.calledTwice).to.be.true;
            expect(isSuccessful).to.be.true;
        });

        it('two bets pending => expect correct update in app database', async () => {
            const bets: Bet[] = [
                {
                    documentId: "bet641362",
                    goalsHome: 4,
                    goalsAway: 1,
                    isFixed: false,
                    matchId: 64136,
                    userId: "user_2"
                },
                {
                    documentId: "bet641423",
                    goalsHome: 0,
                    goalsAway: 1,
                    isFixed: false,
                    matchId: 64142,
                    userId: "user_3"
                }
            ];

            await fix_bets_helpers.updateBets(bets);

            const bet641362: Bet = await appdata.getBet(64136, "user_2");
            const bet641423: Bet = await appdata.getBet(64142, "user_3");

            expect(bet641362.isFixed).to.be.true;
            expect(bet641423.isFixed).to.be.true;
        });
    });
    
});

describe.only('fixBets', () => {
    var sandbox: any;

    before(async () => {
        await appdata.setSyncPhase({
            documentId: "mtEAeAdhcmcUC4nY1FUF",
            start: 1683379800,
            matchIds: [64139, 64138, 64140, 64135, 64141]
        });        
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    after(async () => {
        await appdata.deleteSyncPhases("==", 1683379800);
    });

    it('time reached, but no bets given at all => expect not call getRelevantBets', async () => {
        sandbox.stub(util, "getCurrentTimestamp").returns(1683379801)
        const spy1 = sandbox.spy(fix_bets_helpers, "updateBets");
        const spy2 = sandbox.spy(fix_bets_helpers, "getRelevantBets");

        await fix_bets.fixBets();

        expect(spy1.notCalled).to.be.true;        
        expect(spy2.called).to.be.true;      
    });

    it('time not reached => expect to not call getRelevantBets and updateBets', async () => {
        sandbox.stub(util, "getCurrentTimestamp").returns(1683379799)
        const spy1 = sandbox.spy(fix_bets_helpers, "updateBets");
        const spy2 = sandbox.spy(fix_bets_helpers, "getRelevantBets");

        await fix_bets.fixBets();

        expect(spy1.notCalled).to.be.true;        
        expect(spy2.notCalled).to.be.true;        
    });

    it('time reached, but no open bets => expect to not call updateBets', async () => {
        await appdata.setBet({
            documentId: "bet641380",
            goalsHome: 0,
            goalsAway: 1,
            isFixed: true,
            matchId: 64138,
            userId: "user_0"

        });
        await appdata.setBet({
            documentId: "bet641412",
            goalsHome: 1,
            goalsAway: 1,
            isFixed: true,
            matchId: 64141,
            userId: "user_2"

        });

        sandbox.stub(util, "getCurrentTimestamp").returns(1683379801)
        const spy1 = sandbox.spy(fix_bets_helpers, "updateBets");
        const spy2 = sandbox.spy(fix_bets_helpers, "getRelevantBets");

        await fix_bets.fixBets();

        expect(spy1.notCalled).to.be.true;        
        expect(spy2.called).to.be.true;        
    });

    it('time not reached and open bets available => expect to not call getRelevantBets and updateBets', async () => {
        await appdata.setBet({
            documentId: "bet641380",
            goalsHome: 0,
            goalsAway: 1,
            isFixed: false,
            matchId: 64138,
            userId: "user_0"

        });
        await appdata.setBet({
            documentId: "bet641412",
            goalsHome: 1,
            goalsAway: 1,
            isFixed: false,
            matchId: 64141,
            userId: "user_2"

        });

        sandbox.stub(util, "getCurrentTimestamp").returns(1683379799)
        const spy1 = sandbox.spy(fix_bets_helpers, "updateBets");
        const spy2 = sandbox.spy(fix_bets_helpers, "getRelevantBets");

        await fix_bets.fixBets();

        expect(spy1.notCalled).to.be.true;        
        expect(spy2.notCalled).to.be.true;        
    });

    it('time reached and open bets available => expect to call according functions and expect correct data', async () => {
        await appdata.setBet({
            documentId: "bet641380",
            goalsHome: 0,
            goalsAway: 1,
            isFixed: false,
            matchId: 64138,
            userId: "user_0"

        });
        await appdata.setBet({
            documentId: "bet641412",
            goalsHome: 1,
            goalsAway: 1,
            isFixed: false,
            matchId: 64141,
            userId: "user_2"

        });

        sandbox.stub(util, "getCurrentTimestamp").returns(1683379801)
        const spy1 = sandbox.spy(fix_bets_helpers, "updateBets");
        const spy2 = sandbox.spy(appdata, "setBet");

        await fix_bets.fixBets();

        const bet641380: Bet = await appdata.getBet(64138, "user_0");
        const bet641412: Bet = await appdata.getBet(64141, "user_2");

        expect(spy1.calledOnce).to.be.true;  
        expect(spy2.calledTwice).to.be.true; 
        expect(bet641380.isFixed).to.be.true;
        expect(bet641412.isFixed).to.be.true;
    });

});