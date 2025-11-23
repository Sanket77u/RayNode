const config = require('../config');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

class CommandHandler {
    constructor(client) {
        this.client = client;
    }

    isAdmin(member) {
        if (!member) return false;
        return member.permissions.has('Administrator') || 
               (config.adminRoleId && member.roles.cache.has(config.adminRoleId));
    }

    async handleMessage(message) {
        const content = message.content.trim();
        
        // Check for prefix commands
        if (content.startsWith(config.prefix)) {
            await this.handlePrefixCommand(message);
        }
        
        // Check for slash-like commands
        if (content.startsWith('/')) {
            await this.handleSlashCommand(message);
        }
    }

    async handlePrefixCommand(message) {
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // Create tournament commands
        if (['create', 'ctm'].includes(command)) {
            const subCommand = args[0]?.toLowerCase();
            if (subCommand === 'tournament' || subCommand === 'tm') {
                args.shift(); // Remove 'tournament' or 'tm'
                await this.createTournament(message, args);
            }
        }

        // Add squad command
        if (command === 'add') {
            const subCommand = args[0]?.toLowerCase();
            if (subCommand === 'squad') {
                args.shift();
                await this.addSquad(message, args);
            }
        }

        // Match announcement command
        if (command === 'match') {
            await this.announceMatch(message, args);
        }

        // List tournaments
        if (command === 'tournaments' || command === 'list') {
            await this.listTournaments(message);
        }

        // Delete tournament
        if (command === 'delete' || command === 'deltm') {
            const subCommand = args[0]?.toLowerCase();
            if (subCommand === 'tournament' || subCommand === 'tm') {
                args.shift();
                await this.deleteTournament(message, args);
            }
        }

        // Help command
        if (command === 'help') {
            await this.showHelp(message);
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
        if (!this.isAdmin(message.member)) {
            return message.reply('❌ You need administrator permissions to create tournaments!');
        }

        const tournamentName = args.join(' ');
        if (!tournamentName) {
            return message.reply('❌ Please provide a tournament name!\nUsage: `ry.create tournament <name>`');
        }

        const result = this.client.tournaments.createTournament(tournamentName);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle(result.success ? '✅ Tournament Created' : '❌ Error')
            .setDescription(result.message)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }

    async addSquad(message, args) {
        if (!this.isAdmin(message.member)) {
            return message.reply('❌ You need administrator permissions to add squads!');
        }

        const tournamentName = args.join(' ');
        if (!tournamentName) {
            return message.reply('❌ Please provide a tournament name!\nUsage: `ry.add squad <tournament>`');
        }

        const tournament = this.client.tournaments.getTournament(tournamentName);
        if (!tournament) {
            return message.reply(`❌ Tournament "${tournamentName}" not found!`);
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

        const reply = await message.reply({ embeds: [embed] });

        // Wait for user response
        const filter = m => m.author.id === message.author.id;
        try {
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
            const response = collected.first();
            
            const playerIds = response.content.split('\n')
                .map(id => id.trim())
                .filter(id => id.length > 0);

            if (playerIds.length === 0) {
                return response.reply('❌ No valid player IDs provided!');
            }

            const result = this.client.tournaments.addSquad(tournamentName, playerIds);
            
            const resultEmbed = new EmbedBuilder()
                .setColor(result.success ? '#00ff00' : '#ff0000')
                .setTitle(result.success ? '✅ Squad Added' : '❌ Error')
                .setDescription(result.message)
                .setTimestamp();

            response.reply({ embeds: [resultEmbed] });
        } catch (error) {
            reply.edit({ embeds: [embed.setColor('#ff0000').setDescription('❌ Time expired! Please try again.')] });
        }
    }

    async announceMatch(message, args) {
        if (!this.isAdmin(message.member)) {
            return message.reply('❌ You need administrator permissions to announce matches!');
        }

        if (args.length < 3) {
            return message.reply('❌ Invalid format!\nUsage: `ry.match <tournament> <time> <channel_link>`\nExample: `ry.match ipl 9pm https://discord.gg/xyz`');
        }

        const tournamentName = args[0];
        const time = args[1];
        const channelLink = args[2];

        const tournament = this.client.tournaments.getTournament(tournamentName);
        if (!tournament) {
            return message.reply(`❌ Tournament "${tournamentName}" not found!`);
        }

        if (!tournament.squads || tournament.squads.length === 0) {
            return message.reply(`❌ No squad added to "${tournamentName}" yet!`);
        }

        const match = this.client.schedules.scheduleMatch(
            tournamentName,
            time,
            channelLink,
            tournament.squads
        );

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

        message.reply({ embeds: [embed] });
    }

    async listTournaments(message) {
        const tournaments = this.client.tournaments.getAllTournaments();
        const tournamentList = Object.values(tournaments);

        if (tournamentList.length === 0) {
            return message.reply('📋 No tournaments created yet!');
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🏆 Active Tournaments')
            .setDescription(tournamentList.map((t, i) => 
                `**${i + 1}.** ${t.name}\n   └ Squad: ${t.squads.length} players`
            ).join('\n\n'))
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }

    async deleteTournament(message, args) {
        if (!this.isAdmin(message.member)) {
            return message.reply('❌ You need administrator permissions to delete tournaments!');
        }

        const tournamentName = args.join(' ');
        if (!tournamentName) {
            return message.reply('❌ Please provide a tournament name!\nUsage: `ry.delete tournament <name>`');
        }

        const result = this.client.tournaments.deleteTournament(tournamentName);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle(result.success ? '✅ Tournament Deleted' : '❌ Error')
            .setDescription(result.message)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }

    async showHelp(message) {
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
                    name: '🗑️ Delete Tournament', 
                    value: '`ry.delete tournament <name>`\n`ry.deltm <name>`' 
                },
                { 
                    name: '❓ Help', 
                    value: '`ry.help`' 
                }
            )
            .setFooter({ text: 'Admin permissions required for most commands' })
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

            const result = this.client.tournaments.addSquad(tournamentName, playerIds);
            
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
