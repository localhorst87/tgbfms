import {describe, it} from "mocha";
import {expect} from "chai";
// import * as sinon from "sinon";
import { StatisticsCalculatorTrendbased } from "../src/stats/statistics_calculator_trendbased";
import { BoxPlot, ResultFrequency } from "../src/data_access/import_datastructures";

describe('getSingleForm', () => {

    var statCalc: StatisticsCalculatorTrendbased = new StatisticsCalculatorTrendbased(2022, 28);

    before(async function() {
        this.timeout(10 * 1000);
        await statCalc.setScoreSnapshots();
        await statCalc.setMatches();
        await statCalc.setBets();
    });

    it('return test 1 => expect user with much points to have form > 0', () => {
        const formMauri: number = statCalc.getSingleForm("gLwLn9HxwkMwHf28drJGVhRbC1y1", 25);

        expect(formMauri).to.be.greaterThan(0);
    });

    it('return test 2 => expect user with mean points to have form ~ 0', () => {
        const formBjoern: number = statCalc.getSingleForm("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 25);
        expect(formBjoern).to.be.closeTo(0, 1)
    });

    it('return test 3 => expect user with not much points to have form < 0 ', () => {
        const formChris: number = statCalc.getSingleForm("oUNbdhtBCZbUPMrhqotCIBDZcA53", 25);
        expect(formChris).to.be.below(-5);
    });  
});

describe('getFormHistory', () => {

    var statCalc: StatisticsCalculatorTrendbased = new StatisticsCalculatorTrendbased(2022, 28);

    before(async function() {
        this.timeout(10 * 1000);
        await statCalc.setScoreSnapshots();
        await statCalc.setMatches();
        await statCalc.setBets();
    });

    it('expect correct length', () => {
        const formHistBjoern: number[] = statCalc.getFormHistory("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 1, 28);
        expect(formHistBjoern.length).to.equal(28);        
    });

    it('expect correct range of values', () => {
        const formHistBjoern: number[] = statCalc.getFormHistory("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 1, 28);
        const allValuesInRange: boolean = formHistBjoern.every((form: number) => form <= 10 && form >= -10);
        expect(allValuesInRange).to.be.true;
    });
    
});

describe('getPositionHistory', () => {

    var statCalc: StatisticsCalculatorTrendbased = new StatisticsCalculatorTrendbased(2022, 28);

    before(async function() {
        this.timeout(10 * 1000);
        await statCalc.setScoreSnapshots();
    });

    it('samples test 1', () => {
        const posHistMauri: number[] = statCalc.getPositionHistory("gLwLn9HxwkMwHf28drJGVhRbC1y1", 28);
        expect(posHistMauri[16]).to.equal(6);        
    });

    it('samples test 2', () => {
        const posHistChris: number[] = statCalc.getPositionHistory("oUNbdhtBCZbUPMrhqotCIBDZcA53", 28);
        expect(posHistChris[4]).to.equal(2);        
    });

    it('length test', () => {
        const posHistChris: number[] = statCalc.getPositionHistory("oUNbdhtBCZbUPMrhqotCIBDZcA53", 10);
        expect(posHistChris.length).to.equal(10); 
    });
    
});

describe('getBoxPlot', () => {

    var statCalc: StatisticsCalculatorTrendbased = new StatisticsCalculatorTrendbased(2022, 10);

    before(async function() {
        this.timeout(10 * 1000);
        await statCalc.setScoreSnapshots();
    });

    // userPoints of j9kZZiSTvYfQF8N7CKD8I39pSZR2: [8, 4, 7, 6, 3, 2, 4, 9, 4, 5]
    // sorted: [2, 3, 4, 4, 4, 5, 6, 7, 8, 9]

    describe('check median', () => {

        it('even number of matches, expect to interpolate', () => {
            // points: [2, 3, 4, 4, 4, 5, 6, 7, 8, 9]
            const boxPlot: BoxPlot =  statCalc.getBoxPlot("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 10);
            expect(boxPlot.median).to.equal(4.5);            
        });

        it('uneven number of matches, expect to use middle-value', () => {
            // points: [2, 3, 4, 4, 4, 6, 7, 8, 9]
            const boxPlot: BoxPlot =  statCalc.getBoxPlot("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 9);
            expect(boxPlot.median).to.equal(4);            
        });

        it('only 1 match, expect to take value of single matchday points', () => {
            // points: [8]
            const boxPlot: BoxPlot =  statCalc.getBoxPlot("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 1);
            expect(boxPlot.median).to.equal(8);            
        });

    });

    describe('check lower quartile', () => {

        it('p*n is not integer => expect to use next sample', () => {
            // points: [2, 3, 4, 4, 4, 5, 6, 7, 8, 9]
            // 0.25 * 10 - 1 = 1.5 --> take index 2 --> 4
            const boxPlot: BoxPlot =  statCalc.getBoxPlot("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 10);
            expect(boxPlot.lowerQuartile).to.equal(4);            
        });

        it('p*n is integer => expect to interpolate', () => {
            // points: [2, 3, 4, 4, 6, 7, 8, 9]
            // 0.25 * 8 - 1 = 1 --> index 1...2 --> 3.5
            const boxPlot: BoxPlot =  statCalc.getBoxPlot("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 8);
            expect(boxPlot.lowerQuartile).to.equal(3.5);
        });

        it('only 1 match, expect to take value of single matchday points', () => {
            // points: [8]
            const boxPlot: BoxPlot =  statCalc.getBoxPlot("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 1);
            expect(boxPlot.lowerQuartile).to.equal(8);            
        });

    });   

    describe('check upper quartile', () => {

        it('p*n is not integer => expect to use next sample', () => {
            // points: [2, 3, 4, 4, 4, 5, 6, 7, 8, 9]
            // 0.75 * 10 - 1 = 6.5 --> take index 7 --> 7
            const boxPlot: BoxPlot =  statCalc.getBoxPlot("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 10);
            expect(boxPlot.upperQuartile).to.equal(7);            
        });

        it('p*n is integer => expect to interpolate', () => {
            // points: [2, 3, 4, 4, 6, 7, 8, 9]
            // 0.75 * 8 - 1 = 5 --> index 1...6 --> 7.5
            const boxPlot: BoxPlot =  statCalc.getBoxPlot("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 8);
            expect(boxPlot.upperQuartile).to.equal(7.5);
        });

        it('only 1 match, expect to take value of single matchday points', () => {
            // points: [8]
            const boxPlot: BoxPlot =  statCalc.getBoxPlot("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 1);
            expect(boxPlot.upperQuartile).to.equal(8);            
        });

    }); 

    describe('check minimum', () => {

        it('only 1 match => expect to take value of single matchday points', () => {
            // points: [8]
            const boxPlot: BoxPlot =  statCalc.getBoxPlot("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 1);
            expect(boxPlot.minimum).to.equal(8);            
        });

        it('more than one match', () => {
            // points: [2, 3, 4, 4, 4, 5, 6, 7, 8, 9]
            const boxPlot: BoxPlot =  statCalc.getBoxPlot("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 10);
            expect(boxPlot.minimum).to.equal(2);            
        });

    });

    describe('check maximum', () => {

        it('only 1 match => expect to take value of single matchday points', () => {
            // points: [8]
            const boxPlot: BoxPlot =  statCalc.getBoxPlot("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 1);
            expect(boxPlot.maximum).to.equal(8);            
        });

        it('more than one match', () => {
            // points: [2, 3, 4, 4, 4, 5, 6, 7, 8, 9]
            const boxPlot: BoxPlot =  statCalc.getBoxPlot("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 10);
            expect(boxPlot.maximum).to.equal(9);            
        });

    });

});

describe('getMeanPoints', () => {

    var statCalc: StatisticsCalculatorTrendbased = new StatisticsCalculatorTrendbased(2022, 10);

    before(async function() {
        this.timeout(10 * 1000);
        await statCalc.setScoreSnapshots();
    });

    it('more than one match => expect to calculate arith. mean', () => {
        // points: [8, 4, 7, 6, 3, 2, 4, 9, 4, 5]
        const mean: number = statCalc.getMeanPoints("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 10);
        expect(mean).to.equal(5.2);
    });

    it('only one match => expect points of single match', () => {
        // points: [8]
        const mean: number = statCalc.getMeanPoints("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 1);
        expect(mean).to.equal(8);
    });

});

describe('getStdDev', () => {
    var statCalc: StatisticsCalculatorTrendbased = new StatisticsCalculatorTrendbased(2022, 10);

    before(async function() {
        this.timeout(10 * 1000);
        await statCalc.setScoreSnapshots();
    });

    it('more than one match => expect correct standard deviation', () => {
        // points: [8, 4, 7, 6, 3, 2] --> mean = 5
        // var = 28/6 -> stddev = sqrt(28/6) = 2.160...
        const mean: number = statCalc.getMeanPoints("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 6);
        expect(mean).to.be.closeTo(2.16, 0.001);
    });

    it('only one match => standard deviation to be 0', () => {
        const mean: number = statCalc.getMeanPoints("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 1);
        expect(mean).to.equal(0);
    });

});

describe('getMostFrequentBets', () => {
    var statCalc: StatisticsCalculatorTrendbased = new StatisticsCalculatorTrendbased(2022, 2);

    before(async function() {
        this.timeout(10 * 1000);
        await statCalc.setMatches();
        await statCalc.setBets();
    });

    // bets of j9kZZiSTvYfQF8N7CKD8I39pSZR2:
    // 1-2, 1-1, 2-1, 1-3, 2-1, 1-2, 2-1, 2-1, 1-2,
    // 1-2, 1-2, 2-1, 3-1, 2-1, 3-1, 1-2, 2-1, 1-2
    
    // 2-1 -> 7
    // 1-2 -> 7
    // 3-1 -> 2
    // 1-1 -> 1
    // 1-3 -> 1

    it('5 different bets => expect length of 5', () => {
        const resFreq: ResultFrequency[] = statCalc.getMostFrequentBets("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 2);
        expect(resFreq.length).to.equal(5);
    });

    it('expect 1-2 to be the most frequent result', () => {
        const resFreq: ResultFrequency[] = statCalc.getMostFrequentBets("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 2);
        expect(resFreq[0]).to.deep.equal({result: "1-2", fraction: 7/18});
    });

    it('expect 1-3 to be the lesat frequent result', () => {
        const resFreq: ResultFrequency[] = statCalc.getMostFrequentBets("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 2);
        expect(resFreq[resFreq.length - 1]).to.deep.equal({result: "1-3", fraction: 1/18});
    });

    it('no bets set from user => expect emtpy array', () => {
        statCalc["bets"] = [];
        const resFreq: ResultFrequency[] = statCalc.getMostFrequentBets("j9kZZiSTvYfQF8N7CKD8I39pSZR2", 2);
        expect(resFreq).to.deep.equal([]);
    });
});

describe('getMostFrequetResults', () => {
    var statCalc: StatisticsCalculatorTrendbased = new StatisticsCalculatorTrendbased(2022, 2);

    before(async function() {
        this.timeout(10 * 1000);
        await statCalc.setMatches();
        await statCalc.setBets();
    });

    // results:
    // 0-4, 3-1, 2-2, 1-1, 1-0, 1-2, 3-1, 3-1, 1-6,
    // 2-2, 1-1, 3-2, 2-0, 1-2, 2-2, 1-3, 2-2, 0-0

    // 2-2 -> 4
    // 3-1 -> 3
    // 1-1 -> 2
    // 1-2 -> 2
    // 0-4 -> 1
    // 1-0 -> 1
    // 1-6 -> 1
    // 3-2 -> 1
    // 2-0 -> 1
    // 1-3 -> 1
    // 0-0 -> 1

    it('10 different results => expect length of 10', () => {
        const resFreq: ResultFrequency[] = statCalc.getMostFrequetResults(2);
        expect(resFreq.length).to.equal(11);
    });

    it('expect 2-2 to be the most frequent result', () => {
        const resFreq: ResultFrequency[] = statCalc.getMostFrequetResults(2);
        expect(resFreq[0]).to.deep.equal({result: "2-2", fraction: 4/18});
    });

    it('expect 0-0 to be the lesat frequent result', () => {
        const resFreq: ResultFrequency[] = statCalc.getMostFrequetResults(2);
        expect(resFreq[resFreq.length - 1]).to.deep.equal({result: "0-0", fraction: 1/18});
    });
    
});