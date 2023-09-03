import { TableData } from "../data_access/export_datastructures";

export interface TableExporter {
    exportTable(ingestSeasonScore: boolean): TableData[];
}