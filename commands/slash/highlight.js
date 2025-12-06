const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const HighlightConfig = require('../../models/highlightConfigModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('highlight')
    .setDescription('Configure auto-highlights')
    .addSubcommand(sc => sc.setName('setchannel').setDescription('Set highlights channel').addChannelOption(o => o.setName('channel').setDescription('Channel to post highlights in').setRequired(true)))
    .addSubcommand(sc => sc.setName('setthreshold').setDescription('Set reaction threshold').addIntegerOption(o => o.setName('threshold').setDescription('Reaction count threshold').setRequired(true)))
    .addSubcommand(sc => sc.setName('disable').setDescription('Disable highlights'))
    .addSubcommand(sc => sc.setName('enable').setDescription('Enable highlights'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    let cfg = await HighlightConfig.findOne({ guildId: interaction.guildId });
    if (!cfg) cfg = new HighlightConfig({ guildId: interaction.guildId });

    switch (sub) {
      case 'setchannel': {
        const channel = interaction.options.getChannel('channel');
        if (!channel || !channel.isTextBased()) 
          return interaction.reply({ content: 'Invalid channel.', ephemeral: true });

        cfg.highlightsChannelId = channel.id;
        await cfg.save();
        return interaction.reply({ content: `✅ Highlights channel set to ${channel}`, ephemeral: true });
      }
      case 'setthreshold': {
        const threshold = interaction.options.getInteger('threshold');
        if (threshold <= 0) return interaction.reply({ content: 'Threshold must be greater than 0.', ephemeral: true });

        cfg.threshold = threshold;
        await cfg.save();
        return interaction.reply({ content: `✅ Threshold set to ${cfg.threshold}`, ephemeral: true });
      }
      case 'disable': {
        cfg.enabled = false;
        await cfg.save();
        return interaction.reply({ content: '❌ Highlights disabled', ephemeral: true });
      }
      case 'enable': {
        cfg.enabled = true;
        await cfg.save();
        return interaction.reply({ content: '✅ Highlights enabled', ephemeral: true });
      }
      default:
        return interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
    }
  }
};
