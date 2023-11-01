import {describe, it} from "mocha";
import {expect} from "chai";
import * as sinon from "sinon";
import {User} from "../src/business_rules/basic_datastructures";
import * as appdata from "../src/data_access/appdata_access";
import * as email_notifier_helpers from "../src/email_notifier/email_notifier_helpers";
import * as email_notifier from "../src/email_notifier/email_notifier";
import * as util from "../src/util";
import * as admin from "firebase-admin";
import { SyncPhase } from "../src/data_access/import_datastructures";

function setUser(user: User): Promise<boolean> {
  let documentReference: admin.firestore.DocumentReference;
  if (user.documentId == "") {
    documentReference = admin.firestore().collection('users').doc()
  }
  else {
    documentReference = admin.firestore().collection('users').doc(user.documentId);
  }

  // documentId should not be a property in the dataset itself, as it is meta-data
  let userToSet: any = { ...user };
  delete userToSet.documentId;

  return documentReference.set(userToSet)
    .then(() => {
      return true;
    })
    .catch((err: any) => {
      return false;
    });
}

describe('email_notifier', () => {

  describe("email_notifier_helpers", () => {

    describe('getUsersWithNotification', () => {
  
      // before each test, set all users to notification level 0
      beforeEach(async () => {
        let users: User[] = await appdata.getActiveUsers();
        for (let user of users) {
          user.configs.notificationLevel = 0;
          await setUser(user);
        }
      });
  
      it('no user has setup notification => expect empty array', async () => {
        const users: User[] = await email_notifier_helpers.getUsersWithNotification();
        expect(users.length).to.equal(0);      
      });
  
      it('user with notification existing => expect non-empty array', async () => {
        let allUsers: User[] = await appdata.getActiveUsers();
        allUsers[0].configs.notificationLevel = 1;
        allUsers[1].configs.notificationLevel = 2;
        await setUser(allUsers[0]);
        await setUser(allUsers[1]);
  
        const users: User[] = await email_notifier_helpers.getUsersWithNotification();
        expect(users.length).to.equal(2);      
      });
  
      // reset all users to notification level 1
      after(async () => {
        let users: User[] = await appdata.getActiveUsers();
        for (let user of users) {
          user.configs.notificationLevel = 1;
          await setUser(user);
        }
      });
  
    });
  
    describe('maySendNotification', () => {
      var sandbox: any;
  
      var user: User = {
          documentId: "",
          id: "userid0",
          displayName: "user0",
          isActive: true,
          isAdmin: false,
          configs: {
            notificationLevel: 2,
            notificationTime: 3,
            theme: "light"
          }
      };
  
      beforeEach(() => {
        sandbox = sinon.createSandbox();
      });
  
      afterEach(() => {
        sandbox.restore();
      });
  
      before(async () => {
        const timestampNow: number = util.getCurrentTimestamp();
        const timestampYesterday: number = timestampNow - 86400;
  
        await appdata.setMail({
          documentId: "",
          to: user.email,
          message: {
            html: "test",
            subject: "test"
          },
          delivery: {
            attempts: 1,
            endTime: new Date(timestampYesterday*1000),
            startTime: new Date(timestampYesterday*1000),
            leaseExpireTime: null,
            state: "SUCCESS",
            error: null,
            info: null
          }
        });
  
      });
  
      it('user has notification level 2 => expect true', async () => {
        user.configs.notificationLevel = 2;
        const spy: any = sandbox.spy(appdata, "getMail");
        const maySend: boolean = await email_notifier_helpers.maySendNotification(user);
  
        expect(spy.notCalled).to.be.true;
        expect(maySend).to.be.true;      
      });
  
      it('user has notification level 1, no email sent this day => expect true', async () => {
        user.configs.notificationLevel = 1;
        const spy: any = sandbox.spy(appdata, "getMail");
        const maySend: boolean = await email_notifier_helpers.maySendNotification(user);
  
        expect(spy.called).to.be.true;
        expect(maySend).to.be.true;  
      });
  
      it('user has notification level 1, email has been sent this day, but with error => expect true', async () => {
        user.configs.notificationLevel = 1;
        const timestampNow: number = util.getCurrentTimestamp();
        const minuteBeforeNow: number = timestampNow - 60;
        
        await appdata.setMail({
          documentId: "",
          to: "user0@tgbfms.app",
          message: {
            html: "test",
            subject: "test"
          },
          delivery: {
            attempts: 1,
            endTime: new Date(minuteBeforeNow*1000),
            startTime: new Date(minuteBeforeNow*1000),
            leaseExpireTime: null,
            state: "ERROR",
            error: "errormsg",
            info: null
          }
        });
        const maySend: boolean = await email_notifier_helpers.maySendNotification(user);
  
        expect(maySend).to.be.true;  
      });
  
      it('user has notification level 1, email has been sent this day successful => expect false', async () => {
        user.configs.notificationLevel = 1;
        const timestampNow: number = util.getCurrentTimestamp();
        const minuteBeforeNow: number = timestampNow - 60;
        
        await appdata.setMail({
          documentId: "",
          to: user.email,
          message: {
            html: "test",
            subject: "test"
          },
          delivery: {
            attempts: 1,
            endTime: new Date(minuteBeforeNow*1000),
            startTime: new Date(minuteBeforeNow*1000),
            leaseExpireTime: null,
            state: "SUCCESS",
            error: null,
            info: null
          }
        });
        const maySend: boolean = await email_notifier_helpers.maySendNotification(user);
  
        expect(maySend).to.be.false;  
      });
      
    });
  
    describe('getRelevantSyncPhases', () => {
      var sandbox: any;
  
      const timestampSyncPhase: number = 1683984600;
  
      var user: User = {
          documentId: "",
          id: "userid1",
          displayName: "user1",
          isActive: true,
          isAdmin: false,
          configs: {
            notificationLevel: 1,
            notificationTime: 3,
            theme: "light"
          }
      };
  
      before(async () => {
        await appdata.setSyncPhase({
          documentId: "",
          matchIds: [64148],
          start: timestampSyncPhase
        });
      });
  
      beforeEach(() => {
        sandbox = sinon.createSandbox();
      });
  
      afterEach(() => {
        sandbox.restore();
      });
  
      it('time ahead before sync phase start => expect empty array', async () => {
        const mockedTime: number = timestampSyncPhase - 3600*user.configs.notificationTime - 1;
        sandbox.stub(util, "getCurrentTimestamp").returns(mockedTime);
  
        const syncPhases: SyncPhase[] = await email_notifier_helpers.getRelevantSyncPhases(user);
  
        expect(syncPhases.length).to.equal(0);
      });
  
      it('time ahead after sync phase start => expect empty array', async () => {
        const mockedTime: number = timestampSyncPhase - 3600*user.configs.notificationTime + 1;
        sandbox.stub(util, "getCurrentTimestamp").returns(mockedTime);
  
        const syncPhases: SyncPhase[] = await email_notifier_helpers.getRelevantSyncPhases(user);
  
        expect(syncPhases.length).to.equal(1);
      });
  
    });
  
    describe('getMissingBetIds', () => {
      const user: User = {
        documentId: "",
        id: "userid2",
        displayName: "user2",
        isActive: true,
        isAdmin: false,
        configs: {
          notificationLevel: 1,
          notificationTime: 3,
          theme: "light"
        }
      };
  
      const syncPhases: SyncPhase[] = [
        {
          documentId: "",
          matchIds: [55555, 55556],
          start: 123456789
        },
        {
          documentId: "",
          matchIds: [55557],
          start: 123456789
        }
      ];
  
      it('user has not set all bets => expect filled array', async () => {
        await appdata.setBet({
          documentId: "bet55555",
          goalsHome: 1,
          goalsAway: 0,
          matchId: 55555,
          isFixed: false,
          userId: "userid2"
        });
        await appdata.setBet({
          documentId: "bet55557",
          goalsHome: 1,
          goalsAway: 0,
          matchId: 55557,
          isFixed: false,
          userId: "userid2"
        });
  
        const missingBets: number[] = await email_notifier_helpers.getMissingBetIds(user, syncPhases);
  
        expect(missingBets).to.deep.equal([55556]);
      });
  
      it('user has set all bets => expect empty array', async () => {
        await appdata.setBet({
          documentId: "bet55555",
          goalsHome: 1,
          goalsAway: 0,
          matchId: 55555,
          isFixed: false,
          userId: "userid2"
        });
        await appdata.setBet({
          documentId: "bet55556",
          goalsHome: 1,
          goalsAway: 0,
          matchId: 55556,
          isFixed: false,
          userId: "userid2"
        });
        await appdata.setBet({
          documentId: "bet55557",
          goalsHome: 1,
          goalsAway: 0,
          matchId: 55557,
          isFixed: false,
          userId: "userid2"
        });
  
        const missingBets: number[] = await email_notifier_helpers.getMissingBetIds(user, syncPhases);
  
        expect(missingBets).to.deep.equal([]);
      });
  
    });
  
  });
  
  describe('notifyMissingBets', () => {
    var sandbox: any;
    const timestampSyncPhase: number = (new Date("2023-05-14T17:30+02:00")).getTime() / 1000;
  
    before(async () => {
      // set SyncPhase
      await appdata.setSyncPhase({
        documentId: "",
        matchIds: [44444],
        start: timestampSyncPhase
      });
  
      // set notification level of users
      let users: User[] = await appdata.getActiveUsers();
      for (let user of users) {
        if (user.displayName == "Christian") {
          user.configs.notificationLevel = 2;
          user.configs.notificationTime = 3;
        }
        else if (user.displayName == "Mauri") {
          user.configs.notificationLevel = 2;
          user.configs.notificationTime = 2;
        }
        else {
          user.configs.notificationLevel = 0;
        }
  
        await setUser(user);
      }
    });
  
    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });
  
    afterEach(() => {
      sandbox.restore();
    });
  
    it('no bets set for applying, but time ahead not reached => expect no new entries in mail collection', async () => {
      sandbox.stub(util, "getCurrentTimestamp").returns(timestampSyncPhase - 3*3600 - 1);
      const spy: any = sandbox.spy(appdata, "setMail");
  
      await email_notifier.notifyMissingBets();
  
      expect(spy.notCalled).to.be.true;
    });
  
    it('no bets set for applying users and time ahead reached for one user => expect new entries in mail collection', async () => {
      sandbox.stub(util, "getCurrentTimestamp").returns(timestampSyncPhase - 3*3600 + 1);
      const spy: any = sandbox.spy(appdata, "setMail");
  
      await email_notifier.notifyMissingBets();
  
      expect(spy.calledOnce).to.be.true;
    });
  
    it('no bets set for applying users and time ahead reached for both users => expect new entries in mail collection', async () => {
      sandbox.stub(util, "getCurrentTimestamp").returns(timestampSyncPhase - 2*3600 + 1);
      const spy: any = sandbox.spy(appdata, "setMail");
      
      await email_notifier.notifyMissingBets();
  
      expect(spy.calledTwice).to.be.true;
    });
  
    it('bets set for one user and time ahead reached => expect no new entries in mail', async () => {
      appdata.setBet({
        documentId: "betChris",
        goalsHome: 1,
        goalsAway: 0,
        userId: "oUNbdhtBCZbUPMrhqotCIBDZcA53",
        isFixed: false,
        matchId: 44444
      });    
  
      sandbox.stub(util, "getCurrentTimestamp").returns(timestampSyncPhase - 120);
      const spy: any = sandbox.spy(appdata, "setMail");
      
      await email_notifier.notifyMissingBets();
  
      expect(spy.calledOnce).to.be.true;
    });
  
    it('bets set for one user and time ahead reached => expect no new entries in mail', async () => {
      appdata.setBet({
        documentId: "betChris",
        goalsHome: 1,
        goalsAway: 0,
        userId: "oUNbdhtBCZbUPMrhqotCIBDZcA53",
        isFixed: false,
        matchId: 44444
      });    
      appdata.setBet({
        documentId: "betMauri",
        goalsHome: 1,
        goalsAway: 0,
        userId: "gLwLn9HxwkMwHf28drJGVhRbC1y1",
        isFixed: true,
        matchId: 44444
      });  
      
      sandbox.stub(util, "getCurrentTimestamp").returns(timestampSyncPhase - 120);
      const spy: any = sandbox.spy(appdata, "setMail");
      
      await email_notifier.notifyMissingBets();
  
      expect(spy.notCalled).to.be.true;
    });
    
  });
  
});