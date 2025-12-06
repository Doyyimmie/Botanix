const { SlashCommandBuilder } = require('discord.js');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder().setName('status').setDescription('Show bot and server status'),
  async execute(interaction) {
    const memory = process.memoryUsage();
    const rss = Math.round(memory.rss / 1024 / 1024);
    const heapUsed = Math.round(memory.heapUsed / 1024 / 1024);
    const uptime = process.uptime();
    const cpu = os.loadavg ? os.loadavg()[0] : 0;
    const guildCount = interaction.client.guilds.cache.size;

    const text =
      `Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m\n` +
      `Memory RSS: ${rss} MB\nHeap used: ${heapUsed} MB\nCPU load (1m): ${cpu}\nGuilds: ${guildCount}\nPing: ${interaction.client.ws.ping}ms`;

    return interaction.reply({ content: `\`\`\`\n${text}\n\`\`\`` });
  }
};
