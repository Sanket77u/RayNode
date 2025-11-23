# RayNode Discord Bot

A Discord bot for managing tournaments with squad management and automated match notifications.

## Features

- ✅ Create and manage tournaments
- ✅ Add player squads to tournaments
- ✅ Schedule matches with automatic DM notifications
- ✅ Instant notifications + reminder at match time (IST)
- ✅ Multiple command formats support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
ADMIN_ROLE_ID=your_admin_role_id_here
```

3. Enable required bot intents in Discord Developer Portal:
   - Go to https://discord.com/developers/applications
   - Select your bot
   - Go to "Bot" section
   - Enable: `MESSAGE CONTENT INTENT`, `SERVER MEMBERS INTENT`

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

### Other Commands
- `ry.tournaments` - List all tournaments
- `ry.list` - List all tournaments
- `ry.delete tournament <name>` - Delete a tournament
- `ry.deltm <name>` - Delete a tournament
- `ry.help` - Show help message

## How It Works

1. **Create Tournament**: Admin creates a tournament with a name
2. **Add Squad**: Admin adds player Discord IDs to the tournament
3. **Announce Match**: Admin schedules a match with time and channel link
4. **Notifications**: 
   - Players receive immediate DM with match details
   - Players receive reminder DM at exact match time (IST timezone)

## Permissions

Most commands require Administrator permissions or a specific admin role (set via ADMIN_ROLE_ID in .env).

## Data Storage

Tournament data is stored in `tournaments.json` file automatically.
