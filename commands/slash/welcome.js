const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const WelcomeConfig = require('../../models/welcomeModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure welcome messages')
    .addSubcommand(sc => sc.setName('setchannel')
      .setDescription('Set channel for welcome messages')
      .addChannelOption(o =>
        o.setName('channel')
          .setDescription('Channel where welcome messages will be sent')
          .setRequired(true)
      ))
    .addSubcommand(sc => sc.setName('setmessage')
      .setDescription('Set welcome message (use {user} and {guild})')
      .addStringOption(o =>
        o.setName('message')
          .setDescription('The welcome message that will be sent')
          .setRequired(true)
      ))
    .addSubcommand(sc => sc.setName('enable')
      .setDescription('Enable welcome messages'))
    .addSubcommand(sc => sc.setName('disable')
      .setDescription('Disable welcome messages'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    let cfg = await WelcomeConfig.findOne({ guildId });
    if (!cfg) {
      cfg = new WelcomeConfig({ guildId });
    }

    if (sub === 'setchannel') {
      const channel = interaction.options.getChannel('channel');
      cfg.channelId = channel.id;
      await cfg.save();
      return interaction.reply({ content: `Welcome channel set to ${channel}`, ephemeral: true });
    }

    if (sub === 'setmessage') {
      const message = interaction.options.getString('message');
      cfg.message = message;
      await cfg.save();
      return interaction.reply({ content: 'Welcome message updated.', ephemeral: true });
    }

    if (sub === 'enable') {
      if (!cfg.channelId)
        return interaction.reply({ content: 'Set a channel first with /welcome setchannel', ephemeral: true });

      cfg.enabled = true;
      await cfg.save();
      return interaction.reply({ content: 'Welcome messages enabled.', ephemeral: true });
    }

    if (sub === 'disable') {
      cfg.enabled = false;
      await cfg.save();
      return interaction.reply({ content: 'Welcome messages disabled.', ephemeral: true });
    }

    return interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
  }
};
