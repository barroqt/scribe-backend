export interface Player {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Wonder {
  name: string;
  displayName: string;
}

export interface GamePlayer {
  playerId: string;
  wonderName: string;
  score: number;
}

export interface Game {
  id: string;
  players: GamePlayer[];
  createdAt: Date;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  totalGames: number;
  wins: number;
  winRate: number;
  averageScore: number;
  wonderStats: Array<{
    wonderName: string;
    wonderDisplayName: string;
    gamesPlayed: number;
    wins: number;
    winRate: number;
    averageScore: number;
  }>;
}

export interface WonderStats {
  wonderName: string;
  wonderDisplayName: string;
  totalGames: number;
  wins: number;
  winRate: number;
  averageScore: number;
}

export interface GameHistory {
  id: string;
  createdAt: Date;
  players: Array<{
    playerId: string;
    playerName: string;
    wonderName: string;
    wonderDisplayName: string;
    score: number;
    position: number;
  }>;
}

// API Request/Response types
export interface CreatePlayerRequest {
  name: string;
}

export interface CreateGameRequest {
  players: Array<{
    playerId: string;
    wonderName: string;
    score: number;
  }>;
}
