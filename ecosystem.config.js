module.exports = {
  apps: [
    {
      name: 'asher-discord-wrapper',
      cwd: '/Users/ashborn/.openclaw/workspace/discord-bot',
      script: 'src/index.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      out_file: '/Users/ashborn/.openclaw/workspace/discord-bot/logs/pm2-out.log',
      error_file: '/Users/ashborn/.openclaw/workspace/discord-bot/logs/pm2-error.log',
      time: true
    }
  ]
};
