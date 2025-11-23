const config = require('../config');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.validCommands = [
            'create', 'ctm', 'add', 'match', 'tournaments', 'list',
            'delete', 'deltm', 'help', 'squad', 'ping'
        ];
    }

    isAdmin(member) {
        if (!member) return false;
        // Check if user has Administrator permission in the server
        return member.permissions.has('Administrator');
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[str2.length][str1.length];
    }

    findSimilarCommand(command) {
        let closest = null;
        let minDistance = Infinity;

        for (const validCmd of this.validCommands) {
            const distance = this.levenshteinDistance(command, validCmd);
            if (distance < minDistance && distance <= 2) {
                minDistance = distance;
                closest = validCmd;
            }
        }
        return closest;
    }

    async handleMessage(message) {
        try {
            const content = message.content.trim();

            // Check for prefix commands
            if (content.startsWith(config.prefix)) {
                await this.handlePrefixCommand(message);
            }

            // Check for slash-like commands
            if (content.startsWith('/')) {
                await this.handleSlashCommand(message);
            }
        } catch (error) {
            console.error('Error handling message:', error);
            try {
                await message.channel.send('❌ An error occurred while processing your command. Please try again.');
            } catch (e) {
                console.error('Failed to send error message:', e);
            }
        }
    }

    async handlePrefixCommand(message) {
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        let commandExecuted = false;

        // Create tournament commands
        if (['create', 'ctm'].includes(command)) {
            const subCommand = args[0]?.toLowerCase();
            if (subCommand === 'tournament' || subCommand === 'tm') {
                args.shift();
                await this.createTournament(message, args);
                commandExecuted = true;
            }
        }

        // Add squad command
        if (command === 'add') {
            const subCommand = args[0]?.toLowerCase();
            if (subCommand === 'squad') {
                args.shift();
                await this.addSquad(message, args);
                commandExecuted = true;
            }
        }

        // Match announcement command
        if (command === 'match') {
            await this.announceMatch(message, args);
            commandExecuted = true;
        }

        // List tournaments
        if (command === 'tournaments' || command === 'list') {
            await this.listTournaments(message);
            commandExecuted = true;
        }

        // Delete tournament
        if (command === 'delete' || command === 'deltm') {
            const subCommand = args[0]?.toLowerCase();
            if (subCommand === 'tournament' || subCommand === 'tm') {
                args.shift();
                await this.deleteTournament(message, args);
                commandExecuted = true;
            }
        }

        // Squad display command
        if (command === 'squad') {
            await this.showSquad(message, args);
            commandExecuted = true;
        }

        // Ping command
        if (command === 'ping') {
            await this.pingTournament(message, args);
            commandExecuted = true;
        }

        // Help command
        if (command === 'help') {
            await this.showHelp(message);
            commandExecuted = true;
        }

        // If command not executed, suggest similar command
        if (!commandExecuted) {
            const similar = this.findSimilarCommand(command);
            if (similar) {
                const embed = new EmbedBuilder()
                    .setColor('#ff9900')
                    .setTitle('❓ Unknown Command')
                    .setDescription(`You typed: \`ry.${command}\`\n\nDid you mean: \`ry.${similar}\`?`)
                    .setFooter({ text: 'Type ry.help for all commands' });
                message.reply({ embeds: [embed] });
            }
        }
    }

    async handleSlashCommand(message) {
        const content = message.content.slice(1).trim();
        const args = content.split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'create') {
            const subCommand = args[0]?.toLowerCase();
            if (subCommand === 'tournament') {
                args.shift();
                await this.createTournament(message, args);
            }
        }
    }

    async createTournament(message, args) {
        try {
            if (!this.isAdmin(message.member)) {
                return message.channel.send('❌ You need administrator permissions to create tournaments!');
            }

            const tournamentName = args.join(' ');
            if (!tournamentName) {
                return message.channel.send('❌ Please provide a tournament name!\nUsage: `ry.create tournament <name>`');
            }

            const result = await this.client.tournaments.createTournament(
                message.guild.id,
                message.guild.name,
                tournamentName
            );

            const embed = new EmbedBuilder()
                .setColor(result.success ? '#00ff00' : '#ff0000')
                .setTitle(result.success ? '✅ Tournament Created' : '❌ Error')
                .setDescription(result.message || 'An error occurred')
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in createTournament:', error);
            await message.channel.send('❌ Failed to create tournament. Please try again.');
        }
    }

    async addSquad(message, args) {
        try {
            if (!this.isAdmin(message.member)) {
                return message.channel.send('❌ You need administrator permissions to add squads!');
            }

            const tournamentName = args.join(' ');
            if (!tournamentName) {
                return message.channel.send('❌ Please provide a tournament name!\nUsage: `ry.add squad <tournament>`');
            }

            const tournament = await this.client.tournaments.getTournament(message.guild.id, tournamentName);
            if (!tournament) {
                return message.channel.send(`❌ Tournament "${tournamentName}" not found in this server!`);
            }

            // Create modal for squad input
            const modal = new ModalBuilder()
            .setCustomId(`squad_modal_${tournamentName.toLowerCase()}`)
            .setTitle(`Add Squad - ${tournamentName}`);

        const squadInput = new TextInputBuilder()
            .setCustomId('squad_input')
            .setLabel('Player IDs (one per line)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('727272727222\n828282828288\n...')
            .setRequired(true);

        const actionRow = new ActionRowBuilder().addComponents(squadInput);
        modal.addComponents(actionRow);

        // Send a message with instructions since we can't show modal from message
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📝 Add Squad')
            .setDescription(`Reply to this message with player IDs, one per line.\n\nExample:\n\`\`\`\n727272727222\n828282828288\n929292929299\n\`\`\``)
            .setFooter({ text: 'Send your reply within 60 seconds' });

            const reply = await message.channel.send({ embeds: [embed] });

            // Wait for user response
            const filter = m => m.author.id === message.author.id;
            const collected = await message.channel.awaitMessages({ 
                filter, 
                max: 1, 
                time: 60000, 
                errors: ['time'] 
            }).catch(() => null);

            if (!collected) {
                return message.channel.send('❌ Time expired! Please try the command again.');
            }

            const response = collected.first();
            const playerIds = response.content.split('\n')
                .map(id => id.trim())
                .filter(id => id.length > 0);

            if (playerIds.length === 0) {
                return message.channel.send('❌ No valid player IDs provided!');
            }

            const result = await this.client.tournaments.addSquad(message.guild.id, tournamentName, playerIds);

            const resultEmbed = new EmbedBuilder()
                .setColor(result.success ? '#00ff00' : '#ff0000')
                .setTitle(result.success ? '✅ Squad Added' : '❌ Error')
                .setDescription(result.message || 'An error occurred')
                .setTimestamp();

            await message.channel.send({ embeds: [resultEmbed] });
        } catch (error) {
            console.error('Error in addSquad:', error);
            await message.channel.send('❌ Failed to add squad. Please try again.');
        }
    }

    async announceMatch(message, args) {
        try {
            if (!this.isAdmin(message.member)) {
                return message.channel.send('❌ You need administrator permissions to announce matches!');
            }

            if (args.length < 3) {
                return message.channel.send('❌ Invalid format!\nUsage: `ry.match <tournament> <time> <channel_link>`\nExample: `ry.match ipl 9pm https://discord.gg/xyz`');
            }

            const tournamentName = args[0];
            const time = args[1];
            const channelLink = args[2];

            const tournament = await this.client.tournaments.getTournament(message.guild.id, tournamentName);
            if (!tournament) {
                return message.channel.send(`❌ Tournament "${tournamentName}" not found in this server!`);
            }

            if (!tournament.squads || tournament.squads.length === 0) {
                return message.channel.send(`❌ No squad added to "${tournamentName}" yet!`);
            }

            const match = await this.client.schedules.scheduleMatch(
                message.guild.id,
                tournamentName,
                time,
                channelLink,
                tournament.squads
            );

            if (!match) {
                return message.channel.send('❌ Failed to schedule match. Please try again.');
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Match Announced')
                .setDescription(`Match scheduled for **${tournamentName}**`)
                .addFields(
                    { name: 'Time', value: `${time} IST`, inline: true },
                    { name: 'Players Notified', value: `${tournament.squads.length}`, inline: true },
                    { name: 'Channel', value: channelLink }
                )
                .setFooter({ text: 'Players will receive DMs now and at match time' })
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in announceMatch:', error);
            await message.channel.send('❌ Failed to announce match. Please try again.');
        }
    }

    async listTournaments(message) {
        try {
            const tournaments = await this.client.tournaments.getAllTournaments(message.guild.id);
            const tournamentList = Object.values(tournaments);

            if (tournamentList.length === 0) {
                return message.channel.send('📋 No tournaments created yet in this server!');
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🏆 Active Tournaments')
                .setDescription(tournamentList.map((t, i) =>
                    `**${i + 1}.** ${t.name}\n   └ Squad: ${t.squads?.length || 0} players`
                ).join('\n\n'))
                .setFooter({ text: `Server: ${message.guild.name}` })
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in listTournaments:', error);
            await message.channel.send('❌ Failed to list tournaments. Please try again.');
        }
    }

    async deleteTournament(message, args) {
        try {
            if (!this.isAdmin(message.member)) {
                return message.channel.send('❌ You need administrator permissions to delete tournaments!');
            }

            const tournamentName = args.join(' ');
            if (!tournamentName) {
                return message.channel.send('❌ Please provide a tournament name!\nUsage: `ry.delete tournament <name>`');
            }

            const result = await this.client.tournaments.deleteTournament(message.guild.id, tournamentName);

            const embed = new EmbedBuilder()
                .setColor(result.success ? '#00ff00' : '#ff0000')
                .setTitle(result.success ? '✅ Tournament Deleted' : '❌ Error')
                .setDescription(result.message || 'An error occurred')
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in deleteTournament:', error);
            await message.channel.send('❌ Failed to delete tournament. Please try again.');
        }
    }

    async showSquad(message, args) {
        try {
            const tournamentName = args.join(' ');
            if (!tournamentName) {
                return message.channel.send('❌ Please provide a tournament name!\nUsage: `ry.squad <tournament>`');
            }

            const tournament = await this.client.tournaments.getTournament(message.guild.id, tournamentName);
            if (!tournament) {
                return message.channel.send(`❌ Tournament "${tournamentName}" not found in this server!`);
            }

            if (!tournament.squads || tournament.squads.length === 0) {
                return message.channel.send(`❌ No squad added to "${tournamentName}" yet!`);
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`👥 Squad for ${tournament.name}`)
                .setDescription('Fetching player names...')
                .setFooter({ text: `Server: ${message.guild.name}` })
                .setTimestamp();

            const reply = await message.channel.send({ embeds: [embed] });

            // Fetch player names
            const playerNames = [];
            for (const playerId of tournament.squads) {
                try {
                    const user = await this.client.users.fetch(playerId);
                    playerNames.push(`• ${user.username}`);
                } catch (error) {
                    playerNames.push(`• Unknown User (${playerId})`);
                }
            }

            const updatedEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(`👥 Squad for ${tournament.name}`)
                .setDescription(playerNames.join('\n') || 'No players found')
                .setFooter({ text: `Total Players: ${tournament.squads.length}` })
                .setTimestamp();

            await reply.edit({ embeds: [updatedEmbed] });
        } catch (error) {
            console.error('Error in showSquad:', error);
            await message.channel.send('❌ Failed to show squad. Please try again.');
        }
    }

    async pingTournament(message, args) {
        try {
            if (!this.isAdmin(message.member)) {
                return message.channel.send('❌ You need administrator permissions to ping tournaments!');
            }

            const tournamentName = args.join(' ');
            if (!tournamentName) {
                return message.channel.send('❌ Please provide a tournament name!\nUsage: `ry.ping <tournament>`');
            }

            const tournament = await this.client.tournaments.getTournament(message.guild.id, tournamentName);
            if (!tournament) {
                return message.channel.send(`❌ Tournament "${tournamentName}" not found in this server!`);
            }

            if (!tournament.squads || tournament.squads.length === 0) {
                return message.channel.send(`❌ No squad added to "${tournamentName}" yet!`);
            }

            // Get the most recent match for this tournament
            const recentMatch = await this.client.schedules.getRecentMatch(message.guild.id, tournamentName);
            if (!recentMatch) {
                return message.channel.send(`❌ No matches scheduled for "${tournamentName}" yet!`);
            }

            // Send DMs to all players
            const pingMessage = `🔔 **Match Reminder!**\n\n` +
                `Tournament: **${tournamentName}**\n` +
                `Time: **${recentMatch.time} IST**\n` +
                `Channel: ${recentMatch.channelLink}\n\n` +
                `Get ready to join!`;

            let successCount = 0;
            for (const playerId of tournament.squads) {
                try {
                    const user = await this.client.users.fetch(playerId);
                    await user.send(pingMessage);
                    successCount++;
                } catch (error) {
                    console.error(`Failed to send DM to ${playerId}:`, error.message);
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Tournament Pinged')
                .setDescription(`Sent match reminder to **${successCount}/${tournament.squads.length}** players`)
                .addFields(
                    { name: 'Tournament', value: tournamentName, inline: true },
                    { name: 'Time', value: `${recentMatch.time} IST`, inline: true },
                    { name: 'Channel', value: recentMatch.channelLink }
                )
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in pingTournament:', error);
            await message.channel.send('❌ Failed to ping tournament. Please try again.');
        }
    }

    async showHelp(message, specificCommand = null) {
        try {
            if (specificCommand) {
                return this.showSpecificHelp(message, specificCommand);
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🤖 RayNode Bot - Commands')
                .setDescription('Tournament management bot for Discord')
                .addFields(
                    {
                        name: '📝 Create Tournament',
                        value: '`ry.create tournament <name>`\n`ry.create tm <name>`\n`ry.ctm <name>`\n`/create tournament <name>`'
                    },
                    {
                        name: '👥 Add Squad',
                        value: '`ry.add squad <tournament>`\nThen reply with player IDs (one per line)'
                    },
                    {
                        name: '📢 Announce Match',
                        value: '`ry.match <tournament> <time> <channel_link>`\nExample: `ry.match ipl 9pm https://discord.gg/xyz`'
                    },
                    {
                        name: '📋 List Tournaments',
                        value: '`ry.tournaments` or `ry.list`'
                    },
                    {
                        name: '👀 View Squad',
                        value: '`ry.squad <tournament>`\nShows all players in the tournament'
                    },
                    {
                        name: '🔔 Ping Tournament',
                        value: '`ry.ping <tournament>`\nSends recent match info to all players'
                    },
                    {
                        name: '🗑️ Delete Tournament',
                        value: '`ry.delete tournament <name>`\n`ry.deltm <name>`'
                    },
                    {
                        name: '❓ Help',
                        value: '`ry.help` or `ry.help <command>`'
                    }
                )
                .setFooter({ text: 'Admin permissions required for most commands' })
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in showHelp:', error);
            await message.channel.send('❌ Failed to show help. Please try again.');
        }
    }

    async showSpecificHelp(message, command) {
        const helpData = {
            'create': {
                title: '📝 Create Tournament',
                description: 'Creates a new tournament',
                usage: '`ry.create tournament <name>`\n`ry.create tm <name>`\n`ry.ctm <name>`',
                example: '`ry.create tournament IPL 2024`',
                admin: true
            },
            'add': {
                title: '👥 Add Squad',
                description: 'Adds players to a tournament squad',
                usage: '`ry.add squad <tournament>`',
                example: '`ry.add squad IPL`\nThen reply with player IDs (one per line)',
                admin: true
            },
            'match': {
                title: '📢 Announce Match',
                description: 'Schedules a match and notifies players',
                usage: '`ry.match <tournament> <time> <channel_link>`',
                example: '`ry.match ipl 9pm https://discord.gg/xyz`',
                admin: true
            },
            'squad': {
                title: '👀 View Squad',
                description: 'Shows all players in a tournament',
                usage: '`ry.squad <tournament>`',
                example: '`ry.squad IPL`',
                admin: false
            },
            'ping': {
                title: '🔔 Ping Tournament',
                description: 'Sends the most recent match info to all players',
                usage: '`ry.ping <tournament>`',
                example: '`ry.ping IPL`',
                admin: true
            },
            'list': {
                title: '📋 List Tournaments',
                description: 'Shows all active tournaments',
                usage: '`ry.list` or `ry.tournaments`',
                example: '`ry.list`',
                admin: false
            }
        };

        const help = helpData[command.toLowerCase()];
        if (!help) {
            return message.reply(`❌ No help available for "${command}". Type \`ry.help\` for all commands.`);
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(help.title)
            .setDescription(help.description)
            .addFields(
                { name: 'Usage', value: help.usage },
                { name: 'Example', value: help.example }
            )
            .setFooter({ text: help.admin ? 'Admin permissions required' : 'Available to all users' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }

    async handleInteraction(interaction) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId.startsWith('squad_modal_')) {
            const tournamentName = interaction.customId.replace('squad_modal_', '');
            const squadInput = interaction.fields.getTextInputValue('squad_input');

            const playerIds = squadInput.split('\n')
                .map(id => id.trim())
                .filter(id => id.length > 0);

            const result = await this.client.tournaments.addSquad(interaction.guild.id, tournamentName, playerIds);

            await interaction.reply({
                content: result.success ?
                    `✅ ${result.message}` :
                    `❌ ${result.message}`,
                ephemeral: true
            });
        }
    }
}

module.exports = CommandHandler;
