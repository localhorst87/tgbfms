import { describe, it } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import * as sync_matchplan from "../src/sync_matchplan/sync_matchplan";
import * as appdata from "../src/data_access/appdata_access";
import * as matchdata from "../src/data_access/matchdata_access";
import * as util from "../src/util";
import { Match } from "../../src/app/Businessrules/basic_datastructures";
import { SyncPhase } from "../src/data_access/import_datastructures";

describe('syncMatchplan system test', () => {
    var sandbox: any;

    const expectedMatches31: Match[] = [
          {
            documentId: '2Ha42QdoDxrjLfDeiZ6D',
            season: 2022,
            matchday: 31,
            matchId: 64136,
            timestamp: 1683311400,
            isFinished: false,
            isTopMatch: false,
            teamIdHome: 6,
            teamIdAway: 65,
            goalsHome: -1,
            goalsAway: -1
          },
          {
            documentId: '7fDVLDY6jEjnH5uYIHEp',
            season: 2022,
            matchday: 31,
            matchId: 64137,
            timestamp: 1683473400,
            isFinished: false,
            isTopMatch: false,
            teamIdHome: 7,
            teamIdAway: 131,
            goalsHome: -1,
            goalsAway: -1
          },
          {
            documentId: 'R7PLj5VSxV2yUcEPPUWJ',
            season: 2022,
            matchday: 31,
            matchId: 64139,
            timestamp: 1683379800,
            isFinished: false,
            isTopMatch: false,
            teamIdHome: 112,
            teamIdAway: 1635,
            goalsHome: -1,
            goalsAway: -1
          },
          {
            documentId: 'Y30inOL4y3WT5oyFIrlo',
            season: 2022,
            matchday: 31,
            matchId: 64142,
            timestamp: 1683311400,
            isFinished: false,
            isTopMatch: false,
            teamIdHome: 81,
            teamIdAway: 9,
            goalsHome: -1,
            goalsAway: -1
          },
          {
            documentId: 'andEfdAAsxSc3TzqCQqA',
            season: 2022,
            matchday: 31,
            matchId: 64138,
            timestamp: 1683379800,
            isFinished: false,
            isTopMatch: false,
            teamIdHome: 87,
            teamIdAway: 129,
            goalsHome: -1,
            goalsAway: -1
          },
          {
            documentId: 'bSiADabSxH7KruLnlFVI',
            season: 2022,
            matchday: 31,
            matchId: 64140,
            timestamp: 1683379800,
            isFinished: false,
            isTopMatch: false,
            teamIdHome: 54,
            teamIdAway: 16,
            goalsHome: -1,
            goalsAway: -1
          },
          {
            documentId: 'hYLjVu7PmSGiS8dEKkdu',
            season: 2022,
            matchday: 31,
            matchId: 64135,
            timestamp: 1683379800,
            isFinished: false,
            isTopMatch: false,
            teamIdHome: 95,
            teamIdAway: 80,
            goalsHome: -1,
            goalsAway: -1
          },
          {
            documentId: 'j65A8b3gXxmFHeNMR4oB',
            season: 2022,
            matchday: 31,
            matchId: 64143,
            timestamp: 1683390600,
            isFinished: false,
            isTopMatch: false,
            teamIdHome: 134,
            teamIdAway: 40,
            goalsHome: -1,
            goalsAway: -1
          },
          {
            documentId: 'kCfJnpEPUfrLGGkxyWks',
            season: 2022,
            matchday: 31,
            matchId: 64141,
            timestamp: 1683379800,
            isFinished: false,
            isTopMatch: false,
            teamIdHome: 175,
            teamIdAway: 91,
            goalsHome: -1,
            goalsAway: -1
          }
        ];

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('preconditions ok => expect to update expected matchdays and add sync phases', async () => {
        const timestampNow: number = 1683273600; // Friday, May 5th, 10:00 CET, day when matchday 30 begins
        const timestampPlus2Days: number = 1683496799; // Sunday, May 7th, 23:59:59 CET
        sandbox.stub(util, "getCurrentTimestamp").returns(timestampNow); 
        sandbox.stub(util, "getFutureEndDate").returns(timestampPlus2Days); 

        // stub reference data, as it is subject to change over time
        // enforce only updates for matchday 31
        sandbox.stub(matchdata, "getLastUpdateTime")
          .withArgs(2022, 29).resolves(-1) // no new data
          .withArgs(2022, 30).resolves(-1) // new data
          .withArgs(2022, 31).resolves(9999999999) // no new data
          .withArgs(2022, 32).resolves(-1) // no new data
          .withArgs(2022, 33).resolves(-1) // no new data
          .withArgs(2022, 34).resolves(-1); // no new data

        await sync_matchplan.syncMatchplan();

        const matches31: Match[] = await appdata.getMatchesByMatchday(2022, 31);
        const syncPhases: SyncPhase[] = await appdata.getSyncPhases(">", timestampNow);
        const matches31Sorted: Match[] = matches31.sort((a,b) => a.matchId - b.matchId);
        const expectedMatches31Sorted: Match[] = expectedMatches31.sort((a,b) => a.matchId - b.matchId);

        // expect matches to be updated
        expect(matches31Sorted).to.deep.equal(expectedMatches31Sorted);

        // expect 4 sync phases to be added
        expect(syncPhases.length).to.equal(4);
    });
});