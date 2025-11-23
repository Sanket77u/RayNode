# RayNode Discord Bot

A Discord bot for managing tournaments with squad management and automated match notifications.

## Features

- ✅ Create and manage tournaments
- ✅ Add player squads to tournaments
- ✅ Schedule matches with automatic DM notifications
- ✅ Instant notifications + reminder at match time (IST)
- ✅ Multiple command formats support
- ✅ View squad members with Discord usernames
- ✅ Ping tournaments to send instant match reminders
- ✅ Smart command suggestions for typos
- ✅ **Multi-server support** - Works in unlimited servers simultaneously
- ✅ **Server-specific data** - Each server has isolated tournaments
- ✅ **Dynamic permissions** - Uses Discord's Administrator permission

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase (see `SUPABASE_SETUP.md` for detailed guide):
   - Create a Supabase project
   - Run the SQL schema from `supabase-schema.sql`
   - Get your project URL and anon key

3. Create a `.env` file:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here

SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

4. Enable required bot intents in Discord Developer Portal:
   - Go to https://discord.com/developers/applications
   - Select your bot
   - Go to "Bot" section
   - Enable: `MESSAGE CONTENT INTENT`, `SERVER MEMBERS INTENT`

5. Start the bot:
```bash
npm start
```

4. Start the bot:
```bash
npm start
```

## Commands

### Create Tournament
- `ry.create tournament <name>`
- `ry.create tm <name>`
- `ry.ctm <name>`
- `/create tournament <name>`

### Add Squad
- `ry.add squad <tournament>`
- Bot will ask you to reply with player IDs (one per line)

Example:
```
727272727222
828282828288
929292929299
```

### Announce Match
- `ry.match <tournament> <time> <channel_link>`

Example:
```
ry.match ipl 9pm https://discord.gg/xyz
```

Time formats supported:
- `9pm`, `10am`
- `9:30pm`, `10:45am`
- `21:00`, `09:30`

### View Squad
- `ry.squad <tournament>`
- Shows all players (Discord usernames) in the tournament

Example:
```
ry.squad ipl
```

### Ping Tournament
- `ry.ping <tournament>`
- Instantly sends the most recent match info to all players in that tournament

Example:
```
ry.ping ipl
```

### Other Commands
- `ry.tournaments` - List all tournaments
- `ry.list` - List all tournaments
- `ry.delete tournament <name>` - Delete a tournament
- `ry.deltm <name>` - Delete a tournament
- `ry.help` - Show help message
- `ry.help <command>` - Show help for specific command

## How It Works

1. **Create Tournament**: Admin creates a tournament with a name
2. **Add Squad**: Admin adds player Discord IDs to the tournament
3. **Announce Match**: Admin schedules a match with time and channel link
4. **Notifications**: 
   - Players receive immediate DM with match details
   - Players receive reminder DM at exact match time (IST timezone)

## Permissions

Most commands require **Administrator permission** in Discord. This includes:
- Server owners
- Users with Administrator permission
- Users with roles that have Administrator permission

No additional configuration needed - it works automatically!

## Data Storage

All data is stored in Supabase PostgreSQL database:
- **Servers**: Discord server information (auto-registered)
- **Tournaments**: Tournament information (server-specific)
- **Players**: Discord user IDs and cached usernames
- **Tournament Squads**: Player assignments to tournaments
- **Matches**: Scheduled matches with notification status

Each server has completely isolated data - tournaments in Server A don't appear in Server B.

See `SUPABASE_SETUP.md` for database setup instructions.
