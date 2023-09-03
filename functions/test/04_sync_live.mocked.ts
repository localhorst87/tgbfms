import { describe, it } from "mocha";
import { expect } from "chai";
import * as sync_live_helpers from "../src/sync_live/sync_live_helpers";
import { User } from "../../src/app/Businessrules/basic_datastructures";
import { MatchdayScoreSnapshot } from "../src/data_access/import_datastructures";
import { Table, TableData } from "../src/data_access/export_datastructures";

describe.only('sync_live_helpers', () => {

    const allScoreSnapshots: MatchdayScoreSnapshot[] = [
        {
            documentId: "scoresnap_01",
            season: 2099,
            matchday: 1,
            scores: [
                {
                    userId: "user_01",
                    points: 4,
                    matches: 2,
                    results: 1,
                    extraTop: 1,
                    extraOutsider: 0,
                    extraSeason: 0
                },
                {
                    userId: "user_02",
                    points: 9,
                    matches: 5,
                    results: 1,
                    extraTop: 1,
                    extraOutsider: 2,
                    extraSeason: 0
                },
                {
                    userId: "user_03",
                    points: 6,
                    matches: 4,
                    results: 0,
                    extraTop: 1,
                    extraOutsider: 1,
                    extraSeason: 0
                }                   
            ]
        },
        {
            documentId: "scoresnap_02",
            season: 2099,
            matchday: 2,
            scores: [
                {
                    userId: "user_02",
                    points: 10,
                    matches: 8,
                    results: 2,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 0
                },
                {
                    userId: "user_01",
                    points: 4,
                    matches: 2,
                    results: 0,
                    extraTop: 1,
                    extraOutsider: 1,
                    extraSeason: 0
                },
                {
                    userId: "user_03",
                    points: 7,
                    matches: 3,
                    results: 2,
                    extraTop: 0,
                    extraOutsider: 2,
                    extraSeason: 0
                }                   
            ]
        },
        {
            documentId: "scoresnap_03",
            season: 2099,
            matchday: 3,
            scores: [
                {
                    userId: "user_03",
                    points: 6,
                    matches: 6,
                    results: 0,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 0
                },
                {
                    userId: "user_01",
                    points: 6,
                    matches: 3,
                    results: 0,
                    extraTop: 1,
                    extraOutsider: 2,
                    extraSeason: 0
                },
                {
                    userId: "user_02",
                    points: 3,
                    matches: 2,
                    results: 1,
                    extraTop: 0,
                    extraOutsider: 0,
                    extraSeason: 0
                }                   
            ]
        },
    ];

    const seasonScoreSnapshot: MatchdayScoreSnapshot = {
        documentId: "scoresnap_season",
        season: 2099,
        matchday: 3,
        scores: [
            {
                userId: "user_01",
                points: 2,
                matches: 0,
                results: 0,
                extraTop: 0,
                extraOutsider: 0,
                extraSeason: 2
            },
            {
                userId: "user_02",
                points: 3,
                matches: 0,
                results: 0,
                extraTop: 0,
                extraOutsider: 0,
                extraSeason: 3
            },
            {
                userId: "user_03",
                points: 0,
                matches: 0,
                results: 0,
                extraTop: 0,
                extraOutsider: 0,
                extraSeason: 0
            }                   
        ]
    };

    const activeUsers: User[] = [
        {
            documentId: "user_profile_01",
            id: "user_01",
            displayName: "userOne",
            email: "user1@tgbfms.de",
            isAdmin: false,
            isActive: true,
            configs: {
                notificationLevel: 0,
                notificationTime: 2,
                theme: "dark"
            }
        },
        {
            documentId: "user_profile_02",
            id: "user_02",
            displayName: "userTwo",
            email: "user2@tgbfms.de",
            isAdmin: false,
            isActive: true,
            configs: {
                notificationLevel: 0,
                notificationTime: 2,
                theme: "dark"
            }
        },
        {
            documentId: "user_profile_03",
            id: "user_03",
            displayName: "userThree",
            email: "user3@tgbfms.de",
            isAdmin: false,
            isActive: true,
            configs: {
                notificationLevel: 0,
                notificationTime: 2,
                theme: "dark"
            }
        }
    ];

    describe('makeTable', () => {

        it('request most recent matchday => expect to return added, ordered table', () => {
            const table: TableData[] = sync_live_helpers.makeTable(1, 3, activeUsers, allScoreSnapshots);
            expect(table).to.deep.equal([
                {
                    position: 1,
                    userName: "userTwo",
                    points: 22,
                    matches: 15,
                    results: 4,
                    extraTop: 1,
                    extraOutsider: 2,
                    extraSeason: 0
                },
                {
                    position: 2,
                    userName: "userThree",
                    points: 19,
                    matches: 13,
                    results: 2,
                    extraTop: 1,
                    extraOutsider: 3,
                    extraSeason: 0
                },
                {
                    position: 3,
                    userName: "userOne",
                    points: 14,
                    matches: 7,
                    results: 1,
                    extraTop: 3,
                    extraOutsider: 3,
                    extraSeason: 0
                }
            ]
            );
        });

        it('requested matchday greater than most recent matchday => expect to return total table of most recent matchday', async () => {
            const table: TableData[] = sync_live_helpers.makeTable(1, 4, activeUsers, allScoreSnapshots);
            expect(table).to.deep.equal([
                {
                    position: 1,
                    userName: "userTwo",
                    points: 22,
                    matches: 15,
                    results: 4,
                    extraTop: 1,
                    extraOutsider: 2,
                    extraSeason: 0
                },
                {
                    position: 2,
                    userName: "userThree",
                    points: 19,
                    matches: 13,
                    results: 2,
                    extraTop: 1,
                    extraOutsider: 3,
                    extraSeason: 0
                },
                {
                    position: 3,
                    userName: "userOne",
                    points: 14,
                    matches: 7,
                    results: 1,
                    extraTop: 3,
                    extraOutsider: 3,
                    extraSeason: 0
                }
            ]);
        });

        it('requested matchday smaller than most recent matchday => expect to return total table of requested matchday', async () => {
            const table: TableData[] = sync_live_helpers.makeTable(1, 2, activeUsers, allScoreSnapshots);
            expect(table).to.deep.equal([
                {
                    position: 1,
                    userName: "userTwo",
                    points: 19,
                    matches: 13,
                    results: 3,
                    extraTop: 1,
                    extraOutsider: 2,
                    extraSeason: 0
                },
                {
                    position: 2,
                    userName: "userThree",
                    points: 13,
                    matches: 7,
                    results: 2,
                    extraTop: 1,
                    extraOutsider: 3,
                    extraSeason: 0
                },
                {
                    position: 3,
                    userName: "userOne",
                    points: 8,
                    matches: 4,
                    results: 1,
                    extraTop: 2,
                    extraOutsider: 1,
                    extraSeason: 0
                }
            ]);
        });
        
    });

    describe('makeFinalTable', () => {

        it('basic functionality test', () => {
            const table: Table = sync_live_helpers.makeFinalTable(2099, 3, activeUsers, allScoreSnapshots, seasonScoreSnapshot);
            expect(table).to.deep.equal({
                documentId: "",
                id: "final",
                season: 2099,
                matchday: 3,
                tableData: [
                    {
                        position: 1,
                        userName: "userTwo",
                        points: 25,
                        matches: 15,
                        results: 4,
                        extraTop: 1,
                        extraOutsider: 2,
                        extraSeason: 3
                    },
                    {
                        position: 2,
                        userName: "userThree",
                        points: 19,
                        matches: 13,
                        results: 2,
                        extraTop: 1,
                        extraOutsider: 3,
                        extraSeason: 0
                    },
                    {
                        position: 3,
                        userName: "userOne",
                        points: 16,
                        matches: 7,
                        results: 1,
                        extraTop: 3,
                        extraOutsider: 3,
                        extraSeason: 2
                    }
                ]
            });
        });
        
    });
    
});