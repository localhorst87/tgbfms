export interface Match {
  matchId: number;
  timestamp: number;
  teamIdHome: number;
  teamIdAway: number;
}

export interface Bet {
  matchId: number;
  userId: number;
  isFixed: boolean;
  goalsHome: number;
  goalsAway: number;
}

export interface Result {
  matchId: number;
  goalsHome: number;
  goalsAway: number;
}
