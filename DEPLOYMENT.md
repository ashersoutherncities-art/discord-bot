# Deployment Guide - Asher AI Discord Bot

## Prerequisites

- Node.js v18+ installed
- Discord bot token (from `memory/discord-bot-config.md`)
- Application ID configured
- Bot invited to target server

## Quick Start (Local Machine)

### 1. Install Dependencies
```bash
cd /Users/ashborn/.openclaw/workspace/discord-bot
npm install
```

### 2. Configure Environment
The `.env` file is already configured with:
- Bot token from Discord Developer Portal
- Application ID
- Log directory

### 3. Start the Bot
```bash
npm start
```

The bot will start and begin listening for messages.

## 24/7 Deployment with PM2

For persistent operation on your local machine:

### 1. Install PM2 Globally
```bash
npm install -g pm2
```

### 2. Start Bot with PM2
```bash
cd /Users/ashborn/.openclaw/workspace/discord-bot
pm2 start ecosystem.config.js
```

### 3. View Status
```bash
pm2 status
pm2 logs asher-discord-bot
```

### 4. Setup Auto-Start on Reboot
```bash
pm2 startup
pm2 save
```

This will:
- Auto-start bot when your Mac restarts
- Restart bot if it crashes
- Maintain 24/7 uptime

### 5. Common PM2 Commands
```bash
pm2 stop asher-discord-bot       # Stop bot
pm2 restart asher-discord-bot    # Restart bot
pm2 delete asher-discord-bot     # Remove from PM2
pm2 logs asher-discord-bot       # View real-time logs
pm2 logs asher-discord-bot --err # View errors only
```

## Cloud Deployment Options

### Option A: Railway (Recommended for Simplicity)

1. **Connect GitHub**
   ```bash
   git remote add origin https://github.com/[your-username]/discord-bot.git
   git push -u origin main
   ```

2. **Create Railway Project**
   - Go to railway.app
   - Connect GitHub repository
   - Railway auto-detects Node.js project

3. **Set Environment Variables**
   - Add `DISCORD_BOT_TOKEN` 
   - Add `DISCORD_APP_ID`
   - Railway provides free $5/month credit (sufficient for bot)

4. **Deploy**
   - Railway auto-deploys on push
   - Bot runs 24/7

### Option B: Render

1. **Create Render Web Service**
   - Go to render.com
   - Connect GitHub
   - Select discord-bot repository

2. **Configure**
   - Build: `npm install`
   - Start: `npm start`
   - Environment: Node 18+

3. **Add Secrets**
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_APP_ID`

4. **Deploy**
   - Free tier available (spins down after inactivity)
   - Paid tier: continuous operation

### Option C: AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier eligible)
   - Configure security group (allow outbound)

2. **Connect & Setup**
   ```bash
   ssh -i key.pem ubuntu@instance-ip
   curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   cd /home/ubuntu
   git clone [repo-url] discord-bot
   cd discord-bot
   npm install
   ```

3. **Run with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name asher-discord-bot -- start
   pm2 startup
   pm2 save
   ```

4. **Monitoring**
   - Monitor costs on AWS Console
   - Bot runs 24/7 for ~$5/month

## Registering Slash Commands

After initial deployment, register slash commands once:

```bash
node src/register-commands.js
```

Commands will sync to Discord within minutes. Available commands:
- `/ping` - Check bot latency
- `/help` - Show available commands

## Logging & Monitoring

### Local Logs
```bash
tail -f logs/interactions.jsonl
```

### Parse Logs (Pretty Print)
```bash
# Last 10 interactions
cat logs/interactions.jsonl | tail -10 | jq .

# Filter by type (e.g., errors)
cat logs/interactions.jsonl | jq 'select(.type == "ERROR")'

# Count interactions by type
cat logs/interactions.jsonl | jq -s 'group_by(.type) | map({type: .[0].type, count: length})'
```

### PM2 Monitoring
```bash
# Real-time dashboard
pm2 monit

# Memory usage
pm2 show asher-discord-bot

# Kill if memory exceeds threshold (ecosystem.config.js)
# Currently: 500M max_memory_restart
```

## Health Checks

### Verify Bot is Online
```bash
# Check processes
pm2 status

# Check logs for errors
pm2 logs asher-discord-bot --err
```

### Test Bot Functionality
1. **Send DM**: Bot should respond with embed
2. **Mention in Group**: Bot should respond only when @Asher is mentioned
3. **Slash Commands**: `/ping` should return latency

## Troubleshooting

### Bot Offline After Restart
- Check PM2 status: `pm2 status`
- Check logs: `pm2 logs asher-discord-bot`
- Verify `.env` has valid token

### Bot Not Responding
- Verify bot has Message Content Intent enabled
- Check bot permissions in server
- Look for errors in `logs/interactions.jsonl`

### High Memory Usage
- PM2 auto-restarts if exceeds 500M
- Check for memory leaks in logs
- Restart: `pm2 restart asher-discord-bot`

### Token Expired
1. Generate new token in Discord Developer Portal
2. Update `.env`
3. Restart bot: `pm2 restart asher-discord-bot`
4. Update `memory/discord-bot-config.md` with new token

## Backup & Recovery

### Backup Logs
```bash
# Monthly log archive
tar -czf logs-backup-$(date +%Y-%m).tar.gz logs/
```

### Restore After Server Failure
```bash
# Auto-recovery via PM2 startup scripts
pm2 startup
pm2 save
# OS startup will automatically restart bot
```

## Performance Metrics

Expected performance:
- **Memory Usage**: 50-100MB at rest
- **CPU Usage**: < 1% average
- **Latency**: < 100ms response time
- **Uptime**: 99.9% (with PM2)

## Security Checklist

- [x] Bot token stored in `.env` (not committed)
- [x] `.gitignore` prevents credential leaks
- [x] Logs stored locally (encrypted in production)
- [x] Rate limiting: Discord SDK handles limits
- [x] Error logging: All errors tracked
- [x] Permission: Bot only reads what needed

## Next Steps

1. **Invite Bot to Server**
   - Use OAuth URL: https://discord.com/api/oauth2/authorize?client_id=1488770265900875193&permissions=274877906944&scope=bot%20applications.commands

2. **Test in Server**
   - Send DM
   - Mention in group chat
   - Try slash commands

3. **Monitor Uptime**
   - Set up Discord bot status alerts
   - Review logs weekly

4. **Scale as Needed**
   - Add more commands
   - Integrate with Southern Cities systems
   - Expand logging

---

**Owner**: Darius Walton / Southern Cities Enterprises  
**Last Updated**: 2026-03-30  
**Status**: Ready for Deployment ✅
