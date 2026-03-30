import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const APP_ID = process.env.DISCORD_APP_ID;

// Slash commands definition
const commands = [
  {
    name: 'ping',
    description: 'Check bot latency',
  },
  {
    name: 'help',
    description: 'Show help and available commands',
  },
];

// Register commands
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    console.log('🔄 Registering slash commands...');

    const data = await rest.put(Routes.applicationCommands(APP_ID), {
      body: commands,
    });

    console.log(`✅ Successfully registered ${data.length} slash command(s).`);
    data.forEach((cmd) => {
      console.log(`  - /${cmd.name}: ${cmd.description}`);
    });
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
    process.exit(1);
  }
}

registerCommands();
