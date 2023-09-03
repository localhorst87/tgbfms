// const test = require('firebase-functions-test')({
//   apiKey: "AIzaSyC2rySZr8qLaj3d1kjIyPa6ifeTOEdaMI4",
//   authDomain: "tgbfms.firebaseapp.com",
//   projectId: "tgbfms",
//   storageBucket: "tgbfms.appspot.com",
//   messagingSenderId: "189926166244",
//   appId: "1:189926166244:web:961a7b97330a52820b66f1",
//   measurementId: "G-YLHV37F3JX"
// }, process.env.GOOGLE_APPLICATION_CREDENTIALS);

import { describe, it } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import { Bet, Match } from "../../src/app/Businessrules/basic_datastructures";
import * as appdata_helpers from "../src/data_access/appdata_helpers";
import * as admin from "firebase-admin";

describe("processSnapshot", () => {

  it("QuerySnapshot yields same Type as given in Template => expect to be truthy", () => {
    let sampleBetWoId: any = {
      userId: "123",
      isFixed: false,
      matchId: 65987,
      goalsHome: 3,
      goalsAway: 1
    };

    let queryDocSnap = sinon.createStubInstance(admin.firestore.QueryDocumentSnapshot);
    queryDocSnap.data.returns(sampleBetWoId);
    sinon.stub(queryDocSnap, "id").get(() => "test_doc_id");

    let querySnap = sinon.createStubInstance(admin.firestore.QuerySnapshot);
    sinon.stub(querySnap, "docs").get(() => [queryDocSnap]);

    let bets: Bet[] = appdata_helpers.processSnapshot<Bet>(querySnap);

    expect(bets).to.be.ok;
  });

  it("QuerySnapshot yields other Type than given in Template => expect to throw", () => {
    let sampleBetWoId: any = {
      userId: "123",
      isFixed: false,
      matchId: 65987,
      goalsHome: 3,
      goalsAway: 1
    };

    let queryDocSnap = sinon.createStubInstance(admin.firestore.QueryDocumentSnapshot);
    queryDocSnap.data.returns(sampleBetWoId);
    sinon.stub(queryDocSnap, "id").get(() => "test_doc_id");

    let querySnap = sinon.createStubInstance(admin.firestore.QuerySnapshot);
    sinon.stub(querySnap, "docs").get(() => [queryDocSnap]);

    expect(() => appdata_helpers.processSnapshot<Match>(querySnap)).to.throw();
  });

  it("QuerySnapshot has no data samples => expect empty array", () => {
    let querySnap = sinon.createStubInstance(admin.firestore.QuerySnapshot);
    sinon.stub(querySnap, "docs").get(() => []);

    let bets: Bet[] = appdata_helpers.processSnapshot<Bet>(querySnap);

    expect(bets).to.deep.equal([]);
  });

  it("QuerySnapshot has more than one data sample => expect correct samples in array", () => {
    let sampleBetWoId01: any = {
      userId: "123",
      isFixed: false,
      matchId: 65987,
      goalsHome: 3,
      goalsAway: 1
    };
    let sampleBetWoId02: any = {
      userId: "1234",
      isFixed: true,
      matchId: 65988,
      goalsHome: 0,
      goalsAway: 1
    };

    let queryDocSnap01 = sinon.createStubInstance(admin.firestore.QueryDocumentSnapshot);
    let queryDocSnap02 = sinon.createStubInstance(admin.firestore.QueryDocumentSnapshot);

    queryDocSnap01.data.returns(sampleBetWoId01);
    sinon.stub(queryDocSnap01, "id").get(() => "doc_id_01");
    queryDocSnap02.data.returns(sampleBetWoId02);
    sinon.stub(queryDocSnap02, "id").get(() => "doc_id_02");

    let querySnap = sinon.createStubInstance(admin.firestore.QuerySnapshot);
    sinon.stub(querySnap, "docs").get(() => [queryDocSnap01, queryDocSnap02]);

    let bets: Bet[] = appdata_helpers.processSnapshot<Bet>(querySnap);

    let expectedBets: Bet[] = [
      {
        documentId: "doc_id_01",
        userId: "123",
        isFixed: false,
        matchId: 65987,
        goalsHome: 3,
        goalsAway: 1
      },
      {
        documentId: "doc_id_02",
        userId: "1234",
        isFixed: true,
        matchId: 65988,
        goalsHome: 0,
        goalsAway: 1
      }
    ];

    expect(bets).to.deep.equal(expectedBets);
  });

});
