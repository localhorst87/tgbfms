import { describe, it } from "mocha";
import { expect } from "chai";
import * as sync_live from "../src/sync_live";
import * as appdata from "../src/data_access/appdata_access";
import { UpdateTime } from "../src/data_access/import_datastructures";

describe('setNewUpdateTimes', () => {

    it('one matchday', async () => {
        const updateTimeBefore: UpdateTime = await appdata.getLastUpdateTime(2030, 1);
        const matchdaysUpdated: number[] = await sync_live.setNewUpdateTimes(2030, [1]);
        const updateTimeAfter: UpdateTime = await appdata.getLastUpdateTime(2030, 1);

        expect(matchdaysUpdated).to.deep.equal([1]);
        expect(updateTimeAfter.timestamp).to.be.greaterThan(updateTimeBefore.timestamp);        
    });

    it('two matchdays', async () => {
        const updateTime1Before: UpdateTime = await appdata.getLastUpdateTime(2030, 1);
        const updateTime2Before: UpdateTime = await appdata.getLastUpdateTime(2030, 2);
        const matchdaysUpdated: number[] = await sync_live.setNewUpdateTimes(2030, [1, 2]);
        const updateTime1After: UpdateTime = await appdata.getLastUpdateTime(2030, 1);
        const updateTime2After: UpdateTime = await appdata.getLastUpdateTime(2030, 2);

        expect(matchdaysUpdated).to.deep.equal([1, 2]);
        expect(updateTime1After.timestamp).to.be.greaterThan(updateTime1Before.timestamp);   
        expect(updateTime2After.timestamp).to.be.greaterThan(updateTime2Before.timestamp);       
    });
    
});