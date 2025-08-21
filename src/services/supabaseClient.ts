import { createClient } from '@supabase/supabase-js'

// Types
export type Player = {
  id: string
  name: string
  created_at: string
}

export type Game = {
  id: string
  created_at: string
}

export type GamePlayer = {
  id: string
  game_id: string
  player_id: string
  wonder_name: string
  score: number
}

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_KEY || ''

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_KEY.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)