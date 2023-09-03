export interface Table {
  documentId: string;
  id: string;
  season: number;
  matchday: number;
  tableData: TableData[];
}

export interface TableData {
    position: number;
    userName: string;
    points: number;
    matches: number;
    results: number;
    extraTop: number;
    extraOutsider: number;
    extraSeason: number;
}