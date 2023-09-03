import { Match, Bet, Score, SeasonBet, SeasonResult } from './basic_datastructures';
import { PointCalculatorTrendbased } from './point_calculator_trendbased';
import { ScoreAdder } from "./score_adder";

declare global {
    interface Array<T> {
        unique(): Array<T>;
    }
}
  
/**
 * deletes double entries from an array
 */
Array.prototype.unique = function() {
    let arr = this.concat();
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] === arr[j])
            arr.splice(j--, 1);
        }
    }

    return arr;
};

export class ScoreAdderTrendbased implements ScoreAdder {
    private pointCalculators: PointCalculatorTrendbased[];

    constructor() {
        this.pointCalculators = [];
    }

    /**
     * Returns the Scores of all given users as a sorted Score array
     * 
     * @param ingestSeasonScore 
     * @returns 
     */
    public getScores(ingestSeasonScore: boolean = false): Score[] {
        const scores: Score[] = this.pointCalculators.map(pc => pc.getScore(ingestSeasonScore));

        return scores.sort(this.compareScores);
    }

    /**
     * Calculates all scores from the given bets for the matches given in the 
     * matches array and saves them in the PointCalculators
     * 
     * @param matches matches to calculate Score
     * @param bets bets of all users of all given matches
     */
    public calcScores(matches: Match[], bets: Bet[]): void {
        let availableUsers: string[] = this.identifyUsers(bets);

        for (let userId of availableUsers) {
            let pointCalculatorRef: PointCalculatorTrendbased = this.getPointCalculatorReference(userId);

            for (let match of matches) {
                let betsMatch: Bet[] = bets.filter(bet => bet.matchId == match.matchId);
                pointCalculatorRef.addSingleMatchScore(betsMatch, match);
            }
        }
    }

    /**
     * Calculates all points from season bets and sets it in the corresponding
     * PointCalculators
     * 
     * @param bets arbitrary number of SeasonBets
     * @param results corresponding SeasonResults
     */
    public calcSeasonScores(bets: SeasonBet[], results: SeasonResult[]): void {
        const userIds: string[] = this.identifyUsers(bets);

        for (let userId of userIds) {
            let pointCalculator = this.getPointCalculatorReference(userId);
            let betsUser: SeasonBet[] = bets.filter(bet => bet.userId == userId);
            pointCalculator.addSeasonScore(betsUser, results);
        }
    }

    /**
     * Adds an array of Scores to the Scores in the PointCalculators
     * 
     * @param scores scores of all users to add (one Score object per user)
     */
    public addScores(scores: Score[]): void {
        const userIds: string[] = this.identifyUsers(scores);

        for (let userId of userIds) {
            // get current scores
            let pointCalculator = this.getPointCalculatorReference(userId);

            // add given scores
            let scoresToAdd: Score = this.extractUserScore(scores, userId);
            pointCalculator.addScore(scoresToAdd);
        }
    }

    /**
     * Sorting function for Scores
     * 
     * @param a 
     * @param b 
     * @returns 
     */
    public compareScores(a: Score, b: Score): number {
        if (a.points != b.points) {
            return b.points - a.points;
        }
        else if (a.matches != b.matches) {
            return b.matches - a.matches;
        }
        else if (a.results != b.results) {
            return b.results - a.results;
        }
        else {
            return 0;
        }
    }

    /**
     * Identifies all unique user IDs that are present in the inputs and sorts
     * them by the user ID
     * 
     * @param subject any arbitrary Score or Bet array
     * @param furtherSubjects further arbitrary number os Score or Bet arrays
     * @returns all present users IDs
     */
    private identifyUsers(subject: Score[] | Bet[] | SeasonBet[], ...furtherSubjects: Score[][] | Bet[][] | SeasonBet[][]): string[] { 
        let users: string[] = subject.map((el: Score | Bet | SeasonBet) => el.userId);
        for (let nextSubject of furtherSubjects) {
          users = users.concat(nextSubject.map((el: Score | Bet | SeasonBet) => el.userId)); // concats user IDs
        }

        return users.unique().sort();
    }

    /**
     * Extracts the Score of a specific user, indicated by the given user ID,
     * from an array of Scores.
     * 
     * Returns zero-value Score if user can not be found in the array.
     * 
     * @param scores scores of many users
     * @param userId the ID of the user to extrat the Score
     * @returns 
     */
    private extractUserScore(scores: Score[], userId: string): Score {
        const idx: number = scores.findIndex(score => score.userId == userId);

        if (idx >= 0)
            return scores[idx];
        else
            return {
                userId: userId,
                points: 0,
                matches: 0,
                results: 0,
                extraTop: 0,
                extraOutsider: 0,
                extraSeason: 0
            };
    }

    /**
     * Returns a reference to the PointCalculator of the given user. If no
     * PointCalculator of the user is existing, a new one will be added and
     * returned
     * 
     * @param userId the ID of the target user
     * @returns a reference to the PointCalculator
     */
    private getPointCalculatorReference(userId: string): PointCalculatorTrendbased {
        let idx: number = this.pointCalculators.findIndex(pointCalc => pointCalc.userId == userId);
        if (idx >= 0)
            return this.pointCalculators[idx];
        else {
            let pointCalculator = new PointCalculatorTrendbased(userId);
            this.pointCalculators.push(pointCalculator);

            return pointCalculator;
        }
    }
}