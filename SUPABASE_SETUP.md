# Supabase Setup Guide for RayNode Bot

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: RayNode Bot
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

## Step 2: Get Your Credentials

1. In your Supabase project dashboard, click on **Settings** (gear icon)
2. Go to **API** section
3. Copy these values:
   - **Project URL** → This is your `SUPABASE_URL`
   - **anon public** key → This is your `SUPABASE_KEY`

## Step 3: Create Database Tables

1. In your Supabase dashboard, click on **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire content from `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

## Step 4: Verify Tables Created

1. Click on **Table Editor** (left sidebar)
2. You should see these tables:
   - `tournaments`
   - `players`
   - `tournament_squads`
   - `matches`

## Step 5: Configure Your Bot

1. Open your `.env` file
2. Add your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
```

## Step 6: Install Dependencies

```bash
npm install
```

## Step 7: Start Your Bot

```bash
npm start
```

## Database Structure

### Tables Overview:

**tournaments**
- Stores tournament information
- Fields: id, name, name_lower, created_at, updated_at

**players**
- Stores player Discord IDs and usernames
- Fields: id, discord_id, discord_username, created_at, updated_at

**tournament_squads**
- Junction table linking tournaments and players
- Fields: id, tournament_id, player_id, added_at

**matches**
- Stores scheduled matches
- Fields: id, tournament_id, match_time, channel_link, scheduled_at, notified, reminder_sent, created_at

## Features:

✅ **Automatic Data Persistence**: All tournament, player, and match data is saved to Supabase
✅ **Player Username Caching**: Discord usernames are cached in the database
✅ **Match History**: All matches are stored with timestamps
✅ **Relationship Management**: Proper foreign keys and cascading deletes
✅ **Performance Optimized**: Indexes on frequently queried columns

## Troubleshooting

### Error: "Invalid API key"
- Double-check your `SUPABASE_KEY` in `.env`
- Make sure you're using the **anon** key, not the service_role key

### Error: "relation does not exist"
- Run the SQL schema again in Supabase SQL Editor
- Make sure all tables were created successfully

### Error: "Failed to create tournament"
- Check Supabase dashboard → Logs for detailed error
- Verify your database connection

## Viewing Your Data

1. Go to **Table Editor** in Supabase dashboard
2. Click on any table to view its data
3. You can manually edit, add, or delete records here

## Security Notes

- The `anon` key is safe to use in your bot
- Row Level Security (RLS) is enabled but policies allow all operations
- Never share your database password or service_role key
- Keep your `.env` file private (it's in `.gitignore`)

## Migration from JSON

If you were using the old `tournaments.json` file:
1. The bot will now use Supabase automatically
2. Old data in `tournaments.json` won't be migrated automatically
3. You can delete `tournaments.json` after confirming Supabase works
