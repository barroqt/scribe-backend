import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../services/database";
import { statsService } from "../services/statsService";
import { createPlayerSchema, createGameSchema } from "../validation/schema";
import { WONDERS } from "../data/wonders";
import { Player, Game, CreatePlayerRequest, CreateGameRequest } from "../types";

const router = Router();

// Health check
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get all wonders
router.get("/wonders", (req: Request, res: Response) => {
  res.json(WONDERS);
});

// Player routes
router.get("/players", (req: Request, res: Response) => {
  const players = db.getAllPlayers();
  res.json(players);
});

router.post("/players", (req: Request, res: Response) => {
  try {
    const validatedData = createPlayerSchema.parse(
      req.body
    ) as CreatePlayerRequest;

    // Check if player name already exists
    const existingPlayer = db
      .getAllPlayers()
      .find((p) => p.name.toLowerCase() === validatedData.name.toLowerCase());

    if (existingPlayer) {
      return res.status(400).json({ error: "Player name already exists" });
    }

    const player: Player = {
      id: uuidv4(),
      name: validatedData.name,
      createdAt: new Date(),
    };

    const createdPlayer = db.createPlayer(player);
    res.status(201).json(createdPlayer);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid input" });
  }
});

router.delete("/players/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if player exists in any games
  const games = db.getAllGames();
  const playerInGames = games.some((game) =>
    game.players.some((p) => p.playerId === id)
  );

  if (playerInGames) {
    return res.status(400).json({
      error: "Cannot delete player who has played games. Delete games first.",
    });
  }

  const deleted = db.deletePlayer(id);
  if (!deleted) {
    return res.status(404).json({ error: "Player not found" });
  }

  res.status(204).send();
});

// Game routes
router.get("/games", (req: Request, res: Response) => {
  const games = db.getAllGames();
  res.json(games);
});

router.post("/games", (req: Request, res: Response) => {
  try {
    const validatedData = createGameSchema.parse(req.body) as CreateGameRequest;

    // Validate that all player IDs exist
    const players = db.getAllPlayers();
    const playerIds = players.map((p) => p.id);

    for (const gamePlayer of validatedData.players) {
      if (!playerIds.includes(gamePlayer.playerId)) {
        return res.status(400).json({
          error: `Player with ID ${gamePlayer.playerId} does not exist`,
        });
      }
    }

    const game: Game = {
      id: uuidv4(),
      players: validatedData.players,
      createdAt: new Date(),
    };

    const createdGame = db.createGame(game);
    res.status(201).json(createdGame);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid input" });
  }
});

router.delete("/games/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const deleted = db.deleteGame(id);
  if (!deleted) {
    return res.status(404).json({ error: "Game not found" });
  }

  res.status(204).send();
});

// Stats routes
router.get("/stats/players", (req: Request, res: Response) => {
  const stats = statsService.calculatePlayerStats();
  res.json(stats);
});

router.get("/stats/wonders", (req: Request, res: Response) => {
  const stats = statsService.calculateWonderStats();
  res.json(stats);
});

router.get("/games/history", (req: Request, res: Response) => {
  const history = statsService.getGameHistory();
  res.json(history);
});

export default router;
