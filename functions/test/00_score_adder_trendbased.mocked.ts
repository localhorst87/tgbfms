import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from "sinon";
import { ScoreAdderTrendbased } from "../src/business_rules/score_adder_trendbased";
import { PointCalculatorTrendbased } from "../src/business_rules/point_calculator_trendbased";
import { Bet, Match, Score, SeasonBet } from '../src/business_rules/basic_datastructures';
import { SeasonResult } from '../src/business_rules/basic_datastructures';

describe('ScoreAdderTrendbased', () => {

    describe('getScores', () => {

        it('Scores available => expect ordered Score array', () => {              
            let pointCalcStub1: PointCalculatorTrendbased = sinon.createStubInstance(PointCalculatorTrendbased);
            let pointCalcStub2: PointCalculatorTrendbased = sinon.createStubInstance(PointCalculatorTrendbased);
            
            pointCalcStub1.getScore = () => { return {
                userId: "user_1",
                points: 4,
                matches: 2,
                results: 0,
                extraTop: 0,
                extraOutsider: 2,
                extraSeason: 0
            }};
            pointCalcStub2.getScore = () => { return {
                userId: "user_2",
                points: 7,
                matches: 4,
                results: 2,
                extraTop: 1,
                extraOutsider: 1,
                extraSeason: 0
            }};

            let scoreAdder = new ScoreAdderTrendbased();
            scoreAdder["pointCalculators"] = [pointCalcStub1, pointCalcStub2];
            
            const scores: Score[] = scoreAdder.getScores();

            expect(scores).to.deep.equal([
                {
                    userId: "user_2",
                    points: 7,
                    matches: 4,
                    results: 2,
                    extraTop: 1,
                    extraOutsider: 1,
                    extraSeason: 0
                },
                {
                    userId: "user_1",
                    points: 4,
                    matches: 2,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 2,
                    extraSeason: 0
                }
            ]);
            
        });
        
    });

    describe('calcScores', () => {

        const bets: Bet[] = [
            {
                documentId: "user1_match1",
                matchId: 1,
                userId: "user_1",
                goalsHome: 2,
                goalsAway: 0,
                isFixed: true
            },
            {
                documentId: "user2_match1",
                matchId: 1,
                userId: "user_2",
                goalsHome: 1,
                goalsAway: 1,
                isFixed: true
            },
            {
                documentId: "user3_match1",
                matchId: 1,
                userId: "user_3",
                goalsHome: 2,
                goalsAway: 1,
                isFixed: true
            },
            {
                documentId: "user1_match2",
                matchId: 2,
                userId: "user_1",
                goalsHome: 1,
                goalsAway: 3,
                isFixed: true
            },
            {
                documentId: "user2_match2",
                matchId: 2,
                userId: "user_2",
                goalsHome: 1,
                goalsAway: 1,
                isFixed: true
            },
            {
                documentId: "user3_match2",
                matchId: 2,
                userId: "user_3",
                goalsHome: 2,
                goalsAway: 2,
                isFixed: true
            }
        ];

        const matches: Match[] = [
            {
                documentId: "match1",
                matchId: 1,
                season: 2099,
                matchday: 12,
                timestamp: 1000,
                isFinished: true,
                isTopMatch: false,
                teamIdHome: 10,
                teamIdAway: 20,
                goalsHome: 2,
                goalsAway: 0                
            },
            {
                documentId: "match2",
                matchId: 2,
                season: 2099,
                matchday: 12,
                timestamp: 1000,
                isFinished: true,
                isTopMatch: true,
                teamIdHome: 11,
                teamIdAway: 21,
                goalsHome: 1,
                goalsAway: 1                
            }
        ];  
        
        it('bets cover matches completely => calculate all points correctly', () => {
            let scoreAdder = new ScoreAdderTrendbased();
            scoreAdder.calcScores(matches, bets);
            
            const scores: Score[] = scoreAdder.getScores();

            expect(scores).to.deep.equal([
                {
                    userId: "user_3",
                    points: 5,
                    matches: 2,
                    results: 0,
                    extraTop: 1,
                    extraOutsider: 2,
                    extraSeason: 0
                },
                {
                    userId: "user_2",
                    points: 5,
                    matches: 1,
                    results: 1,
                    extraTop: 2,
                    extraOutsider: 1,
                    extraSeason: 0
                },
                {
                    userId: "user_1",
                    points: 3,
                    matches: 1,
                    results: 1,
                    extraTop: 0,
                    extraOutsider: 1,
                    extraSeason: 0
                }
            ]);
        });

        it('more bets than matches => expect to use only bets from given matches', () => {
            let scoreAdder = new ScoreAdderTrendbased();
            scoreAdder.calcScores(matches.slice(0,1), bets);
            
            const scores: Score[] = scoreAdder.getScores();

            expect(scores).to.deep.equal([
                {
                    userId: "user_1",
                    points: 3,
                    matches: 1,
                    results: 1,
                    extraTop: 0,
                    extraOutsider: 1,
                    extraSeason: 0
                },
                {
                    userId: "user_3",
                    points: 2,
                    matches: 1,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 1,
                    extraSeason: 0
                },
                {
                    userId: "user_2",
                    points: 0,
                    matches: 0,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 0
                }
            ]);
        });

        it('more matches than bets => expect to count missing matches as 0 points', () => {
            let scoreAdder = new ScoreAdderTrendbased();
            scoreAdder.calcScores(matches, bets.slice(0,3));
            
            const scores: Score[] = scoreAdder.getScores();

            expect(scores).to.deep.equal([
                {
                    userId: "user_1",
                    points: 3,
                    matches: 1,
                    results: 1,
                    extraTop: 0,
                    extraOutsider: 1,
                    extraSeason: 0
                },
                {
                    userId: "user_3",
                    points: 2,
                    matches: 1,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 1,
                    extraSeason: 0
                },
                {
                    userId: "user_2",
                    points: 0,
                    matches: 0,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 0
                }
            ]);
        });

        it('one user with incomplete number of bets => count only given bets of user', () => {
            let scoreAdder = new ScoreAdderTrendbased();
            const extendedBets: Bet[] = [...bets, {
                
                documentId: "user4_match2",
                matchId: 2,
                userId: "user_4",
                goalsHome: 0,
                goalsAway: 0,
                isFixed: true
                
            }];
            scoreAdder.calcScores(matches, extendedBets);
            
            const scores: Score[] = scoreAdder.getScores();

            expect(scores).to.deep.equal([
                {
                    userId: "user_3",
                    points: 4,
                    matches: 2,
                    results: 0,
                    extraTop: 1,
                    extraOutsider: 1,
                    extraSeason: 0
                },
                {
                    userId: "user_2",
                    points: 4,
                    matches: 1,
                    results: 1,
                    extraTop: 2,
                    extraOutsider: 0,
                    extraSeason: 0
                },
                {
                    userId: "user_1",
                    points: 3,
                    matches: 1,
                    results: 1,
                    extraTop: 0,
                    extraOutsider: 1,
                    extraSeason: 0
                },
                {
                    userId: "user_4",
                    points: 2,
                    matches: 1,
                    results: 0,
                    extraTop: 1,
                    extraOutsider: 0,
                    extraSeason: 0
                }
            ]);
        });
    });

    describe('calcSeasonScores', () => {

        const seasonBets: SeasonBet[] = [
            {
                documentId: "user1_p1",
                season: 2099,
                userId: "user_1",
                isFixed: true,
                place: 1,
                teamId: 10
            },
            {
                documentId: "user1_p2",
                season: 2099,
                userId: "user_1",
                isFixed: true,
                place: 2,
                teamId: 21
            },
            {
                documentId: "user1_p18",
                season: 2099,
                userId: "user_1",
                isFixed: true,
                place: -1,
                teamId: 185
            },
            {
                documentId: "user2_p1",
                season: 2099,
                userId: "user_2",
                isFixed: true,
                place: 1,
                teamId: 10
            },
            {
                documentId: "user2_p2",
                season: 2099,
                userId: "user_2",
                isFixed: true,
                place: 2,
                teamId: 20
            },
            {
                documentId: "user2_p18",
                season: 2099,
                userId: "user_2",
                isFixed: true,
                place: -1,
                teamId: 181
            }
        ];

        const seasonResults: SeasonResult[] = [
            {
                documentId: "result_1",
                season: 2099,
                place: 1,
                teamId: 10
            },
            {
                documentId: "result_2",
                season: 2099,
                place: 2,
                teamId: 20
            },
            {
                documentId: "result_18",
                season: 2099,
                place: -1,
                teamId: 180
            }
        ];

        it('bets cover results completely => calculate all points correctly', () => {
            let scoreAdder = new ScoreAdderTrendbased();
            scoreAdder.calcSeasonScores(seasonBets, seasonResults);

            const scores: Score[] = scoreAdder.getScores(true);

            expect(scores).to.deep.equal([
                {
                    userId: "user_2",
                    points: 5,
                    matches: 0,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 5 
                },
                {
                    userId: "user_1",
                    points: 3,
                    matches: 0,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 3 
                }
            ]);            
        });

        it('more bets than results => calculate only bets where results are given', () => {
            let scoreAdder = new ScoreAdderTrendbased();
            scoreAdder.calcSeasonScores(seasonBets, seasonResults.slice(0,1));

            const scores: Score[] = scoreAdder.getScores(true);

            expect(scores).to.deep.equal([
                {
                    userId: "user_1",
                    points: 3,
                    matches: 0,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 3 
                },
                {
                    userId: "user_2",
                    points: 3,
                    matches: 0,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 3 
                }
            ]);            
        });

        it('more results than bets => calculate only given bets', () => {
            let scoreAdder = new ScoreAdderTrendbased();
            scoreAdder.calcSeasonScores([seasonBets[0], seasonBets[4]], seasonResults);

            const scores: Score[] = scoreAdder.getScores(true);

            expect(scores).to.deep.equal([
                {
                    userId: "user_1",
                    points: 3,
                    matches: 0,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 3 
                },
                {
                    userId: "user_2",
                    points: 2,
                    matches: 0,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 2 
                }
            ]);            
        });
        
        it('one user with incomplete number of bets => count only given bets of user', () => {
            let scoreAdder = new ScoreAdderTrendbased();
            const seasonBetsExtended = [...seasonBets, {
                
                documentId: "user3_p16",
                season: 2099,
                userId: "user_3",
                isFixed: true,
                place: -3,
                teamId: 180
            }];
            scoreAdder.calcSeasonScores(seasonBetsExtended, seasonResults);

            const scores: Score[] = scoreAdder.getScores(true);

            expect(scores).to.deep.equal([
                {
                    userId: "user_2",
                    points: 5,
                    matches: 0,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 5 
                },
                {
                    userId: "user_1",
                    points: 3,
                    matches: 0,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 3 
                },
                {
                    userId: "user_3",
                    points: 1,
                    matches: 0,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 1
                }
            ]);            
        });
    });

    describe('addScores', () => {

        const scores: Score[] = [
            {
                userId: "user_1",
                points: 5,
                matches: 2,
                results: 0,
                extraTop: 1,
                extraOutsider: 2,
                extraSeason: 0
            },
            {
                userId: "user_2",
                points: 7,
                matches: 4,
                results: 0,
                extraTop: 2,
                extraOutsider: 1,
                extraSeason: 0
            }
        ];

        it('point calculators not yet given => expect to init point calculators and add scores', () => {
            let scoreAdder = new ScoreAdderTrendbased();
            scoreAdder.addScores(scores);

            const newScores: Score[] = scoreAdder.getScores();

            expect(newScores.filter(scores => scores.userId == "user_1")[0]).to.deep.equal(scores[0]);
            expect(newScores.filter(scores => scores.userId == "user_2")[0]).to.deep.equal(scores[1]);
        });

        it('point calculators already existing => expect to add offset', () => {
            let scoreAdder = new ScoreAdderTrendbased();
            let pointCalcUser1 = new PointCalculatorTrendbased("user_1");
            let pointCalcUser2 = new PointCalculatorTrendbased("user_2");

            pointCalcUser1["score"] = {
                userId: "user_1",
                points: 10,
                matches: 8,
                results: 2,
                extraTop: 0,
                extraOutsider: 0,
                extraSeason: 0
            };
            pointCalcUser2["score"] = {
                userId: "user_2",
                points: 3,
                matches: 2,
                results: 0,
                extraTop: 1,
                extraOutsider: 0,
                extraSeason: 0
            };

            scoreAdder["pointCalculators"].push(pointCalcUser2);
            scoreAdder["pointCalculators"].push(pointCalcUser1);

            scoreAdder.addScores(scores);

            const newScores: Score[] = scoreAdder.getScores();

            expect(newScores.filter(scores => scores.userId == "user_1")[0]).to.deep.equal({
                userId: "user_1",
                points: 15,
                matches: 10,
                results: 2,
                extraTop: 1,
                extraOutsider: 2,
                extraSeason: 0
            });
            expect(newScores.filter(scores => scores.userId == "user_2")[0]).to.deep.equal({
                userId: "user_2",
                points: 10,
                matches: 6,
                results: 0,
                extraTop: 3,
                extraOutsider: 1,
                extraSeason: 0
            });        
        });
        
    });

});