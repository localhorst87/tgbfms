import { describe, it } from "mocha";
import { getApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase-admin/auth"
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import * as admin from "firebase-admin";
import * as sync_matchplan from "../src/sync_matchplan/sync_matchplan";
// import * as sinon from "sinon";
// import {expect} from "chai";
// import { User } from "../src/business_rules/basic_datastructures";
// import * as util from "../src/util";

describe.only('sync matchplan', () => {
  it('sync test', async () => {
    await sync_matchplan.syncMatchplan();
  });
});

describe('auth test', () => {
  it('generate change email link', () => {
    admin.initializeApp();
    getAuth().generateVerifyAndChangeEmailLink("ironmanni87@gmail.com", "m.p.ahmann@gmx.de", {
      url: 'https://tgbfms.web.app'})
      .then((link: string) => console.log(link));
  });
});

describe('callable functions test', () => {
    initializeApp({});
    const functions = getFunctions(getApp());
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);

    it('successful', async () => {
        const callable = httpsCallable(functions, "changeEmail");
        callable({ userId: 'gLwLn9HxwkMwHf28drJGVhRbC1y1', newEmail: "M.P.Ahmann@gmx.de" }).then(
          (result: any) => console.log(result)
        )
        .catch((err) => console.log(err));
    });
});
