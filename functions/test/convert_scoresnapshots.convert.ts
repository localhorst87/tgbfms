import {describe, it} from "mocha";
import * as sync_live from "../src/sync_live/sync_live";
// import * as appdata from "../src/data_access/appdata_access";

describe('set tables', () => {
    it('test 1', async () => {
        for (let i = 1; i <= 3; i++) {
            await sync_live.updateTablesView(2023, i);
        };
    }).timeout(5*60*1000);
});



