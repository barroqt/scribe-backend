# 7 Wonders Tracker Backend

Backend API for tracking 7 Wonders games, built with Express.js, TypeScript, and Supabase.

## Features
- Player management (create, list, delete)
- Game tracking (create, list, delete)
- Wonder information
- Game statistics (player stats, wonder stats, game history)
- RESTful API

## Tech Stack
- Node.js with TypeScript
- Express.js
- Supabase (PostgreSQL database)
- Zod for validation

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a Supabase project:
   - Go to [supabase.com](https://supabase.com/) and create a new project
   - Get your project URL and API key from the project settings

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Supabase credentials

4. Create the required database tables in Supabase:
   ```sql
   -- Create players table
   CREATE TABLE players (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name VARCHAR(255) UNIQUE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create games table
   CREATE TABLE games (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create game_players table (junction table)
   CREATE TABLE game_players (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     game_id UUID REFERENCES games(id) ON DELETE CASCADE,
     player_id UUID REFERENCES players(id) ON DELETE CASCADE,
     wonder_name VARCHAR(255) NOT NULL,
     score INTEGER NOT NULL,
     UNIQUE(game_id, player_id)
   );

   -- Enable Row Level Security (RLS) 
   ALTER TABLE players ENABLE ROW LEVEL SECURITY;
   ALTER TABLE games ENABLE ROW LEVEL SECURITY;
   ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

   -- Create policies to allow all operations (you can restrict these later)
   CREATE POLICY "Enable all operations" ON players FOR ALL USING (true);
   CREATE POLICY "Enable all operations" ON games FOR ALL USING (true);
   CREATE POLICY "Enable all operations" ON game_players FOR ALL USING (true);
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Wonders
- `GET /api/wonders` - Get all wonders

### Players
- `GET /api/players` - List all players
- `POST /api/players` - Create a new player
- `DELETE /api/players/:id` - Delete a player

### Games
- `GET /api/games` - List all games
- `POST /api/games` - Create a new game
- `DELETE /api/games/:id` - Delete a game

### Statistics
- `GET /api/stats/players` - Get player statistics
- `GET /api/stats/wonders` - Get wonder statistics
- `GET /api/games/history` - Get game history

## Deployment

### Deploy to Vercel

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

### Environment Variables for Deployment

Make sure to set these environment variables in your deployment environment:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase project API key
- `FRONTEND_URL` - Your frontend URL (for CORS)
