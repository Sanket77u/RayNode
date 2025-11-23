const { Client, GatewayIntentBits, Collection, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const config = require('./config');
const TournamentManager = require('./managers/TournamentManager');
const ScheduleManager = require('./managers/ScheduleManager');
const CommandHandler = require('./handlers/CommandHandler');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

client.tournaments = new TournamentManager();
client.schedules = new ScheduleManager(client);
client.commands = new Collection();

const commandHandler = new CommandHandler(client);

client.once('ready', () => {
    console.log(`✅ RayNode Bot is online as ${client.user.tag}`);
    client.schedules.startScheduler();
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    await commandHandler.handleMessage(message);
});

client.on('interactionCreate', async (interaction) => {
    await commandHandler.handleInteraction(interaction);
});

client.login(config.token);
