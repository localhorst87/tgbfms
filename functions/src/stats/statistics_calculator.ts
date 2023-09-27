import { BoxPlot, ResultFrequency } from "../data_access/import_datastructures";

export interface StatisticsCalculator {
    setScoreSnapshots(): Promise<void>;
    setMatches(): Promise<void>;
    setBets(): Promise<void>;
    getSingleForm(userId: string, matchday: number): number;
    getFormHistory(userId: string, matchdayStart: number, matchdayEnd: number): number[];
    getPositionHistory(userId: string, matchday: number): number[];
    getBoxPlot(userId: string, matchday: number): BoxPlot;
    getMeanPoints(userId: string, matchday: number): number;
    getStdDev(userId: string, matchday: number): number;
    getMostFrequentBets(userId: string, matchday: number): ResultFrequency[];
    getMostFrequetResults(matchday: number): ResultFrequency[];
}