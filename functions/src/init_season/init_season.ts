import { SEASON } from "../business_rules/rule_defined_values";
import { updateScoreSnapshot, updateTablesView, updateStats } from "../sync_live/sync_live";

/**
 * Initiates ScoreSnapshot, TableView and Statistics in the DB
 */
export async function initSeason(): Promise<void> {
    await updateScoreSnapshot(SEASON, 1);
    await updateTablesView(SEASON, 1);
    await updateStats(SEASON, 1);

    return;
}