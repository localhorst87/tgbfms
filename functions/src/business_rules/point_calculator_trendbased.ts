import { PointCalculator } from "./point_calculator";
import { Match, Bet, Score } from "./basic_datastructures";
import { POINTS_TENDENCY, POINTS_ADDED_RESULT, FACTOR_TOP_MATCH, POINTS_ADDED_OUTSIDER_ONE, POINTS_ADDED_OUTSIDER_TWO } from "./rule_defined_values";

export class PointCalculatorTrendbased implements PointCalculator {
    score: Score;

    constructor(userId: string) {
        this.score = {
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
     * Adds the points of a single match to the users Score structure
     * 
     * @param betsAllUsers the Bets of all users of a single match
     * @param match the match to compare
     * @returns 
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
        
        return;
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
     * Adds a single score to the overall score of this user
     * 
     * @param score the single score
     */
    private addScore(score: Score): void {
      this.score.points += score.points;
      this.score.matches += score.matches;
      this.score.results += score.results;
      this.score.extraTop += score.extraTop;
      this.score.extraOutsider += score.extraOutsider;
      this.score.extraSeason += score.extraSeason;
    }
}