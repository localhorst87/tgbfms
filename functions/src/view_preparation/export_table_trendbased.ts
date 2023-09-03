import { Score, User } from "../business_rules/basic_datastructures";
import { ScoreAdderTrendbased } from "../business_rules/score_adder_trendbased";
import { TableData } from "../data_access/export_datastructures";
import { TableExporter } from "./export_table";

export class TableExporterTrendbased implements TableExporter {
    private users: User[];
    private scoreAdder: ScoreAdderTrendbased;
    
    constructor(users: User[], scoreAdder: ScoreAdderTrendbased) {
        this.users = users;
        this.scoreAdder = scoreAdder;
    }

    /**
     * Exports the added Scores as TableData
     * 
     * @param users all user profiles
     * @param ingestSeasonScore
     * @returns 
     */
    public exportTable(ingestSeasonScore: boolean = false): TableData[] {
        let scores: Score[] = this.scoreAdder.getScores(ingestSeasonScore);
        const positions: number[] = this.makePositions(scores);

        let tableData: TableData[] = [];
        for (let i = 0; i < scores.length; i++) {
            tableData.push({
                position: positions[i],
                userName: this.getUserName(scores[i].userId),
                points: scores[i].points,
                matches: scores[i].matches,
                results: scores[i].results,
                extraTop: scores[i].extraTop,
                extraOutsider: scores[i].extraOutsider,
                extraSeason: scores[i].extraSeason
            });
        }

        return tableData;
    }

    /**
     * Returns the positions of the scores
     * 
     * @param scores 
     * @returns positions like [1, 2, 2, 4, 5]
     */
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

    /**
     * Returns the user display name of the user with the given user ID.
     * 
     * If the user can't be found in the user profiles array, "unknown user"
     * will be returned
     * 
     * @param userId user ID of target user
     * @param allUsers all user profiles
     * @returns user's display name
     */
    private getUserName(userId: string): string {
        const idx: number = this.users.findIndex(user => user.id == userId);

        if (idx == -1)
            return "unknown user";
        else
            return this.users[idx].displayName;
    }
}