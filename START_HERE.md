# 🚀 START HERE - RayNode Bot

## Quick Start (2 Steps)

### Step 1: Test Database ✅
```bash
npm run test-db
```

**Expected**: All green checkmarks ✅

### Step 2: Start Bot ✅
```bash
npm start
```

**Expected**: Bot comes online without errors

---

## ✅ Your Setup is Complete!

Your `.env` file is configured with:
- ✅ Discord Token
- ✅ Client ID
- ✅ Admin Role ID
- ✅ Supabase URL
- ✅ Supabase Key

Your database has all tables:
- ✅ tournaments
- ✅ players
- ✅ tournament_squads
- ✅ matches

---

## 🎮 Test Commands in Discord

Try these in order:

```
1. ry.help
2. ry.create tournament TestTournament
3. ry.list
4. ry.add squad TestTournament
   (then reply with your Discord ID)
5. ry.squad TestTournament
6. ry.match TestTournament 9pm https://discord.gg/test
```

---

## 📚 Documentation

- **QUICK_START.md** - 5-minute setup guide
- **SUPABASE_SETUP.md** - Detailed Supabase guide
- **ENV_VARIABLES.md** - All environment variables
- **TROUBLESHOOTING.md** - Fix common issues
- **README.md** - Complete documentation

---

## 🆘 Having Issues?

1. Run: `npm run test-db`
2. Check: `TROUBLESHOOTING.md`
3. Verify: All steps in `SUPABASE_SETUP.md`

---

## 🎉 You're Ready!

Your bot is configured and ready to manage tournaments!

**Start it now:**
```bash
npm start
```
