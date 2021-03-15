export interface Match {
  day: number;
  matchId: number;
  timestamp: number;
  teamIdHome: number;
  teamIdAway: number;
}

export interface MatchExtended extends Match {
  documentId: string;
}

export interface Bet {
  matchId: number;
  userId: number;
  isFixed: boolean;
  goalsHome: number;
  goalsAway: number;
}

export interface BetExtended extends Bet {
  documentId: string;
}

export interface Result {
  matchId: number;
  goalsHome: number;
  goalsAway: number;
}

export interface ResultExtended extends Result {
  documentId: string;
}

export interface Team {
  id: number;
  nameLong: string;
  nameShort: string;
}

export interface TeamExtended extends Team {
  documentId: string;
}
