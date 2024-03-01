export interface Player {
    userId: string;
    username: string;
    userIconPath: string;
    displayName: string;
  }
  
  export interface Match {
    gameId: string;
    rightPlayerId: string;
    leftPlayerId: string;
    createdAt: string;
    leftPlayer: Player;
    leftPlayerScore: number;
    rightPlayer: Player;
    rightPlayerScore: number;
    winner: Player;
    winnerId: string;
    
  }
  
  export interface HistoryData {
    matchHistory: Match[];
    gamesWon: number;
    gamesPlayed: number;
    gamesLost: number;
    rank: number;
  }