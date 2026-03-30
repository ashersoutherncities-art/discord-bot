# Quick Start - Asher AI Discord Bot

**Status:** ✅ Ready to Deploy  
**Build Time:** Complete (2026-03-30 13:43 EDT)  
**GitHub:** https://github.com/ashersoutherncities-art/discord-bot

## 3-Step Deployment (Choose One)

### Option 1: Local Machine (24/7 with PM2) - 5 minutes

```bash
# 1. Install dependencies
cd /Users/ashborn/.openclaw/workspace/discord-bot
npm install

# 2. Install PM2 globally (one-time)
npm install -g pm2

# 3. Start bot (auto-restart on crash/reboot)
pm2 start ecosystem.config.js

# Done! Bot runs 24/7
pm2 status
```

**To stop:**
```bash
pm2 stop asher-discord-bot
pm2 delete asher-discord-bot
```

---

### Option 2: Railway.app (Cloud - 5 minutes)

1. Go to https://railway.app/new
2. Click "Deploy from GitHub"
3. Select `discord-bot` repository
4. Railway auto-configures
5. Add secrets (from `memory/discord-bot-config.md`):
   - `DISCORD_BOT_TOKEN` = [get from memory/discord-bot-config.md]
   - `DISCORD_APP_ID` = [get from memory/discord-bot-config.md]
6. Click Deploy
7. Bot runs 24/7 in cloud (~$5/month)

---

### Option 3: Local Development (Testing)

```bash
npm install
npm run dev
```

Logs appear in terminal. Ctrl+C to stop.

---

## After Deployment

### 1. Invite Bot to Discord Server

Use the OAuth URL from `memory/discord-bot-config.md` to invite the bot to your server.

Bot will appear in your server as "Asher AI".

### 2. Register Slash Commands (One-Time)

After bot starts, run:
```bash
node src/register-commands.js
```

You'll see:
```
🔄 Registering slash commands...
✅ Successfully registered 2 slash command(s).
  - /ping: Check bot latency
  - /help: Show help and available commands
```

### 3. Test Bot

**In DMs:**
- Send: "Hello!"
- Bot responds instantly with help embed

**In Group Chat:**
- Send: "@Asher What's up?"
- Bot responds only to mentions

**Slash Commands:**
- Type: `/ping`
- Type: `/help`

---

## Monitoring

### If Using PM2 (Local)
```bash
# View logs in real-time
pm2 logs asher-discord-bot

# Check status
pm2 status

# View memory/CPU usage
pm2 show asher-discord-bot
```

### View Interaction Logs
```bash
# Last 10 interactions
tail -10 logs/interactions.jsonl | jq .

# Pretty print
cat logs/interactions.jsonl | jq .

# Count by type
cat logs/interactions.jsonl | jq -s 'group_by(.type) | map({type: .[0].type, count: length})'
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Bot offline | `pm2 logs asher-discord-bot` - check errors |
| Bot not responding | Verify `.env` has correct token |
| Commands not showing | Run `node src/register-commands.js` again |
| High memory usage | `pm2 restart asher-discord-bot` |
| Token error | Update `.env` with new token from Discord |

---

## Key Features

✅ **DM Support** - Responds to all direct messages  
✅ **Group Chat** - Responds only when mentioned (@Asher)  
✅ **Logging** - All interactions logged to `logs/interactions.jsonl`  
✅ **Slash Commands** - `/ping`, `/help` pre-built  
✅ **Production Ready** - Error handling, graceful shutdown  
✅ **24/7 Uptime** - Auto-restart on crash  

---

## Need Help?

- **Bot won't start:** Check `.env` has correct token and app ID
- **Logs:** View `logs/interactions.jsonl`
- **Code:** See `README.md` for full documentation
- **Deployment:** See `DEPLOYMENT.md` for detailed guide

---

**Owner:** Darius Walton  
**Business:** Southern Cities Enterprises  
**Built by:** Asher AI  
**Date:** 2026-03-30

🚀 **Ready to go live!**
