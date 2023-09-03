import {describe, it} from "mocha";
import {expect} from "chai";
import * as sinon from "sinon";
import * as sync_topmatch from "../src/sync_topmatch/sync_topmatch";
import * as appdata from "../src/data_access/appdata_access";
import * as util from "../src/util";
import {Match, TopMatchVote} from "../src/business_rules/basic_datastructures";
import * as rule_defined_values from "../src/business_rules/rule_defined_values";
import * as admin from "firebase-admin";

describe('syncTopMatch system test', () => {
    function setVote(vote: TopMatchVote): Promise<boolean> {
        let documentReference: admin.firestore.DocumentReference;
        if (vote.documentId == "") {
            documentReference = admin.firestore().collection('topmatch_votes').doc()
        }
        else {
            documentReference = admin.firestore().collection('topmatch_votes').doc(vote.documentId);
        }
        
        // documentId should not be a property in the dataset itself, as it is meta-data
        let voteToSet: any = { ...vote };
        delete voteToSet.documentId;
        
        return documentReference.set(voteToSet)
            .then(() => {
                return true;
            })
            .catch((err: any) => {
                return false;
            });
    }

    var sandbox: any;

    // start timestamp of matchday 31
    const startTime31: number = 1683311400;

    // voting open/closed times
    const votingOpen: number = startTime31 - rule_defined_values.TOP_MATCH_VOTES_CLOSING_TIME_MINUTES*60 - 1;
    const votingClosed: number = startTime31 - rule_defined_values.TOP_MATCH_VOTES_CLOSING_TIME_MINUTES*60 + 1;

    // prepare data
    before(async () => {
        // set a sync phase
        appdata.setSyncPhase({
            documentId: "",
            matchIds: [64136, 64142],
            start: startTime31
        });

        // set votes
        await setVote({
            documentId: "",
            season: 2022,
            matchday: 31,
            matchId: 64140,
            userId: "user_0",
            timestamp: 1683300000
        });

        await setVote({
            documentId: "",
            season: 2022,
            matchday: 31,
            matchId: 64141,
            userId: "user_1",
            timestamp: 1683300001
        });

        await setVote({
            documentId: "",
            season: 2022,
            matchday: 31,
            matchId: 64140,
            userId: "user_2",
            timestamp: 1683300000
        });

    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(rule_defined_values, "SEASON").value(2022);
    });

    afterEach(() => {
        sandbox.restore();
    });

    // restore data
    after(async () => {
        await appdata.deleteSyncPhases("==", startTime31);
    });
    
    it('voting is still open => expect to not evaluate votes', async () => {
        sandbox.stub(util, "getCurrentTimestamp").returns(votingOpen);
        await sync_topmatch.syncTopMatch();

        const match64140: Match = await appdata.getMatch(64140);

        expect(match64140.isTopMatch).to.be.false;
    });

    it('voting is closed => expect to evaluate votes and update match', async () => {
        sandbox.stub(util, "getCurrentTimestamp").returns(votingClosed);
        await sync_topmatch.syncTopMatch();

        const match64140: Match = await appdata.getMatch(64140);

        expect(match64140.isTopMatch).to.be.true;
    });

});
