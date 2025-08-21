import fs from "fs";
import path from "path";
import { Player, Game } from "../types";

interface DatabaseData {
  players: Player[];
  games: Game[];
}

class Database {
  private dataPath: string;
  private data: DatabaseData;

  constructor() {
    this.dataPath = path.join(process.cwd(), "data.json");
    this.data = this.loadData();
  }

  private loadData(): DatabaseData {
    try {
      if (fs.existsSync(this.dataPath)) {
        const rawData = fs.readFileSync(this.dataPath, "utf-8");
        const parsed = JSON.parse(rawData);
        // Convert date strings back to Date objects
        return {
          players: parsed.players.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
          })),
          games: parsed.games.map((g: any) => ({
            ...g,
            createdAt: new Date(g.createdAt),
          })),
        };
      }
    } catch (error: any) {
      console.error("Error loading database:", error);
    }

    return {
      players: [],
      games: [],
    };
  }

  private saveData(): void {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
    } catch (error: any) {
      console.error("Error saving database:", error);
    }
  }

  // Player methods
  getAllPlayers(): Player[] {
    return [...this.data.players];
  }

  getPlayerById(id: string): Player | undefined {
    return this.data.players.find((player) => player.id === id);
  }

  createPlayer(player: Player): Player {
    this.data.players.push(player);
    this.saveData();
    return player;
  }

  deletePlayer(id: string): boolean {
    const index = this.data.players.findIndex((player) => player.id === id);
    if (index === -1) return false;

    this.data.players.splice(index, 1);
    this.saveData();
    return true;
  }

  // Game methods
  getAllGames(): Game[] {
    return [...this.data.games];
  }

  getGameById(id: string): Game | undefined {
    return this.data.games.find((game) => game.id === id);
  }

  createGame(game: Game): Game {
    this.data.games.push(game);
    this.saveData();
    return game;
  }

  deleteGame(id: string): boolean {
    const index = this.data.games.findIndex((game) => game.id === id);
    if (index === -1) return false;

    this.data.games.splice(index, 1);
    this.saveData();
    return true;
  }
}

export const db = new Database();
