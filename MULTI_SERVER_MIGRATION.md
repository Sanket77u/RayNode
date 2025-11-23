# Multi-Server Migration Guide

## 🎉 What's New

Your bot now supports:
- ✅ **Multiple Servers** - Works in unlimited Discord servers simultaneously
- ✅ **Server-Specific Data** - Each server has its own tournaments
- ✅ **Dynamic Admin Permissions** - Anyone with Administrator permission can manage tournaments
- ✅ **No Role ID Required** - Removed ADMIN_ROLE_ID requirement

## 📊 Database Changes

### New Schema (v2)

Added `servers` table to track Discord servers:
```sql
servers (guild_id, guild_name)
tournaments (server_id, name) -- Now linked to servers
```

### Migration Steps

#### Step 1: Backup Current Data (Optional)

If you have existing data, you can export it from Supabase Table Editor before updating.

#### Step 2: Update Database Schema

1. Go to Supabase Dashboard → SQL Editor
2. Copy content from `supabase-schema-v2.sql`
3. Paste and click **Run**

This will:
- Create the new `servers` table
- Update `tournaments` table with `server_id` column
- Add proper indexes and relationships

#### Step 3: Update Environment Variables

Edit your `.env` file and **remove** the `ADMIN_ROLE_ID` line:

**Before:**
```env
DISCORD_TOKEN=your_token
CLIENT_ID=your_client_id
ADMIN_ROLE_ID=1028681576726397059  ← Remove this line

SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

**After:**
```env
DISCORD_TOKEN=your_token
CLIENT_ID=your_client_id

SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

#### Step 4: Restart Bot

```bash
npm start
```

## 🔑 New Permission System

### Before (Single Role)
- Only users with specific role ID could manage tournaments
- Had to configure ADMIN_ROLE_ID for each server

### After (Dynamic)
- **Anyone with Administrator permission** can manage tournaments
- Works automatically in every server
- No configuration needed

### Who Can Use Admin Commands?

✅ Server owners
✅ Users with Administrator permission
✅ Users with roles that have Administrator permission

❌ Regular members
❌ Moderators without Administrator permission

## 🌐 Multi-Server Features

### Server Isolation

Each server has completely separate data:
- Server A's tournaments don't appear in Server B
- Player squads are server-specific
- Match schedules are independent per server

### Example Scenario

**Server 1: "Gaming Clan"**
```
ry.create tournament ClanWar
ry.list
→ Shows: ClanWar
```

**Server 2: "Esports Team"**
```
ry.create tournament Championship
ry.list
→ Shows: Championship (ClanWar not visible)
```

### Automatic Server Registration

When you use any command, the bot automatically:
1. Registers the server in database (if new)
2. Links all data to that server
3. Keeps everything isolated

## 📝 Updated Commands

All commands now work per-server:

```
ry.create tournament MyTournament
→ Creates tournament in current server only

ry.list
→ Shows tournaments from current server only

ry.squad MyTournament
→ Shows squad from current server's tournament
```

## 🔄 Data Migration

### If You Have Existing Data

Your old tournaments (without server_id) won't be accessible. To migrate:

1. **Export old data** from Supabase Table Editor
2. **Run new schema** from `supabase-schema-v2.sql`
3. **Recreate tournaments** using bot commands

Or manually update in Supabase SQL Editor:
```sql
-- Get your server's ID first
INSERT INTO servers (guild_id, guild_name) 
VALUES ('your_guild_id', 'Your Server Name');

-- Update existing tournaments
UPDATE tournaments 
SET server_id = (SELECT id FROM servers WHERE guild_id = 'your_guild_id')
WHERE server_id IS NULL;
```

## ✅ Testing Multi-Server

### Test in Multiple Servers

1. **Invite bot to 2+ servers**
2. **In Server 1:**
   ```
   ry.create tournament Test1
   ry.list
   ```
3. **In Server 2:**
   ```
   ry.create tournament Test2
   ry.list
   ```
4. **Verify:** Each server only sees its own tournament

### Test Permissions

1. **As Administrator:**
   ```
   ry.create tournament AdminTest
   → Should work ✅
   ```

2. **As Regular Member:**
   ```
   ry.create tournament MemberTest
   → Should show permission error ❌
   ```

## 🎯 Benefits

### For Bot Owners
- ✅ One bot instance serves unlimited servers
- ✅ No per-server configuration needed
- ✅ Automatic server management

### For Server Admins
- ✅ No role setup required
- ✅ Works with existing Administrator permission
- ✅ Complete data isolation from other servers

### For Users
- ✅ Same commands work everywhere
- ✅ No confusion between servers
- ✅ Consistent experience

## 🆘 Troubleshooting

### "Tournament not found in this server"

This is normal! Tournaments are server-specific. Create a new one:
```
ry.create tournament YourTournament
```

### "You need administrator permissions"

Make sure you have:
- Server ownership, OR
- Administrator permission, OR
- A role with Administrator permission

### Bot works in one server but not another

Each server needs to:
1. Have the bot invited
2. Give bot proper permissions
3. Create its own tournaments

### Old tournaments disappeared

After migration, old data without server_id won't show. Either:
- Recreate tournaments using commands
- Manually migrate data in Supabase (see above)

## 📚 Updated Documentation

- **README.md** - Updated with multi-server info
- **supabase-schema-v2.sql** - New database schema
- **ENV_VARIABLES.md** - Removed ADMIN_ROLE_ID

## 🚀 Ready to Go!

Your bot is now multi-server ready! Just:

1. ✅ Run new SQL schema
2. ✅ Remove ADMIN_ROLE_ID from .env
3. ✅ Restart bot
4. ✅ Invite to multiple servers

Each server will have its own isolated tournament system! 🎉
