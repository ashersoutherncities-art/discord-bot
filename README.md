# Asher AI - Discord Bot

**Production-ready Discord bot for Southern Cities Enterprises**

## Overview

Asher AI is a Discord bot designed to integrate with Southern Cities Enterprises operations. The bot:

- **Direct Messages**: Responds to all messages
- **Group Chats**: Responds only when mentioned (@Asher)
- **Logging**: Tracks all interactions for auditing and analysis
- **Production Ready**: Designed for 24/7 deployment

## Configuration

### Environment Variables

```
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_APP_ID=your_app_id
NODE_ENV=production
LOG_DIR=./logs
```

**Secure credential storage:** Token stored in `.env` (not committed). See `memory/discord-bot-config.md` for full configuration details.

## Installation

```bash
npm install
```

## Running the Bot

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## Registering Slash Commands

Before first run, register slash commands:

```bash
node src/register-commands.js
```

Available commands:
- `/ping` - Check bot latency
- `/help` - Show available commands

## Features

### Direct Message Handling
- Responds to all direct messages from users
- No prefix or mention required
- Logs all interactions

### Group Chat Handling
- Responds **only** when explicitly mentioned (@Asher)
- Ignores other messages in group chats
- Logs mentions for audit trail

### Logging
All interactions logged to `logs/interactions.jsonl`:
- Message type (MESSAGE, RESPONSE, INTERACTION, ERROR)
- User information
- Channel information
- Message content
- Timestamp

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel doesn't support persistent bots directly, but you can use a serverless webhook approach or run locally.

### Option 2: Local Process (24/7)

For persistent 24/7 operation on your machine:

```bash
npm start
```

Use `pm2` or `systemd` for automatic restart:

```bash
npm install -g pm2
pm2 start npm --name asher-discord-bot -- start
pm2 save
pm2 startup
```

### Option 3: Cloud Hosting

Deploy to services like:
- **Railway** - `git push` deployment
- **Render** - Persistent free tier available
- **Heroku** - Traditional approach
- **AWS EC2** - Full control

## Architecture

### Intents

The bot uses the following Discord Gateway intents:
- `Guilds` - Server events
- `GuildMessages` - Message events
- `DirectMessages` - DM support
- `MessageContent` - Read message content
- `GuildMembers` - Member information

### Response Format

All responses use Discord embeds for consistency:
- Color-coded by response type
- Includes footer with bot name
- Timestamp included

## Logging

Logs are stored in JSONL format (one JSON object per line) for easy parsing and analysis.

Example log entry:
```json
{
  "timestamp": "2026-03-30T09:41:00.000Z",
  "type": "MESSAGE",
  "user": "username",
  "userId": "123456789",
  "channel": "DM",
  "message": "Hello bot!",
  "isDM": true
}
```

## Security

- **Bot Token**: Stored in `.env` (never commit)
- **Credentials**: Maintained in `memory/discord-bot-config.md`
- **Logs**: Contains user data - restrict access to authorized personnel
- **Mentions**: Only responds when explicitly mentioned in groups

## Troubleshooting

### Bot doesn't respond
1. Check bot has `Message Content Intent` enabled
2. Verify bot has permissions in the server
3. Ensure bot token is valid in `.env`
4. Check `logs/interactions.jsonl` for errors

### Slash commands not showing
```bash
node src/register-commands.js
```

### Token issues
- Never share bot token
- Rotate token in Discord Developer Portal if exposed
- Update `.env` with new token

## Development

### File Structure
```
discord-bot/
├── src/
│   ├── index.js                 # Main bot logic
│   └── register-commands.js     # Slash command registration
├── logs/                        # Interaction logs
├── .env                         # Environment variables (not committed)
├── .env.example                 # Example env vars
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
└── README.md                    # This file
```

### Adding New Commands

Edit `src/register-commands.js` to add command definitions, then update `src/index.js` to handle them in the `interactionCreate` event.

## Owner

**Darius Walton / Southern Cities Enterprises**

For support or questions, contact the owner directly.

---

**Last Updated:** 2026-03-30  
**Status:** Production Ready ✅
