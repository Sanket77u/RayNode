# Troubleshooting Guide

## Quick Test

Before starting the bot, test your database connection:

```bash
npm run test-db
```

This will verify:
- ✅ Environment variables are set
- ✅ Supabase connection works
- ✅ All database tables exist

## Common Errors

### 1. "Invalid API key" or "Failed to fetch"

**Problem**: Supabase credentials are incorrect or missing

**Solution**:
1. Check your `.env` file has both:
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
2. Verify credentials in Supabase Dashboard → Settings → API
3. Make sure you're using the **anon** key, not service_role

### 2. "relation does not exist" or "table not found"

**Problem**: Database tables haven't been created

**Solution**:
1. Go to Supabase Dashboard → SQL Editor
2. Copy entire content from `supabase-schema.sql`
3. Paste and click **Run**
4. Verify tables exist in Table Editor

### 3. "Expected a string primitive" or "undefined" errors

**Problem**: Async functions not being awaited

**Solution**: This has been fixed in the latest code. Make sure you have the updated files.

### 4. Bot not responding to commands

**Problem**: Missing Discord intents

**Solution**:
1. Go to Discord Developer Portal
2. Select your bot → Bot section
3. Enable these intents:
   - ✅ MESSAGE CONTENT INTENT
   - ✅ SERVER MEMBERS INTENT
4. Save changes and restart bot

### 5. "Cannot send messages to this user" when DMing

**Problem**: User has DMs disabled or bot is blocked

**Solution**: This is normal. The bot will log the error but continue working for other users.

### 6. Node.js version warning

**Problem**: Using Node.js 18 or below

**Solution**: 
- Upgrade to Node.js 20 or later
- Download from: https://nodejs.org/
- The bot will still work but you'll see a deprecation warning

## Testing Your Setup

### Step 1: Test Database Connection
```bash
npm run test-db
```

Expected output:
```
✅ Tournaments table accessible
✅ Players table accessible
✅ Tournament_squads table accessible
✅ Matches table accessible
🎉 All database tables are working correctly!
```

### Step 2: Start the Bot
```bash
npm start
```

Expected output:
```
✅ Supabase connected successfully
✅ TournamentManager initialized with Supabase
✅ Loaded 0 scheduled matches from database
✅ RayNode Bot is online as YourBot#1234
✅ Match scheduler started
```

### Step 3: Test Commands in Discord

Try these commands in order:

1. **Test help command**:
   ```
   ry.help
   ```
   Should show all commands

2. **Create a test tournament**:
   ```
   ry.create tournament TestTournament
   ```
   Should show success message

3. **List tournaments**:
   ```
   ry.list
   ```
   Should show your test tournament

4. **Add squad** (use your Discord ID):
   ```
   ry.add squad TestTournament
   ```
   Then reply with your Discord ID

5. **View squad**:
   ```
   ry.squad TestTournament
   ```
   Should show your username

## Verify Database

Check if data is being saved:

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Check these tables:
   - `tournaments` - Should have your test tournament
   - `players` - Should have your Discord ID
   - `tournament_squads` - Should link tournament to player

## Still Having Issues?

### Check Logs

Look for error messages in:
- Bot console output
- Supabase Dashboard → Logs

### Common Issues

**Bot crashes on command**:
- Check if all async functions are awaited
- Verify database schema is correct

**Commands work but no data saved**:
- Check Supabase credentials
- Verify RLS policies allow operations

**Match reminders not sending**:
- Check if matches are in database
- Verify time format is correct (9pm, 21:00, etc.)

## Getting Help

If you're still stuck:

1. Run `npm run test-db` and share the output
2. Check bot console for error messages
3. Verify all steps in `SUPABASE_SETUP.md` were completed
4. Make sure `.env` file has all required variables

## Reset Everything

If you want to start fresh:

1. **Delete all data** (in Supabase SQL Editor):
   ```sql
   TRUNCATE tournaments, players, tournament_squads, matches CASCADE;
   ```

2. **Recreate tables** (if needed):
   - Run `supabase-schema.sql` again

3. **Restart bot**:
   ```bash
   npm start
   ```
