-- RayNode Bot Database Schema v2 - Multi-Server Support

-- Drop existing tables if updating
-- DROP TABLE IF EXISTS matches CASCADE;
-- DROP TABLE IF EXISTS tournament_squads CASCADE;
-- DROP TABLE IF EXISTS tournaments CASCADE;
-- DROP TABLE IF EXISTS players CASCADE;
-- DROP TABLE IF EXISTS servers CASCADE;

-- Table: servers
CREATE TABLE IF NOT EXISTS servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id TEXT NOT NULL UNIQUE,
    guild_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: tournaments (now server-specific)
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_lower TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(server_id, name_lower)
);

-- Table: players
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discord_id TEXT NOT NULL UNIQUE,
    discord_username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: tournament_squads (junction table)
CREATE TABLE IF NOT EXISTS tournament_squads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, player_id)
);

-- Table: matches
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    match_time TEXT NOT NULL,
    channel_link TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notified BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_servers_guild_id ON servers(guild_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_server_id ON tournaments(server_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_name_lower ON tournaments(name_lower);
CREATE INDEX IF NOT EXISTS idx_players_discord_id ON players(discord_id);
CREATE INDEX IF NOT EXISTS idx_tournament_squads_tournament ON tournament_squads(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_squads_player ON tournament_squads(player_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_notified ON matches(notified);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_servers_updated_at ON servers;
CREATE TRIGGER update_servers_updated_at
    BEFORE UPDATE ON servers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tournaments_updated_at ON tournaments;
CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_players_updated_at ON players;
CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Policies (Allow all operations for service role)
DROP POLICY IF EXISTS "Enable all operations for service role" ON servers;
CREATE POLICY "Enable all operations for service role" ON servers
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for service role" ON tournaments;
CREATE POLICY "Enable all operations for service role" ON tournaments
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for service role" ON players;
CREATE POLICY "Enable all operations for service role" ON players
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for service role" ON tournament_squads;
CREATE POLICY "Enable all operations for service role" ON tournament_squads
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for service role" ON matches;
CREATE POLICY "Enable all operations for service role" ON matches
    FOR ALL USING (true);
