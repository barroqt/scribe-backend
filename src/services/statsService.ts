import { supabaseDb } from "./supabaseDatabase";
import { PlayerStats, WonderStats, GameHistory } from "../types";
import { WONDERS, getWonderByName } from "../data/wonders";
import { Player, Game, GamePlayer } from "./supabaseClient";

export class StatsService {
  async calculatePlayerStats(): Promise<PlayerStats[]> {
    const players = await supabaseDb.getAllPlayers();
    const games = await supabaseDb.getAllGames();

    return players.map((player) => {
      const playerGames = games.filter((game) =>
        game.players.some((p) => p.player_id === player.id)
      );

      const totalGames = playerGames.length;
      let wins = 0;
      let totalScore = 0;

      // Calculate wins and total score
      playerGames.forEach((game) => {
        const sortedPlayers = [...game.players].sort(
          (a, b) => b.score - a.score
        );
        const playerInGame = game.players.find(
          (p) => p.player_id === player.id
        )!;

        if (sortedPlayers[0].id === playerInGame.id) {
          wins++;
        }
        totalScore += playerInGame.score;
      });

      // Calculate wonder-specific stats
      const wonderStats = WONDERS.map((wonder) => {
        const wonderGames = playerGames.filter(
          (game) =>
            game.players.find((p) => p.player_id === player.id)?.wonder_name ===
            wonder.name
        );

        const wonderTotalGames = wonderGames.length;
        let wonderWins = 0;
        let wonderTotalScore = 0;

        wonderGames.forEach((game) => {
          const sortedPlayers = [...game.players].sort(
            (a, b) => b.score - a.score
          );
          const playerInGame = game.players.find(
            (p) => p.player_id === player.id
          )!;

          if (sortedPlayers[0].id === playerInGame.id) {
            wonderWins++;
          }
          wonderTotalScore += playerInGame.score;
        });

        return {
          wonderName: wonder.name,
          wonderDisplayName: wonder.displayName,
          gamesPlayed: wonderTotalGames,
          wins: wonderWins,
          winRate:
            wonderTotalGames > 0 ? (wonderWins / wonderTotalGames) * 100 : 0,
          averageScore:
            wonderTotalGames > 0 ? wonderTotalScore / wonderTotalGames : 0,
        };
      });

      return {
        playerId: player.id,
        playerName: player.name,
        totalGames,
        wins,
        winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0,
        averageScore: totalGames > 0 ? totalScore / totalGames : 0,
        wonderStats: wonderStats.filter((ws) => ws.gamesPlayed > 0),
      };
    });
  }

  async calculateWonderStats(): Promise<WonderStats[]> {
    const games = await supabaseDb.getAllGames();

    return WONDERS.map((wonder) => {
      const wonderGames = games.filter((game) =>
        game.players.some((p) => p.wonder_name === wonder.name)
      );

      const totalGames = wonderGames.length;
      let wins = 0;
      let totalScore = 0;

      wonderGames.forEach((game) => {
        const sortedPlayers = [...game.players].sort(
          (a, b) => b.score - a.score
        );
        const wonderPlayer = game.players.find(
          (p) => p.wonder_name === wonder.name
        )!;

        if (sortedPlayers[0].id === wonderPlayer.id) {
          wins++;
        }
        totalScore += wonderPlayer.score;
      });

      return {
        wonderName: wonder.name,
        wonderDisplayName: wonder.displayName,
        totalGames,
        wins,
        winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0,
        averageScore: totalGames > 0 ? totalScore / totalGames : 0,
      };
    }).filter((ws) => ws.totalGames > 0);
  }

  async getGameHistory(): Promise<GameHistory[]> {
    const games = await supabaseDb.getAllGames();
    const players = await supabaseDb.getAllPlayers();

    return games
      .map((game) => {
        const sortedPlayers = [...game.players].sort(
          (a, b) => b.score - a.score
        );

        const gamePlayers = sortedPlayers.map((gamePlayer, index) => {
          const player = players.find((p) => p.id === gamePlayer.player_id)!;
          const wonder = getWonderByName(gamePlayer.wonder_name)!;

          return {
            playerId: gamePlayer.player_id,
            playerName: player.name,
            wonderName: gamePlayer.wonder_name,
            wonderDisplayName: wonder.displayName,
            score: gamePlayer.score,
            position: index + 1,
          };
        });

        return {
          id: game.id,
          createdAt: new Date(game.created_at),
          players: gamePlayers,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const statsService = new StatsService();