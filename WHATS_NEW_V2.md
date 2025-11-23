# What's New in RayNode Bot v2

## 🎉 Major Updates

### 1. Multi-Server Support 🌐

**Before:** Bot could only work properly in one server
**Now:** Works in unlimited servers simultaneously!

Each server gets:
- ✅ Its own tournaments
- ✅ Its own player squads
- ✅ Its own match schedules
- ✅ Complete data isolation

**Example:**
```
Server A: Gaming Clan
- Tournament: ClanWar
- Squad: 10 players

Server B: Esports Team  
- Tournament: Championship
- Squad: 15 players

Both work independently! 🎮
```

### 2. Dynamic Admin Permissions 🔑

**Before:** Required specific ADMIN_ROLE_ID configuration
**Now:** Uses Discord's built-in Administrator permission!

**Who can manage tournaments:**
- ✅ Server owners
- ✅ Anyone with Administrator permission
- ✅ Roles with Administrator permission

**No configuration needed!** Works automatically in every server.

### 3. Automatic Server Registration 📝

When you use any command, the bot automatically:
1. Detects which server you're in
2. Registers the server (if new)
3. Links all data to that server
4. Keeps everything organized

**You don't need to do anything!**

## 🔄 What Changed

### Database Schema

**New Table:**
```sql
servers (
    guild_id,    -- Discord server ID
    guild_name   -- Server name
)
```

**Updated Table:**
```sql
tournaments (
    server_id,   -- Links to servers table
    name,
    ...
)
```

### Configuration

**Removed:**
- `ADMIN_ROLE_ID` from .env file
- Role-based permission checks

**Added:**
- Server-specific data handling
- Automatic server registration
- Guild ID tracking

### Commands

All commands now work per-server:

```bash
# In Server A
ry.create tournament MyTournament
ry.list  # Shows only Server A tournaments

# In Server B  
ry.create tournament AnotherTournament
ry.list  # Shows only Server B tournaments
```

## 📊 Migration Required

### Step 1: Update Database

Run the new schema in Supabase SQL Editor:
```
supabase-schema-v2.sql
```

### Step 2: Update .env

Remove this line:
```env
ADMIN_ROLE_ID=your_admin_role_id_here  ← Delete this
```

### Step 3: Restart Bot

```bash
npm start
```

## ✨ Benefits

### For Bot Owners
- 🚀 Scale to unlimited servers
- 🔧 Zero per-server configuration
- 📊 Centralized data management
- 💰 One bot instance = all servers

### For Server Admins
- ⚡ Instant setup - just invite bot
- 🔐 Uses existing Discord permissions
- 🎯 No role configuration needed
- 🛡️ Data stays in your server

### For Users
- 🎮 Same commands everywhere
- 🔒 Server data stays private
- 📱 Consistent experience
- ⚙️ No learning curve

## 🎯 Use Cases

### Gaming Communities
```
Multiple game servers, each with own tournaments
- Valorant Server: Valorant tournaments
- CS:GO Server: CS:GO tournaments
- Fortnite Server: Fortnite tournaments
```

### Esports Organizations
```
Different teams in different servers
- Team A Server: Team A scrims
- Team B Server: Team B scrims
- Main Server: Official matches
```

### Tournament Organizers
```
Multiple tournament servers
- Beginner Server: Beginner tournaments
- Pro Server: Professional tournaments
- Practice Server: Practice matches
```

## 🔍 Technical Details

### Server Isolation

Data is completely isolated per server:
- Tournaments: Linked to server_id
- Squads: Through tournament → server relationship
- Matches: Through tournament → server relationship

### Permission System

```javascript
// Old way
isAdmin(member) {
    return member.roles.cache.has(ADMIN_ROLE_ID);
}

// New way
isAdmin(member) {
    return member.permissions.has('Administrator');
}
```

### Database Queries

All queries now include server filtering:
```javascript
// Old
getTournament(name)

// New
getTournament(guildId, name)
```

## 📚 Documentation Updates

- ✅ **MULTI_SERVER_MIGRATION.md** - Migration guide
- ✅ **supabase-schema-v2.sql** - New database schema
- ✅ **README.md** - Updated features
- ✅ **ENV_VARIABLES.md** - Removed ADMIN_ROLE_ID

## 🚀 Getting Started

### New Installation

1. Install dependencies: `npm install`
2. Run `supabase-schema-v2.sql` in Supabase
3. Configure `.env` (no ADMIN_ROLE_ID needed)
4. Start bot: `npm start`
5. Invite to servers and use!

### Existing Installation

1. Run `supabase-schema-v2.sql` in Supabase
2. Remove `ADMIN_ROLE_ID` from `.env`
3. Restart bot: `npm start`
4. Old data needs recreation (see migration guide)

## ⚠️ Breaking Changes

### 1. Old Tournaments Won't Show

Tournaments created before v2 don't have server_id and won't appear.

**Solution:** Recreate them using commands or manually migrate data.

### 2. ADMIN_ROLE_ID Removed

The ADMIN_ROLE_ID environment variable is no longer used.

**Solution:** Remove it from .env. Use Discord's Administrator permission instead.

### 3. Database Schema Changed

New columns and tables added.

**Solution:** Run supabase-schema-v2.sql to update schema.

## 🎊 Summary

**v1 → v2 Changes:**
- ❌ Single server → ✅ Multi-server
- ❌ Role-based admin → ✅ Permission-based admin
- ❌ Manual config → ✅ Automatic setup
- ❌ Shared data → ✅ Isolated data

**Your bot is now:**
- 🌐 Multi-server ready
- 🔐 Permission-based
- 🚀 Scalable
- 🎯 Production-ready

## 🎉 Ready to Use!

Your bot now supports unlimited servers with zero configuration!

Just:
1. Update database schema
2. Remove ADMIN_ROLE_ID from .env
3. Restart bot
4. Invite to multiple servers

Each server gets its own isolated tournament system! 🏆
