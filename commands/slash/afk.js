const { SlashCommandBuilder } = require('discord.js');
const AFK = require('../../models/afkModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set or remove AFK status')
    .addSubcommand(sc => sc.setName('set').setDescription('Set AFK').addStringOption(o => o.setName('reason').setDescription('AFK reason').setRequired(false)))
    .addSubcommand(sc => sc.setName('remove').setDescription('Remove AFK')),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'set') {
      const reason = interaction.options.getString('reason') || 'AFK';
      await AFK.findOneAndUpdate({ guildId: interaction.guildId, userId: interaction.user.id }, { reason, since: new Date() }, { upsert: true });
      return interaction.reply({ content: `You are now AFK: ${reason}`, ephemeral: true });
    } else {
      await AFK.deleteOne({ guildId: interaction.guildId, userId: interaction.user.id });
      return interaction.reply({ content: 'AFK removed.', ephemeral: true });
    }
  }
};
