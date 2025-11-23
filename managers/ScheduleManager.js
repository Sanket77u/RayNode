const cron = require('node-cron');
const supabase = require('../database/supabase');

class ScheduleManager {
    constructor(client) {
        this.client = client;
        this.loadScheduledMatches();
    }

    async loadScheduledMatches() {
        try {
            // Load unnotified matches from database
            const { data: matches, error } = await supabase
                .from('matches')
                .select(`
                    *,
                    tournaments (
                        name,
                        servers (
                            guild_id
                        ),
                        tournament_squads (
                            players (
                                discord_id
                            )
                        )
                    )
                `)
                .eq('reminder_sent', false)
                .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

            if (error) throw error;

            console.log(`✅ Loaded ${matches?.length || 0} scheduled matches from database`);
        } catch (error) {
            console.error('Error loading scheduled matches:', error);
        }
    }

    startScheduler() {
        // Check every minute for scheduled matches
        cron.schedule('* * * * *', () => {
            this.checkScheduledMatches();
        });
        console.log('✅ Match scheduler started');
    }

    async scheduleMatch(guildId, tournamentName, time, channelLink, playerIds) {
        try {
            if (!guildId || !tournamentName || !time || !channelLink || !playerIds) {
                console.error('scheduleMatch: Missing required parameters');
                return null;
            }
            const nameLower = tournamentName.toLowerCase();

            // Get server ID
            const { data: server } = await supabase
                .from('servers')
                .select('id')
                .eq('guild_id', guildId)
                .single();

            if (!server) {
                console.error('Server not found');
                return null;
            }

            // Get tournament ID
            const { data: tournament, error: tournamentError } = await supabase
                .from('tournaments')
                .select('id')
                .eq('server_id', server.id)
                .eq('name_lower', nameLower)
                .single();

            if (tournamentError || !tournament) {
                console.error('Tournament not found');
                return null;
            }

            // Create match record
            const { data: match, error: matchError } = await supabase
                .from('matches')
                .insert([{
                    tournament_id: tournament.id,
                    match_time: time,
                    channel_link: channelLink,
                    notified: true, // Set to true since we send immediate notification
                    reminder_sent: false
                }])
                .select()
                .single();

            if (matchError) throw matchError;

            // Send immediate notification
            await this.sendMatchNotification(
                {
                    tournamentName,
                    time,
                    channelLink,
                    playerIds
                },
                'immediate'
            );

            return match;
        } catch (error) {
            console.error('Error scheduling match:', error);
            return null;
        }
    }

    async checkScheduledMatches() {
        try {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            // Get matches that need reminders
            const { data: matches, error } = await supabase
                .from('matches')
                .select(`
                    *,
                    tournaments (
                        name,
                        tournament_squads (
                            players (
                                discord_id
                            )
                        )
                    )
                `)
                .eq('reminder_sent', false)
                .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

            if (error) throw error;

            for (const match of matches || []) {
                const matchTime = this.parseTime(match.match_time);
                if (!matchTime) continue;

                // Check if current time matches the scheduled time
                if (currentHour === matchTime.hour && currentMinute === matchTime.minute) {
                    const playerIds = match.tournaments.tournament_squads.map(
                        ts => ts.players.discord_id
                    );

                    await this.sendMatchNotification(
                        {
                            tournamentName: match.tournaments.name,
                            time: match.match_time,
                            channelLink: match.channel_link,
                            playerIds
                        },
                        'reminder'
                    );

                    // Mark as reminder sent
                    await supabase
                        .from('matches')
                        .update({ reminder_sent: true })
                        .eq('id', match.id);
                }
            }
        } catch (error) {
            console.error('Error checking scheduled matches:', error);
        }
    }

    parseTime(timeStr) {
        // Parse time formats like "9pm", "21:00", "9:30pm"
        const time = timeStr.toLowerCase().trim();

        // Format: 9pm, 10am
        let match = time.match(/^(\d{1,2})(am|pm)$/);
        if (match) {
            let hour = parseInt(match[1]);
            if (match[2] === 'pm' && hour !== 12) hour += 12;
            if (match[2] === 'am' && hour === 12) hour = 0;
            return { hour, minute: 0 };
        }

        // Format: 9:30pm, 10:45am
        match = time.match(/^(\d{1,2}):(\d{2})(am|pm)$/);
        if (match) {
            let hour = parseInt(match[1]);
            const minute = parseInt(match[2]);
            if (match[3] === 'pm' && hour !== 12) hour += 12;
            if (match[3] === 'am' && hour === 12) hour = 0;
            return { hour, minute };
        }

        // Format: 21:00, 09:30
        match = time.match(/^(\d{1,2}):(\d{2})$/);
        if (match) {
            return { hour: parseInt(match[1]), minute: parseInt(match[2]) };
        }

        return null;
    }

    async getRecentMatch(guildId, tournamentName) {
        try {
            if (!guildId || !tournamentName) {
                console.error('getRecentMatch: Missing guildId or tournamentName');
                return null;
            }
            const nameLower = tournamentName.toLowerCase();

            // Get server ID
            const { data: server } = await supabase
                .from('servers')
                .select('id')
                .eq('guild_id', guildId)
                .single();

            if (!server) return null;

            const { data: match, error } = await supabase
                .from('matches')
                .select(`
                    *,
                    tournaments!inner (
                        name,
                        name_lower,
                        server_id
                    )
                `)
                .eq('tournaments.server_id', server.id)
                .eq('tournaments.name_lower', nameLower)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error || !match) return null;

            return {
                time: match.match_time,
                channelLink: match.channel_link,
                scheduledAt: match.created_at
            };
        } catch (error) {
            console.error('Error getting recent match:', error);
            return null;
        }
    }

    async sendMatchNotification(match, type) {
        const messageType =
            type === 'immediate'
                ? '🎮 **Match Scheduled!**'
                : '⏰ **Match Starting Now!**';
        const message =
            `${messageType}\n\n` +
            `Tournament: **${match.tournamentName}**\n` +
            `Time: **${match.time} IST**\n` +
            `Channel: ${match.channelLink}\n\n` +
            (type === 'immediate'
                ? `You will receive another reminder at match time!`
                : `Join the match now!`);

        for (const playerId of match.playerIds) {
            try {
                const user = await this.client.users.fetch(playerId);
                await user.send(message);

                // Update player username in database
                if (this.client.tournaments) {
                    await this.client.tournaments.updatePlayerUsername(
                        playerId,
                        user.username
                    );
                }
            } catch (error) {
                console.error(`Failed to send DM to ${playerId}:`, error.message);
            }
        }

        console.log(`✅ Sent ${type} notifications for ${match.tournamentName}`);
    }
}

module.exports = ScheduleManager;
