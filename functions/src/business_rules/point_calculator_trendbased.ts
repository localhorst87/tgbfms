import { PointCalculator } from "./point_calculator";
import { Match, Bet, Score, SeasonBet, SeasonResult } from "./basic_datastructures";
import { 
    POINTS_TENDENCY,
    POINTS_ADDED_RESULT,
    FACTOR_TOP_MATCH,
    POINTS_ADDED_OUTSIDER_ONE,
    POINTS_ADDED_OUTSIDER_TWO,
    POINTS_SEASON_FIRST_EXACT,
    POINTS_SEASON_SECOND_EXACT,
    POINTS_SEASON_LOSER_CORRECT,
    POINTS_SEASON_LOSER_EXACT } from "./rule_defined_values";

export class PointCalculatorTrendbased implements PointCalculator {
    userId: string;
    private score: Score;
    private seasonScore: Score;

    constructor(userId: string) {
        this.userId = userId;
        this.score = {
            userId: userId,
            points: 0,
            matches: 0,
            results: 0,
            extraTop: 0,
            extraOutsider: 0,
            extraSeason: 0
        };
        this.seasonScore = {
            userId: userId,
            points: 0,
            matches: 0,
            results: 0,
            extraTop: 0,
            extraOutsider: 0,
            extraSeason: 0
        }
    }

    /**
     * Returns the Score of the user
     * 
     * @param ingestSeasonScore if set to true, the season Score will be added
     * @returns the user Score
     */
    public getScore(ingestSeasonScore: boolean = false): Score {
        if (ingestSeasonScore) 
            return this.addTwoScores({...this.score}, {...this.seasonScore});
        else
            return {...this.score};
    }

    /**
     * Calculates and adds the points of a single match to the users Score
     * 
     * @param betsAllUsers the Bets of all users of a single match
     * @param match the match to compare
     */
    public addSingleMatchScore(betsAllUsers: Bet[], match: Match): void {
        
        let betUser: Bet = { documentId: "", matchId: -1, userId: "", isFixed: false, goalsHome: -1, goalsAway: -1 };
        for (let bet of betsAllUsers) {
            if (this.score.userId == bet.userId) {
                betUser = bet;
                break;
            }
        }

        let singleScore = {
            userId: this.score.userId,
            points: 0,
            matches: 0,
            results: 0,
            extraTop: 0,
            extraOutsider: 0,
            extraSeason: 0
        };

        if (betUser.matchId != match.matchId)
            return;

        if (this.isTendencyCorrect(betUser, match)) {
            singleScore.matches += 1;
            singleScore.points += POINTS_TENDENCY;
        }
        if (this.isResultCorrect(betUser, match)) {
            singleScore.results += 1;
            singleScore.points += POINTS_ADDED_RESULT;
        }
        if (match.isTopMatch) {
            singleScore.extraTop += singleScore.points * (FACTOR_TOP_MATCH - 1);
            singleScore.points *= FACTOR_TOP_MATCH;
        }
        if (singleScore.points > 0) {
            const extraOutsider: number = this.getPotentialOutsiderPoints(betsAllUsers, betUser);
            singleScore.extraOutsider += extraOutsider;
            singleScore.points += extraOutsider;
        }
      
        this.addScore(singleScore);
    }

    /**
     * Calculates and adds season score of the specific user to the Score.
     * Given bets user ID must correspond with the userID assigned on
     * instantiation
     * 
     * @param bets season bets of the user (all or some)
     * @param results season results (all or some)
     */
    public addSeasonScore(bets: SeasonBet[], results: SeasonResult[]): void {  
        let points: number = 0;

        const relegatorResults: SeasonResult[] = results.filter(res => res.place < 0);

        for (let bet of bets) {
            // if bet not available or wrong user => next bet
            if (bet.teamId == -1 || bet.userId !== this.score.userId)
                continue;
    
            // if result not available, make an unknown result
            let result: SeasonResult | undefined = results.find(res => res.place == bet.place);
            if (result === undefined) {
                result = this.makeUnknownSeasonResult(bet.season, bet.place);
            }

            // check for exact matching of bet and result
            if (bet.teamId == result.teamId) {
                if (bet.place == 1)
                    points += POINTS_SEASON_FIRST_EXACT;
                else if (bet.place == 2)
                    points += POINTS_SEASON_SECOND_EXACT;
                else
                    points += POINTS_SEASON_LOSER_EXACT;
            }
            else {    
                // for relegator bets, points can also be collected for not
                // exact correctness team of bet is among the relegator places
                if (bet.place < 0) {
                    for (let relegatorRes of relegatorResults) {
                        if (bet.teamId == relegatorRes.teamId)
                            points += POINTS_SEASON_LOSER_CORRECT;
                    }
                }
            }
        }
      
      this.seasonScore.points += points;
      this.seasonScore.extraSeason = points; 
    }

    /**
     * Adds any arbitrary Score to the overall score of this user
     * 
     * @param score the single score
     */
    public addScore(score: Score): void {
        this.score = this.addTwoScores({...this.score}, score);
    }

    /**
     * Return the addition of two Scores
     * 
     * @param score1 
     * @param score2 
     * @returns score1 + score2
     */
    private addTwoScores(score1: Score, score2: Score): Score {
        score1.points += score2.points;
        score1.matches += score2.matches;
        score1.results += score2.results;
        score1.extraTop += score2.extraTop;
        score1.extraOutsider += score2.extraOutsider;
        score1.extraSeason += score2.extraSeason; 

        return score1;
    }

    /**
     * returns the potentially (!) added points for outsider bets (two or only one
     * user per tendency) for the given bet of the user
     * 
     * @param betArray the Bets of all users
     * @param betUser the Bet of the user to observe
     * @returns 
     */
    private getPotentialOutsiderPoints(betArray: Bet[], betUser: Bet): number {    
        let nTendency: number[] = this.countTendencies(betArray);
        let tendencyUser = this.getTendency(betUser);
    
        if (tendencyUser == -1)
            return 0; // no bet available
    
        if (nTendency[tendencyUser] == 2)
            return POINTS_ADDED_OUTSIDER_TWO; // only 1 other user has set this bet
        else if (nTendency[tendencyUser] == 1)
            return POINTS_ADDED_OUTSIDER_ONE; // users bet is unique
        else
            return 0;
    }

    /**
     * Counts the tendencies of all given bets.
     * Returns an array, following the convention: [nDraw, nHome, nAway]
     * 
     * @param bets all bets to examine
     * @returns number of tendencies as given in the description
     */
    private countTendencies(bets: Bet[]): number[] {
        let tendencyCount: number[] = [0, 0, 0]; // [draw, home, away]

        for (let bet of bets) {
            let tendency: number = this.getTendency(bet);
            if (tendency != -1) {
            tendencyCount[tendency]++;
            }
        }

        return tendencyCount;
    }

    /**
     * Checks if the tendency of a Bet and a Match result is corresponding
     * 
     * @param bet Bet to compare
     * @param match Match to compare
     * @returns true/false if corresponding/not corresponding
     */
    private isTendencyCorrect(bet: Bet, match: Match): boolean {
        if (!this.isAvailable(bet) || !this.isAvailable(match))
            return false; // bet or result not set
        else
            return this.getTendency(bet) == this.getTendency(match);
    }

    /**
     * Checks if the result of a Bet and a Match result is corresponding
     * 
     * @param bet Bet to compare
     * @param match Match to compare
     * @returns true/false if result corresponding/not corresponding
     */
    private isResultCorrect(bet: Bet, match: Match): boolean {
        if (!this.isAvailable(bet) || !this.isAvailable(match))
            return false;
        else
            return bet.goalsHome == match.goalsHome && bet.goalsAway == match.goalsAway;
    }
      
    /**
     * Returns the tendeny of a Bet or Match:
     * 
     * 1 in case of home wins
     * 
     * 0 in case of draw
     * 
     * 2 in case of away wins.
     * 
     * if no goals set (goalsHome == goalsAway == -1) -1 is returned
     * 
     * @param target the Bet or Match to get the tendency from
     * @returns the tendency of the Bet or Match
     */
    private getTendency(target: Bet | Match): number {
        if (!this.isAvailable(target))
            return -1; // no result available
    
        if (target.goalsHome > target.goalsAway)
            return 1; // home team wins
        else if (target.goalsHome < target.goalsAway)
            return 2; // away team wins
        else
            return 0; // draw
    }
      
    /**
     * Checks if Bet or Match is goals are set
     * 
     * @param target the Bet or Match to check
     * @returns true/false upon availability/unavailability
     */
    private isAvailable(target: Bet | Match): boolean {
        if (target.goalsHome > -1 && target.goalsAway > -1)
            return true;
        else
            return false;
    }

    /**
     * Create dummy SeasonResult with teamId = -1
     * 
     * @param season 
     * @param place 
     * @returns 
     */
    private makeUnknownSeasonResult(season: number, place: number): SeasonResult {
        return {
            documentId: "",
            season: season,
            place: place,
            teamId: -1
        };
    }
}