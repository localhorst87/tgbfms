export interface BetWriteData {
  matchId: number;
  matchTimestamp: number;
  isTopMatch: boolean;
  teamNameHome: string;
  teamNameAway: string;
  betGoalsHome: number;
  betGoalsAway: number;
  isBetFixed: boolean;
  betDocumentId: string;
}
