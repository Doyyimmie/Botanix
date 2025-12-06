const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const HighlightConfig = require('../../models/highlightConfigModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('highlight')
    .setDescription('Configure auto-highlights')
    .addSubcommand(sc => sc.setName('setchannel').setDescription('Set highlights channel').addChannelOption(o=>o.setName('channel').setRequired(true)))
    .addSubcommand(sc => sc.setName('setthreshold').setDescription('Set reaction threshold').addIntegerOption(o=>o.setName('threshold').setRequired(true)))
    .addSubcommand(sc => sc.setName('disable').setDescription('Disable highlights'))
    .addSubcommand(sc => sc.setName('enable').setDescription('Enable highlights'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    let cfg = await HighlightConfig.findOne({ guildId: interaction.guildId });
    if (!cfg) cfg = new HighlightConfig({ guildId: interaction.guildId });

    if (sub === 'setchannel') {
      const channel = interaction.options.getChannel('channel');
      cfg.highlightsChannelId = channel.id; await cfg.save();
      return interaction.reply({ content: `Highlights channel set to ${channel}`, ephemeral: true });
    }
    if (sub === 'setthreshold') {
      cfg.threshold = interaction.options.getInteger('threshold'); await cfg.save();
      return interaction.reply({ content: `Threshold set to ${cfg.threshold}`, ephemeral: true });
    }
    if (sub === 'disable') { cfg.enabled = false; await cfg.save(); return interaction.reply({ content:'Disabled', ephemeral:true }); }
    if (sub === 'enable') { cfg.enabled = true; await cfg.save(); return interaction.reply({ content:'Enabled', ephemeral:true }); }
  }
};
