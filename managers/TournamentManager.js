const supabase = require('../database/supabase');

class TournamentManager {
    constructor() {
        console.log('✅ TournamentManager initialized with Supabase (Multi-Server)');
    }

    async ensureServer(guildId, guildName) {
        try {
            // Check if server exists
            let { data: server, error } = await supabase
                .from('servers')
                .select('id')
                .eq('guild_id', guildId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            // Create server if doesn't exist
            if (!server) {
                const { data: newServer, error: createError } = await supabase
                    .from('servers')
                    .insert([{ guild_id: guildId, guild_name: guildName }])
                    .select()
                    .single();

                if (createError) throw createError;
                server = newServer;
            }

            return server.id;
        } catch (error) {
            console.error('Error ensuring server:', error);
            return null;
        }
    }

    async createTournament(guildId, guildName, name) {
        try {
            const serverId = await this.ensureServer(guildId, guildName);
            if (!serverId) {
                return { success: false, message: 'Failed to register server!' };
            }

            const nameLower = name.toLowerCase();

            // Check if tournament exists in this server
            const { data: existing } = await supabase
                .from('tournaments')
                .select('id')
                .eq('server_id', serverId)
                .eq('name_lower', nameLower)
                .single();

            if (existing) {
                return { success: false, message: 'Tournament already exists in this server!' };
            }

            // Create tournament
            const { data, error } = await supabase
                .from('tournaments')
                .insert([{ server_id: serverId, name, name_lower: nameLower }])
                .select()
                .single();

            if (error) throw error;

            return { success: true, message: `Tournament "${name}" created successfully!`, data };
        } catch (error) {
            console.error('Error creating tournament:', error);
            return { success: false, message: 'Failed to create tournament!' };
        }
    }

    async addSquad(guildId, tournamentName, playerIds) {
        try {
            if (!guildId || !tournamentName) {
                console.error('addSquad: Missing guildId or tournamentName');
                return { success: false, message: 'Missing required parameters!' };
            }
            if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
                console.error('addSquad: Invalid or empty playerIds');
                return { success: false, message: 'No player IDs provided!' };
            }
            const nameLower = tournamentName.toLowerCase();

            // Get server ID
            const { data: server } = await supabase
                .from('servers')
                .select('id')
                .eq('guild_id', guildId)
                .single();

            if (!server) {
                return { success: false, message: 'Server not found!' };
            }

            // Get tournament
            const { data: tournament, error: tournamentError } = await supabase
                .from('tournaments')
                .select('id')
                .eq('server_id', server.id)
                .eq('name_lower', nameLower)
                .single();

            if (tournamentError || !tournament) {
                return { success: false, message: 'Tournament not found in this server!' };
            }

            // Delete existing squad members for this tournament
            await supabase
                .from('tournament_squads')
                .delete()
                .eq('tournament_id', tournament.id);

            // Add or update players
            const playerRecords = [];
            for (const discordId of playerIds) {
                // Check if player exists
                let { data: player } = await supabase
                    .from('players')
                    .select('id')
                    .eq('discord_id', discordId)
                    .single();

                // If player doesn't exist, create them
                if (!player) {
                    const { data: newPlayer, error } = await supabase
                        .from('players')
                        .insert([{ discord_id: discordId }])
                        .select()
                        .single();

                    if (error) {
                        console.error(`Error creating player ${discordId}:`, error);
                        continue;
                    }
                    player = newPlayer;
                }

                playerRecords.push({
                    tournament_id: tournament.id,
                    player_id: player.id
                });
            }

            // Insert squad members
            const { error: squadError } = await supabase
                .from('tournament_squads')
                .insert(playerRecords);

            if (squadError) throw squadError;

            return { 
                success: true, 
                message: `Squad added to "${tournamentName}" with ${playerIds.length} players!` 
            };
        } catch (error) {
            console.error('Error adding squad:', error);
            return { success: false, message: 'Failed to add squad!' };
        }
    }

    async getTournament(guildId, name) {
        try {
            if (!guildId || !name) {
                console.error('getTournament: Missing guildId or name');
                return null;
            }
            const nameLower = name.toLowerCase();

            // Get server ID
            const { data: server } = await supabase
                .from('servers')
                .select('id')
                .eq('guild_id', guildId)
                .single();

            if (!server) return null;

            const { data: tournament, error } = await supabase
                .from('tournaments')
                .select(`
                    *,
                    tournament_squads (
                        players (
                            discord_id,
                            discord_username
                        )
                    )
                `)
                .eq('server_id', server.id)
                .eq('name_lower', nameLower)
                .single();

            if (error || !tournament) return null;

            // Format the response to match old structure
            return {
                id: tournament.id,
                name: tournament.name,
                squads: tournament.tournament_squads.map(ts => ts.players.discord_id),
                createdAt: tournament.created_at
            };
        } catch (error) {
            console.error('Error getting tournament:', error);
            return null;
        }
    }

    async getAllTournaments(guildId) {
        try {
            if (!guildId) {
                console.error('getAllTournaments: Missing guildId');
                return {};
            }
            // Get server ID
            const { data: server } = await supabase
                .from('servers')
                .select('id')
                .eq('guild_id', guildId)
                .single();

            if (!server) return {};

            const { data: tournaments, error } = await supabase
                .from('tournaments')
                .select(`
                    *,
                    tournament_squads (
                        players (
                            discord_id
                        )
                    )
                `)
                .eq('server_id', server.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Format to match old structure
            const formatted = {};
            tournaments.forEach(t => {
                formatted[t.name_lower] = {
                    name: t.name,
                    squads: t.tournament_squads.map(ts => ts.players.discord_id),
                    createdAt: t.created_at
                };
            });

            return formatted;
        } catch (error) {
            console.error('Error getting tournaments:', error);
            return {};
        }
    }

    async deleteTournament(guildId, name) {
        try {
            if (!guildId || !name) {
                console.error('deleteTournament: Missing guildId or name');
                return { success: false, message: 'Missing required parameters!' };
            }
            const nameLower = name.toLowerCase();

            // Get server ID
            const { data: server } = await supabase
                .from('servers')
                .select('id')
                .eq('guild_id', guildId)
                .single();

            if (!server) {
                return { success: false, message: 'Server not found!' };
            }

            const { error } = await supabase
                .from('tournaments')
                .delete()
                .eq('server_id', server.id)
                .eq('name_lower', nameLower);

            if (error) throw error;

            return { success: true, message: `Tournament "${name}" deleted successfully!` };
        } catch (error) {
            console.error('Error deleting tournament:', error);
            return { success: false, message: 'Failed to delete tournament!' };
        }
    }

    async updatePlayerUsername(discordId, username) {
        try {
            const { error } = await supabase
                .from('players')
                .update({ discord_username: username })
                .eq('discord_id', discordId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating player username:', error);
        }
    }
}

module.exports = TournamentManager;
