import { StatisticsCalculator } from "./statistics_calculator";
import * as appdata from "../data_access/appdata_access";
import { MatchdayScoreSnapshot, ResultFrequency, BoxPlot } from "../data_access/import_datastructures";
import { Bet, Match, Score } from "../business_rules/basic_datastructures";
import { NUMBER_OF_TEAMS } from "../business_rules/rule_defined_values"
import { ScoreAdderTrendbased } from "../business_rules/score_adder_trendbased";

interface MatchesAndBetCount {
    matches: number[];
    bets: number[];
};

const N_MATCHES_PER_MATCHDAY = Math.floor(NUMBER_OF_TEAMS / 2);
const FORM_N_CONSIDERED_MATCHDAYS = 6; // number of last matchdays to consider for the form
const WEIGHT_RELATIVE_TO_OPP: number = 0.75; // weight for points relative to opponents
const WEIGHT_RELATIVE_TO_REF: number = 0.25; // weight for points relative to point reference
const POINT_REFERENCE: number = 6; // a chosen mean point reference
const POINTS_PER_MATCH_REFERENCE: number = POINT_REFERENCE / N_MATCHES_PER_MATCHDAY;
const WEIGHT_FACTOR: number = Math.pow(2.5, 1/(FORM_N_CONSIDERED_MATCHDAYS - 1)); // points of recent match weighted 3 times as high as last considered match
const AMPLITUDE: number = 10;
const SHAPE_FACTOR: number = 2.25;

export class StatisticsCalculatorTrendbased implements StatisticsCalculator {
    
    private season: number;
    private currentMatchday: number;
    
    /**
     * All ScoreSnapshots from matchday 1 to currentMatchday
     */
    private scoreSnapshots: MatchdayScoreSnapshot[];

    /**
     * The matches of each matchday from matchday 1 to currentMatchday (CM), 
     * according to the following pattern:
     * 
     * [
     *      [match1_matchday1, match2_matchday1, ..., match9_matchday1], 
     *      [...]
     *      [match1_matchdayCM, match2_matchdayCM, ..., match9_matchdayCM]
     * ] 
     */
    private matches: Match[][];
    
    /**
     * The bets of all users of each matchday from matchday 1 to currentMatchday (CM)
     *
     * [
     *      [bet1_user1_matchday1, bet2_user1_matchday1, ..., bet9_userN_matchday1],
     *      [...]
     *      [bet1_user1_matchdayCM, bet2_user1_matchdayCM, ..., bet9_userN_matchdayCM],
     * ]
     */
    private bets: Bet[][];

    /**
     * An empty ScoreAdder object to calculate tables
     */
    private scoreAdder: ScoreAdderTrendbased;

    constructor(season: number, matchday: number) {
        this.season = season;
        this.currentMatchday = matchday;
        this.scoreSnapshots = [];
        this.scoreAdder = new ScoreAdderTrendbased();
        this.matches = [];
        this.bets = [];
    }

    /**
     * Sets all necessary MatchdayScoreSnapshots
     */
    public async setScoreSnapshots(): Promise<void> {
        this.scoreSnapshots = [];
        for (let i = 1; i <= this.currentMatchday; i++) {
            this.scoreSnapshots.push(await appdata.getMatchdayScoreSnapshot(this.season, i));
        }
    }

    /**
     * Sets all the matches from matchday 1 to the current matchday
     */
    public async setMatches(): Promise<void> {
        for (let matchday = 1; matchday <= this.currentMatchday; matchday++) {
            this.matches.push(await appdata.getMatchesByMatchday(this.season, matchday));
        }
    }

    /**
     * Sets all the bets of all users from matchday 1 to the current matchday
     */
    public async setBets(): Promise<void> {
        for (let i = 0; i < this.currentMatchday; i++) {
            let betsMatchday: Bet[] = [];
            for (let match of this.matches[i]) {
                let betsMatch: Bet[] = await appdata.getAllBets(match.matchId);
                betsMatchday.push(...betsMatch);
            }     
            this.bets.push(betsMatchday);       
        }
    }

    /**
     * Calculates the form of a user.
     * 
     * The form is calculated as a weighted average, consisting of a fraction 
     * relative to opponents points and a fraction relative to an absolute point
     * reference. The weights are there to count current results stronger than
     * results of older matchdays
     * 
     * @param userId 
     * @returns the current form of the user
     */
    public getSingleForm(userId: string, matchday: number): number {
        matchday = Math.min(matchday, this.currentMatchday);
        const nMatchdaysToConsider: number = Math.min(FORM_N_CONSIDERED_MATCHDAYS, matchday);

        const matchdaysToConsider: number[] = Array.from({length: nMatchdaysToConsider}, (_, i) => matchday - nMatchdaysToConsider + i + 1);
        const pointsUser: number[] = this.getUserPoints(userId, matchdaysToConsider);
        const pointsOpponents: number[][] = this.getOpponentPoints(userId, matchdaysToConsider);
        const nMatchesAndBets: MatchesAndBetCount = this.getNumberOfMatchesAndBets(matchdaysToConsider, userId);
        const nOfBetsOpponents: number[] = nMatchesAndBets.bets;
        const nMatchesFinished: number[] = nMatchesAndBets.matches;
        const weights: number[] = this.makeWeights(nMatchdaysToConsider);

        let weightedAvgRel: number = 0;
        let weightedAvgAbs: number = 0;

        for (let i = 0; i < pointsUser.length; i++) {
            let pointsSumOpponents: number = pointsOpponents[i].reduce((a, b) => a + b, 0);
            let pointsPerMatchOpponents: number = pointsSumOpponents / nOfBetsOpponents[i];
            weightedAvgRel += weights[i] * pointsUser[i] / (pointsPerMatchOpponents * nMatchesFinished[i]);
            weightedAvgAbs += weights[i] * pointsUser[i] / (POINTS_PER_MATCH_REFERENCE * nMatchesFinished[i]);
        }
        
        if (weightedAvgRel == 0) { // in case of no points directly return -10
            return -10;
        }

        // norm values on an amplitude from -10 to +10 with a norming function (like in neural networks)
        let normedValueRel: number = this.normValue(weightedAvgRel, AMPLITUDE, SHAPE_FACTOR);
        let normedValueAbs: number = this.normValue(weightedAvgAbs, AMPLITUDE, SHAPE_FACTOR);

        // weight relative-points-related and absolute-points-related values
        let weightedForm: number = WEIGHT_RELATIVE_TO_OPP * normedValueRel + WEIGHT_RELATIVE_TO_REF * normedValueAbs;

        // round to 1 decimal
        return Math.round(weightedForm * 10) / 10;
    }

    /**
     * Calculates the form history (form from requested start to end matchdays)
     * 
     * @param matchdayStart 
     * @param matchdayEnd
     * @param userId 
     * @returns 
     */
    public getFormHistory(userId: string, matchdayStart: number, matchdayEnd: number): number[] {
        let formHistory: number[] = [];
        for (let matchday = matchdayStart; matchday <= matchdayEnd; matchday++) {
            formHistory.push(this.getSingleForm(userId, matchday));
        }

        return formHistory;
    }

    /**
     * Calculates the table position history of the given user
     * 
     * @param userId 
     * @returns 
     */
    public getPositionHistory(userId: string, matchday: number): number[] {
        let positionHistory: number[] = [];

        this.scoreAdder.reset();
        for (let snapshot of this.scoreSnapshots.slice(0, matchday)) {
            this.scoreAdder.addScores(snapshot.scores);
            let scores: Score[] = this.scoreAdder.getScores();
            let allPositions: number[] = this.makePositions(scores);
            let idxUser: number = scores.findIndex((score: Score) => score.userId == userId);

            positionHistory.push(allPositions[idxUser]);
        }

        return positionHistory;        
    }

    /**
     * Returns the mean points of the user per matchday from matchday 1 to the given matchday
     * 
     * @param userId 
     * @param matchday 
     * @returns 
     */
    public getMeanPoints(userId: string, matchday: number): number {
        const matchdays: number[] = Array.from({length: matchday}, (_, i) => i + 1);
        const points: number[] = this.getUserPoints(userId, matchdays);
        
        return points.reduce((acc, val) => acc + val, 0) / points.length;
    }

    /**
     * Returns the Boxplot of the user with respect to matchday points
     * 
     * @param userId 
     * @param matchday 
     * @returns 
     */
    public getBoxPlot(userId: string, matchday: number): BoxPlot {
        const matchdays: number[] = Array.from({length: matchday}, (_, i) => i + 1);
        const points: number[] = this.getUserPoints(userId, matchdays);

        return {
            minimum: Math.min(...points),
            lowerQuartile: this.calculatePercentile(25, points),
            median: this.calculatePercentile(50, points),
            upperQuartile: this.calculatePercentile(75, points),
            maximum: Math.max(...points)

        };
    }

    /**
     * Returns the standard deviation of the given user with respect to matchday points
     * 
     * @param userId 
     * @param matchday 
     * @returns 
     */
    public getStdDev(userId: string, matchday: number): number {
        const matchdays: number[] = Array.from({length: matchday}, (_, i) => i + 1);
        const points: number[] = this.getUserPoints(userId, matchdays);
        const mean: number = points.reduce((acc, val) => acc + val, 0) / points.length;
        const variance: number = points.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / points.length;

        return Math.sqrt(variance);
    }

    /**
     * Returns the most frequent bets of the user, given in descending order, as a fraction of
     * all bets, e.g. [{result: "2-1", fraction: 0.225}, {result: "1-0", fraction: 0.198}, ...]
     * 
     * @param userId 
     * @param matchday 
     * @returns 
     */
    public getMostFrequentBets(userId: string, matchday: number): ResultFrequency[] {
        const userBets: Bet[] = this.bets
            .slice(0, matchday)
            .flat()
            .filter((bet: Bet) => bet.userId == userId);
        
        let betMap = new Map();
        for (let bet of userBets) {
            let identifier: string = String(bet.goalsHome) + "-" + String(bet.goalsAway);
            let nThisBet: number = betMap.get(identifier) !== undefined ? betMap.get(identifier) : 0;
            betMap.set(identifier, nThisBet + 1);
        }
        
        let bets: ResultFrequency[] = [];
        betMap.forEach((val, id, _) => bets.push({result: id, fraction: val / userBets.length}));
        return bets.sort((a,b) => b.fraction - a.fraction);
    }

    /**
     * Returns the most frequent result of all matches, given in descending order, as a fraction of
     * all results, e.g. [{result: "2-1", fraction: 0.225}, {result: "1-0", fraction: 0.198}, ...]
     * 
     * @param matchday 
     * @returns 
     */
    public getMostFrequetResults(matchday: number): ResultFrequency[] {
        const matches: Match[] = this.matches
        .slice(0, matchday)
        .flat();

        let resMap = new Map();
        for (let match of matches) {
            let identifier: string = String(match.goalsHome) + "-" + String(match.goalsAway);
            let nThisBet: number = resMap.get(identifier) !== undefined ? resMap.get(identifier) : 0;
            resMap.set(identifier, nThisBet + 1);
        }

        let results: ResultFrequency[] = [];
        resMap.forEach((val, id, _) => results.push({result: id, fraction: val / matches.length}));
        return results.sort((a,b) => b.fraction - a.fraction);
    }

    private makePositions(scores: Score[]): number[] {
        let places: number[] = [];

        if (scores.length > 0) {
            scores = scores.sort(this.scoreAdder.compareScores);
            places.push(1);
        }
    
        for (let i = 0; i < scores.length - 1; i++) {
            let newPlace: number;
    
            if (this.scoreAdder.compareScores(scores[i], scores[i + 1]) == 0)
            newPlace = places[i];
            else
            newPlace = i + 1 + places[0];
    
            places.push(newPlace);
        }
    
        return places;
    }

    private makeWeights(length: number): number[] {
        // returns an array with the length of considered matchdays
        // with the given weight factor of 2.5 it returns an array of
        // [1, WEIGHT_FACTOR, WEIGHT_FACTOR², ..., 2.5]
        const weights: number[] = Array.from({length: length}, (_, i) => Math.pow(WEIGHT_FACTOR, i));
        const weightsSum: number = weights.reduce((a, b) => a + b, 0);

        // we want to return normed weights (with sum 1)
        return weights.map((weight: number) => weight / weightsSum); 
    }

    private normValue(value: number, amplitude: number, shapeFactor: number) {
        return amplitude * Math.tanh(shapeFactor * (value - 1));
    }

    private getNumberOfMatchesAndBets(matchdays: number[], userToExclude: string): MatchesAndBetCount {
        let nBets: number[] = [];
        let nMatchesFinished: number[] = [];

        for (let matchday of matchdays) {
            let matchIdsFinished: number[] = this.matches[matchday - 1]
                                                .filter((match: Match) => match.isFinished == true)
                                                .map((match: Match) => match.matchId);
            nMatchesFinished.push(matchIdsFinished.length);
            const nBetsFilterFcn = (bet: Bet) => matchIdsFinished.includes(bet.matchId) && bet.userId !== userToExclude;
            nBets.push(this.bets.flat().filter(nBetsFilterFcn).length);
            
        }

        return {
            matches: nMatchesFinished,
            bets: nBets
        };
    } 

    private getUserPoints(userId: string, matchdays: number[]): number[] {
        return this.scoreSnapshots
            .filter((snapshot: MatchdayScoreSnapshot) => matchdays.includes(snapshot.matchday))
            .map((snapshot: MatchdayScoreSnapshot) => snapshot.scores)
            .flat()
            .filter((score: Score) => score.userId == userId)
            .map((score: Score) => score.points);
    }

    private getOpponentPoints(userId: string, matchdays: number[]): number[][] {
        return this.scoreSnapshots
            .filter((snapshot: MatchdayScoreSnapshot) => matchdays.includes(snapshot.matchday))
            .map((snapshot: MatchdayScoreSnapshot) => snapshot.scores)
            .map((scores: Score[]) => scores.filter((score: Score) => score.userId != userId))
            .map((scores: Score[]) => scores.map((score: Score) => score.points));
    }

    /**
     * Calculates the x-percentile of the given samples
     * 
     * @param percentile integer value 1...99
     * @param samples the samples to calculate the percentile from
     * @returns 
     */
    private calculatePercentile(percentile: number, samples: number[]): number {
        const samplesSorted = [...samples].sort((a, b) => a - b);
        let idxTheor: number = samplesSorted.length * percentile/100 - 1;

        if (idxTheor % 1 == 0) {
            return 0.5 * (samplesSorted[idxTheor] + samplesSorted[idxTheor+1]);
        }
        else {
            return samplesSorted[Math.floor(idxTheor + 1)];
        }
    }
}