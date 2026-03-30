import { Client, GatewayIntentBits, ChannelType, EmbedBuilder } from 'discord.js';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

// Configuration
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const APP_ID = process.env.DISCORD_APP_ID;
const LOG_DIR = process.env.LOG_DIR || './logs';
const BOT_NAME = 'Asher AI';
const OWNER = 'Darius Walton / Southern Cities Enterprises';

// Channels where bot responds to ALL messages without mentions
const AUTO_RESPOND_CHANNELS = ['sci-acquisitions'];

// Channels where bot only responds when mentioned
const MENTION_ONLY_CHANNELS = ['relationship-notes'];

console.log('🔧 Config loaded:');
console.log(`   Discord Token: ${TOKEN ? '✓' : '✗'}`);
console.log(`   Anthropic Key: ${process.env.ANTHROPIC_API_KEY ? '✓' : '✗'}`);
console.log(`   Auto-respond channels: ${AUTO_RESPOND_CHANNELS.join(', ')}`);

// Restore Anthropic import
const Anthropic = (await import('@anthropic-ai/sdk')).default;

// Initialize Anthropic client  
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Get Claude response - try multiple model names
async function getClaudeResponse(userMessage) {
  const modelsToTry = [
    'claude-opus-4-6-20250514',
    'claude-opus-4',
    'claude-3-opus-20240229',
  ];
  
  for (const model of modelsToTry) {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 200,
        system: 'You are Asher AI for Southern Cities Enterprises. Keep responses brief (1-2 sentences max). Be direct about acquisitions and deals.',
        messages: [{ role: 'user', content: userMessage }],
      });
      
      const text = response.content[0].type === 'text' ? response.content[0].text : null;
      if (text) {
        console.log(`[Claude] Used model: ${model}`);
        return text;
      }
    } catch (error) {
      console.log(`Model ${model} failed:`, error.message);
      continue;
    }
  }
  
  console.error('All Claude models failed');
  return null;
}

// Ensure logs directory exists
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

// Initialize Discord client with proper intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Logging utility
function logInteraction(data) {
  const timestamp = new Date().toISOString();
  const logEntry = JSON.stringify({
    timestamp,
    ...data,
  });
  
  const logFile = join(LOG_DIR, 'interactions.jsonl');
  appendFileSync(logFile, logEntry + '\n');
  
  console.log(`[${timestamp}] ${data.type}: ${data.user} - ${data.message}`);
}

// Event: Bot ready
client.on('ready', () => {
  console.log(`✅ ${BOT_NAME} is online as ${client.user.tag}`);
  console.log(`📍 Owner: ${OWNER}`);
  console.log(`📝 Logs directory: ${LOG_DIR}`);
  
  // Set bot status
  client.user.setPresence({
    activities: [
      {
        name: 'Southern Cities Enterprises',
        type: 2, // LISTENING
      },
    ],
    status: 'online',
  });
  
  logInteraction({
    type: 'READY',
    user: 'System',
    message: `${BOT_NAME} started and ready`,
  });
});

// Event: Message create (for DMs and group mentions)
client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  try {
    const isDM = message.channel.type === ChannelType.DM;
    const isMentioned = message.mentions.has(client.user);

    // Log all messages
    logInteraction({
      type: 'MESSAGE',
      user: message.author.username,
      userId: message.author.id,
      channel: isDM ? 'DM' : message.guild?.name || 'Unknown',
      channelId: message.channel.id,
      message: message.content,
      isDM,
    });

    // Generate response using OpenClaw's authenticated Claude
    const getResponse = async (content) => {
      // Try OpenClaw first
      const claudeResponse = await getClaudeResponse(
        `You are Asher AI, assistant for Southern Cities Enterprises. Keep response brief (1-2 sentences max for Discord). Be direct and actionable about acquisitions, deals, and properties. User message: "${content}"`
      );
      
      if (claudeResponse && !claudeResponse.includes('unavailable')) {
        return claudeResponse;
      }
      
      // Fallback contextual responses
      const lower = content.toLowerCase();
      
      if (lower.includes('hi') || lower.includes('hey') || lower.includes('hello')) {
        return `👋 Hey! What's the latest on acquisitions?`;
      }
      if (lower.includes('deal') || lower.includes('property') || lower.includes('arv')) {
        return `📊 Got it. Running analysis... What details do you have on that?`;
      }
      if (lower.includes('thanks') || lower.includes('thank')) {
        return `✅ You got it! Anything else?`;
      }
      if (lower.includes('help') || lower.includes('how')) {
        return `🤝 I'm here to help with deal analysis, property research, and acquisition strategy. What do you need?`;
      }
      
      // Default response
      return `👂 I'm listening. Tell me more about this acquisition.`;
    };

    // Respond to DMs only
    if (isDM) {
      const response = await getResponse(message.content);
      await message.channel.send(response);
      
      logInteraction({
        type: 'RESPONSE',
        user: message.author.username,
        userId: message.author.id,
        channel: 'DM',
        message: `Responded to DM: "${message.content}"`,
      });
      return;
    }

    // Handle group chats and channels
    if (message.guild) {
      const memberCount = message.channel.members ? message.channel.members.size : null;
      const channelName = message.channel.name || '';
      const isAutoRespondChannel = AUTO_RESPOND_CHANNELS.includes(channelName);
      const isMentionOnlyChannel = MENTION_ONLY_CHANNELS.includes(channelName);
      const isPrivateGroupChat = memberCount === 2; // Just user + bot
      
      // Debug logging
      console.log(`[DEBUG] Channel: #${channelName}, Members: ${memberCount}, Auto-respond: ${isAutoRespondChannel}, MentionOnly: ${isMentionOnlyChannel}, PrivateGroup: ${isPrivateGroupChat}`);
      
      // PRIORITY 1: Respond to ALL messages in auto-respond channels FIRST
      if (isAutoRespondChannel) {
        const response = await getResponse(message.content);
        await message.channel.send(response);
        
        logInteraction({
          type: 'RESPONSE',
          user: message.author.username,
          userId: message.author.id,
          channel: message.guild.name,
          channelId: message.channel.id,
          message: `Responded to all messages in auto-respond channel: #${channelName}`,
        });
        return;
      }
      
      // PRIORITY 2: Respond to all messages in 1-on-1 group chats (user + bot only)
      if (isPrivateGroupChat) {
        const response = await getResponse(message.content);
        await message.channel.send(response);
        
        logInteraction({
          type: 'RESPONSE',
          user: message.author.username,
          userId: message.author.id,
          channel: message.guild.name,
          channelId: message.channel.id,
          message: `Responded to all messages in private group (${memberCount} members)`,
        });
        return;
      }
      
      // PRIORITY 3: Mention-only channels - respond ONLY when mentioned
      if (isMentionOnlyChannel && !isMentioned) {
        return; // Silently ignore messages not mentioning the bot
      }
      
      // In larger groups/channels: respond only when mentioned
      if (isMentioned || isMentionOnlyChannel) {
        const response = await getResponse(message.content);
        await message.channel.send(response);
        
        logInteraction({
          type: 'RESPONSE',
          user: message.author.username,
          userId: message.author.id,
          channel: message.guild.name,
          channelId: message.channel.id,
          message: `Responded to mention in group (${memberCount} members)`,
        });
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
    logInteraction({
      type: 'ERROR',
      user: message.author.username,
      userId: message.author.id,
      message: `Error: ${error.message}`,
    });
  }
});

// Event: Interaction (slash commands)
client.on('interactionCreate', async (interaction) => {
  // Only handle slash commands and buttons for now
  if (!interaction.isChatInputCommand() && !interaction.isButton()) {
    return;
  }

  try {
    const isDM = interaction.channel.type === ChannelType.DM;
    
    logInteraction({
      type: 'INTERACTION',
      user: interaction.user.username,
      userId: interaction.user.id,
      channel: isDM ? 'DM' : interaction.guild?.name || 'Unknown',
      channelId: interaction.channel.id,
      message: `Slash command: /${interaction.commandName}`,
    });

    // Handle commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.commandName;

      if (command === 'ping') {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#00FF00')
              .setTitle('Pong! 🏓')
              .setDescription(`Latency: ${client.ws.ping}ms`)
              .setFooter({ text: BOT_NAME }),
          ],
        });
      } else if (command === 'help') {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#0099FF')
              .setTitle(`${BOT_NAME} - Help`)
              .setDescription('Available commands when you mention @Asher:')
              .addFields(
                { name: '/ping', value: 'Check bot latency' },
                { name: '/help', value: 'Show this help message' },
                { name: 'DM Support', value: 'Send any message in DMs for instant response' }
              )
              .setFooter({ text: `Owner: ${OWNER}` }),
          ],
        });
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF9900')
              .setTitle('Unknown Command')
              .setDescription('This command is not recognized.')
              .setFooter({ text: BOT_NAME }),
          ],
        });
      }
    }

    logInteraction({
      type: 'RESPONSE',
      user: interaction.user.username,
      userId: interaction.user.id,
      channel: isDM ? 'DM' : interaction.guild?.name || 'Unknown',
      message: 'Interaction handled',
    });
  } catch (error) {
    console.error('Error handling interaction:', error);
    logInteraction({
      type: 'ERROR',
      user: interaction.user.username,
      userId: interaction.user.id,
      message: `Error: ${error.message}`,
    });

    if (!interaction.replied) {
      await interaction.reply({
        content: '❌ An error occurred processing your request.',
        ephemeral: true,
      });
    }
  }
});

// Error handling
client.on('error', (error) => {
  console.error('Discord client error:', error);
  logInteraction({
    type: 'ERROR',
    user: 'System',
    message: `Client error: ${error.message}`,
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logInteraction({
    type: 'ERROR',
    user: 'System',
    message: `Unhandled rejection: ${reason}`,
  });
});

// Helper function to create response embeds
function createResponse(messageContent) {
  return new EmbedBuilder()
    .setColor('#0099FF')
    .setTitle(`${BOT_NAME} Response`)
    .setDescription(
      messageContent.length > 0
        ? `You said: "${messageContent}"\n\nI'm ready to help with Southern Cities Enterprises tasks. Use DMs for direct communication or mention me in group chats.`
        : 'Hello! I\'m ready to assist. How can I help?'
    )
    .setFooter({ text: `Owner: ${OWNER}` })
    .setTimestamp();
}

// Login to Discord
console.log(`🚀 Starting ${BOT_NAME}...`);
client.login(TOKEN);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  logInteraction({
    type: 'SHUTDOWN',
    user: 'System',
    message: 'Bot shutdown initiated',
  });
  await client.destroy();
  process.exit(0);
});
