import { db } from "./database";
import { PlayerStats, WonderStats, GameHistory } from "../types";
import { WONDERS, getWonderByName } from "../data/wonders";

export class StatsService {
  calculatePlayerStats(): PlayerStats[] {
    const players = db.getAllPlayers();
    const games = db.getAllGames();

    return players.map((player) => {
      const playerGames = games.filter((game) =>
        game.players.some((p) => p.playerId === player.id)
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
          (p) => p.playerId === player.id
        )!;

        if (sortedPlayers[0].playerId === player.id) {
          wins++;
        }
        totalScore += playerInGame.score;
      });

      // Calculate wonder-specific stats
      const wonderStats = WONDERS.map((wonder) => {
        const wonderGames = playerGames.filter(
          (game) =>
            game.players.find((p) => p.playerId === player.id)?.wonderName ===
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
            (p) => p.playerId === player.id
          )!;

          if (sortedPlayers[0].playerId === player.id) {
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

  calculateWonderStats(): WonderStats[] {
    const games = db.getAllGames();

    return WONDERS.map((wonder) => {
      const wonderGames = games.filter((game) =>
        game.players.some((p) => p.wonderName === wonder.name)
      );

      const totalGames = wonderGames.length;
      let wins = 0;
      let totalScore = 0;

      wonderGames.forEach((game) => {
        const sortedPlayers = [...game.players].sort(
          (a, b) => b.score - a.score
        );
        const wonderPlayer = game.players.find(
          (p) => p.wonderName === wonder.name
        )!;

        if (sortedPlayers[0].playerId === wonderPlayer.playerId) {
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

  getGameHistory(): GameHistory[] {
    const games = db.getAllGames();
    const players = db.getAllPlayers();

    return games
      .map((game) => {
        const sortedPlayers = [...game.players].sort(
          (a, b) => b.score - a.score
        );

        const gamePlayers = sortedPlayers.map((gamePlayer, index) => {
          const player = players.find((p) => p.id === gamePlayer.playerId)!;
          const wonder = getWonderByName(gamePlayer.wonderName)!;

          return {
            playerId: gamePlayer.playerId,
            playerName: player.name,
            wonderName: gamePlayer.wonderName,
            wonderDisplayName: wonder.displayName,
            score: gamePlayer.score,
            position: index + 1,
          };
        });

        return {
          id: game.id,
          createdAt: game.createdAt,
          players: gamePlayers,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const statsService = new StatsService();
