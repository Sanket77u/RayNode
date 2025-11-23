const cron = require('node-cron');

class ScheduleManager {
    constructor(client) {
        this.client = client;
        this.scheduledMatches = [];
    }

    startScheduler() {
        // Check every minute for scheduled matches
        cron.schedule('* * * * *', () => {
            this.checkScheduledMatches();
        });
        console.log('✅ Match scheduler started');
    }

    scheduleMatch(tournamentName, time, channelLink, playerIds) {
        const match = {
            id: Date.now().toString(),
            tournamentName,
            time,
            channelLink,
            playerIds,
            notified: false,
            scheduledAt: new Date().toISOString()
        };

        this.scheduledMatches.push(match);

        // Send immediate notification
        this.sendMatchNotification(match, 'immediate');

        return match;
    }

    async checkScheduledMatches() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        for (const match of this.scheduledMatches) {
            if (match.notified) continue;

            const matchTime = this.parseTime(match.time);
            if (!matchTime) continue;

            // Check if current time matches the scheduled time
            if (currentHour === matchTime.hour && currentMinute === matchTime.minute) {
                await this.sendMatchNotification(match, 'reminder');
                match.notified = true;
            }
        }

        // Clean up old matches (older than 24 hours)
        this.scheduledMatches = this.scheduledMatches.filter(match => {
            const matchDate = new Date(match.scheduledAt);
            const hoursDiff = (now - matchDate) / (1000 * 60 * 60);
            return hoursDiff < 24;
        });
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

    async sendMatchNotification(match, type) {
        const messageType = type === 'immediate' ? '🎮 **Match Scheduled!**' : '⏰ **Match Starting Now!**';
        const message = `${messageType}\n\n` +
            `Tournament: **${match.tournamentName}**\n` +
            `Time: **${match.time} IST**\n` +
            `Channel: ${match.channelLink}\n\n` +
            (type === 'immediate' ?
                `You will receive another reminder at match time!` :
                `Join the match now!`);

        for (const playerId of match.playerIds) {
            try {
                const user = await this.client.users.fetch(playerId);
                await user.send(message);
            } catch (error) {
                console.error(`Failed to send DM to ${playerId}:`, error.message);
            }
        }

        console.log(`✅ Sent ${type} notifications for ${match.tournamentName}`);
    }
}

module.exports = ScheduleManager;
