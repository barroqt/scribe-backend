import { z } from "zod";
import { WONDERS } from "../data/wonders";

const wonderNames = WONDERS.map((w) => w.name) as [string, ...string[]];

export const createPlayerSchema = z.object({
  name: z.string().min(1).max(50).trim(),
});

export const createGameSchema = z.object({
  players: z
    .array(
      z.object({
        playerId: z.string().uuid(),
        wonderName: z.enum(wonderNames),
        score: z.number().int().min(0).max(200),
      })
    )
    .min(3)
    .max(7)
    .refine(
      (players) => {
        // Check that all wonder names are unique
        const wonderNames = players.map((p) => p.wonderName);
        return new Set(wonderNames).size === wonderNames.length;
      },
      {
        message: "Each player must play a different wonder",
      }
    )
    .refine(
      (players) => {
        // Check that all player IDs are unique
        const playerIds = players.map((p) => p.playerId);
        return new Set(playerIds).size === playerIds.length;
      },
      {
        message: "Each player can only play once per game",
      }
    ),
});
