import { describe, it } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import * as util from "../src/util";

describe("isDatestringUTC", () => {

  it("datestring has Z to denote it as UTC => expect to return true", () => {
    let datestring: string = "2021-12-24T18:21Z";
    let isUtc: boolean = util.isDatestringUTC(datestring);

    expect(isUtc).to.be.true;
  });

  it("datestring has +00:00 to denote it as UTC => expect to return true", () => {
    let datestring: string = "2021-12-24T18:21+00:00";
    let isUtc: boolean = util.isDatestringUTC(datestring);

    expect(isUtc).to.be.true;
  });

  it("datestring has +02:00 to denote it not being UTC => expect to return true", () => {
    let datestring: string = "2021-12-24T18:21+02:00";
    let isUtc: boolean = util.isDatestringUTC(datestring);

    expect(isUtc).to.be.false;
  });

  it("datestring has no further notation  => expect to return false", () => {
    let datestring: string = "2021-12-24T18:21:33";
    let isUtc: boolean = util.isDatestringUTC(datestring);

    expect(isUtc).to.be.false;
  });

});

describe("isDstObserved", () => {

  it("before March time conversion => expect false", () => {
    let isDst: boolean = util.isDstObserved("2023-03-26T00:59Z");

    expect(isDst).to.be.false;
  });

  it("after March time conversion => expect true", () => {
    let isDst: boolean = util.isDstObserved("2023-03-26T02:01Z");

    expect(isDst).to.be.true;
  });

  it("before October time conversion => expect true", () => {
    let isDst: boolean = util.isDstObserved("2023-10-29T00:59Z");

    expect(isDst).to.be.true;
  });

  it("after October time conversion => expect true", () => {
    let isDst: boolean = util.isDstObserved("2023-10-29T01:01Z");

    expect(isDst).to.be.false;
  });

});

describe("getFutureEndDate", () => {

  var clock: any;

  afterEach(() => {
    clock.restore();
  });

  it("nextDays = 0 => expect last second of same day", () => {
    clock = sinon.useFakeTimers(new Date("2022-09-25T00:00"));

    const expectedTimestamp: number = new Date("2022-09-25T23:59:59").getTime() / 1000;

    expect(util.getFutureEndDate(0)).to.deep.equal(expectedTimestamp);
  });

  it("nextDays = 1 => expect last second of next day", () => {
    clock = sinon.useFakeTimers(new Date("2022-09-25T23:59:59"));

    const expectedTimestamp: number = new Date("2022-09-26T23:59:59").getTime() / 1000;;

    expect(util.getFutureEndDate(1)).to.deep.equal(expectedTimestamp);
  });
});
