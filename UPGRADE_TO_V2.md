# Quick Upgrade to v2 (Multi-Server)

## ⚡ 3-Step Upgrade

### Step 1: Update Database (2 minutes)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** → **New Query**
4. Copy entire content from `supabase-schema-v2.sql`
5. Paste and click **Run**

✅ You should see: "Success. No rows returned"

### Step 2: Update .env File (30 seconds)

Open your `.env` file and **delete** this line:
```env
ADMIN_ROLE_ID=1028681576726397059  ← Remove this entire line
```

Your `.env` should now look like:
```env
DISCORD_TOKEN=your_token
CLIENT_ID=your_client_id

SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

### Step 3: Restart Bot (10 seconds)

```bash
npm start
```

Expected output:
```
✅ Supabase connected successfully
✅ TournamentManager initialized with Supabase (Multi-Server)
✅ Loaded 0 scheduled matches from database
✅ RayNode Bot is online as RayNode#9752
✅ Match scheduler started
```

## ✅ That's It!

Your bot now supports multiple servers!

## 🧪 Test It

### Test 1: Create Tournament
```
ry.create tournament TestTournament
```
Should work if you have Administrator permission ✅

### Test 2: List Tournaments
```
ry.list
```
Should show your tournament ✅

### Test 3: Multi-Server (if you have 2+ servers)

**In Server 1:**
```
ry.create tournament Server1Tournament
ry.list
```

**In Server 2:**
```
ry.create tournament Server2Tournament
ry.list
```

Each server should only see its own tournament! ✅

## 🎯 What Changed?

### ✅ Added
- Multi-server support
- Automatic server registration
- Dynamic admin permissions (uses Discord's Administrator)

### ❌ Removed
- ADMIN_ROLE_ID requirement
- Single-server limitation

### 🔄 Changed
- Database schema (added servers table)
- Permission system (now uses Administrator permission)
- All commands now server-specific

## 📝 Notes

### Old Tournaments

If you had tournaments before v2, they won't show up automatically. You need to:

**Option 1: Recreate them** (Recommended)
```
ry.create tournament OldTournamentName
ry.add squad OldTournamentName
```

**Option 2: Manual migration** (Advanced)

In Supabase SQL Editor:
```sql
-- First, register your server
INSERT INTO servers (guild_id, guild_name) 
VALUES ('your_discord_server_id', 'Your Server Name')
ON CONFLICT (guild_id) DO NOTHING;

-- Then link old tournaments
UPDATE tournaments 
SET server_id = (SELECT id FROM servers WHERE guild_id = 'your_discord_server_id')
WHERE server_id IS NULL;
```

### Permissions

Anyone with **Administrator permission** in Discord can now manage tournaments. This includes:
- Server owners
- Users with Administrator permission
- Roles with Administrator permission

No role configuration needed!

## 🆘 Troubleshooting

### "Tournament not found in this server"

This is normal after upgrade. Create a new tournament:
```
ry.create tournament MyTournament
```

### "You need administrator permissions"

Make sure you have Administrator permission in Discord:
1. Right-click your name
2. Check if you have a role with Administrator
3. Or ask server owner to give you Administrator

### Bot not responding

1. Check bot is online
2. Verify bot has permissions in channel
3. Make sure MESSAGE CONTENT INTENT is enabled in Discord Developer Portal

### Database errors

1. Verify you ran `supabase-schema-v2.sql`
2. Check Supabase credentials in `.env`
3. Run `npm run test-db` to verify connection

## 📚 More Info

- **WHATS_NEW_V2.md** - Complete list of changes
- **MULTI_SERVER_MIGRATION.md** - Detailed migration guide
- **README.md** - Updated documentation

## 🎉 Enjoy Multi-Server Support!

Your bot can now work in unlimited servers with zero configuration per server!
