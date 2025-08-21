import { supabase, Player, Game, GamePlayer } from './supabaseClient'
import { WONDERS } from '../data/wonders'

export class SupabaseDatabase {
  // Player methods
  async getAllPlayers(): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching players:', error)
      throw new Error('Failed to fetch players')
    }

    return data || []
  }

  async getPlayerById(id: string): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(`Error fetching player ${id}:`, error)
      return null
    }

    return data
  }

  async createPlayer(player: Omit<Player, 'id' | 'created_at'>): Promise<Player> {
    const { data, error } = await supabase
      .from('players')
      .insert([{ name: player.name }])
      .select()
      .single()

    if (error) {
      console.error('Error creating player:', error)
      throw new Error(error.message)
    }

    return data
  }

  async deletePlayer(id: string): Promise<boolean> {
    // First check if player exists in any games
    const { data: gamesData, error: gamesError } = await supabase
      .from('game_players')
      .select('id')
      .eq('player_id', id)
      .limit(1)

    if (gamesError) {
      console.error('Error checking player games:', gamesError)
      throw new Error('Failed to check player games')
    }

    if (gamesData && gamesData.length > 0) {
      throw new Error('Cannot delete player who has played games. Delete games first.')
    }

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Error deleting player ${id}:`, error)
      return false
    }

    return true
  }

  // Game methods
  async getAllGames(): Promise<Array<Game & { players: GamePlayer[] }>> {
    // First get all games
    const { data: gamesData, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })

    if (gamesError) {
      console.error('Error fetching games:', gamesError)
      throw new Error('Failed to fetch games')
    }

    // Get all game players
    const { data: gamePlayersData, error: gamePlayersError } = await supabase
      .from('game_players')
      .select('*')

    if (gamePlayersError) {
      console.error('Error fetching game players:', gamePlayersError)
      throw new Error('Failed to fetch game players')
    }

    // Combine games with their players
    const games = gamesData.map((game: any) => ({
      ...game,
      players: gamePlayersData.filter((gp: any) => gp.game_id === game.id)
    }))

    return games
  }

  async getGameById(id: string): Promise<(Game & { players: GamePlayer[] }) | null> {
    // Get the game
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single()

    if (gameError) {
      console.error(`Error fetching game ${id}:`, gameError)
      return null
    }

    if (!gameData) {
      return null
    }

    // Get game players
    const { data: gamePlayersData, error: gamePlayersError } = await supabase
      .from('game_players')
      .select('*')
      .eq('game_id', id)

    if (gamePlayersError) {
      console.error(`Error fetching players for game ${id}:`, gamePlayersError)
      throw new Error('Failed to fetch game players')
    }

    return {
      ...gameData,
      players: gamePlayersData
    }
  }

  async createGame(game: Omit<Game, 'id' | 'created_at'> & { players: Omit<GamePlayer, 'id' | 'game_id'>[] }): Promise<Game & { players: GamePlayer[] }> {
    // Start a transaction-like operation
    // First create the game
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert([{}])
      .select()
      .single()

    if (gameError) {
      console.error('Error creating game:', gameError)
      throw new Error('Failed to create game')
    }

    // Then create the game players
    const gamePlayersToInsert = game.players.map(player => ({
      game_id: gameData.id,
      player_id: player.player_id,
      wonder_name: player.wonder_name,
      score: player.score
    }))

    const { data: gamePlayersData, error: gamePlayersError } = await supabase
      .from('game_players')
      .insert(gamePlayersToInsert)
      .select()

    if (gamePlayersError) {
      console.error('Error creating game players:', gamePlayersError)
      // Try to delete the game we just created to avoid orphaned records
      await supabase.from('games').delete().eq('id', gameData.id)
      throw new Error('Failed to create game players')
    }

    return {
      ...gameData,
      players: gamePlayersData
    }
  }

  async deleteGame(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Error deleting game ${id}:`, error)
      return false
    }

    return true
  }

  // Wonder methods
  getWonders() {
    return WONDERS
  }
}

export const supabaseDb = new SupabaseDatabase()