# Quick Start Guide - RayNode Bot

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (1 min)

```bash
npm install
```

This installs:
- `discord.js` - Discord bot framework
- `@supabase/supabase-js` - Supabase database client
- `node-cron` - Task scheduler for match reminders
- `dotenv` - Environment variable loader

### Step 2: Setup Supabase Database (2 min)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose any name and region)
3. Wait for project to initialize (~2 minutes)
4. Go to **SQL Editor** → **New Query**
5. Copy all content from `supabase-schema.sql` and paste it
6. Click **Run** to create all tables

### Step 3: Get Your Credentials (1 min)

**Discord:**
- Go to [Discord Developer Portal](https://discord.com/developers/applications)
- Select your bot → **Bot** section → Copy Token
- Go to **OAuth2** → Copy Client ID

**Supabase:**
- In your Supabase project → **Settings** → **API**
- Copy **Project URL** and **anon public** key

### Step 4: Configure .env File (30 sec)

Edit the `.env` file and add your credentials:

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
ADMIN_ROLE_ID=your_admin_role_id

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key
```

### Step 5: Start the Bot (10 sec)

```bash
npm start
```

You should see:
```
✅ RayNode Bot is online as YourBotName#1234
✅ TournamentManager initialized with Supabase
✅ Loaded 0 scheduled matches from database
✅ Match scheduler started
```

## 🎮 Test Your Bot

Try these commands in Discord:

```
ry.help
ry.create tournament TestTournament
ry.list
```

## 📚 Full Documentation

- **SUPABASE_SETUP.md** - Detailed Supabase setup guide
- **ENV_VARIABLES.md** - All environment variables explained
- **README.md** - Complete bot documentation

## ⚠️ Common Issues

**Bot not responding?**
- Enable MESSAGE CONTENT INTENT in Discord Developer Portal
- Make sure bot is invited to your server with proper permissions

**Database errors?**
- Verify Supabase credentials in `.env`
- Check if SQL schema was executed successfully

**Permission errors?**
- Set `ADMIN_ROLE_ID` or give yourself Administrator permission

## 🎯 What's Next?

1. Invite bot to your Discord server
2. Create your first tournament: `ry.create tournament MyTournament`
3. Add players: `ry.add squad MyTournament`
4. Schedule a match: `ry.match MyTournament 9pm https://discord.gg/xyz`

That's it! Your bot is ready to manage tournaments! 🎉
