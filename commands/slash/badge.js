const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Badge = require('../../models/badgeModel');
const UserBadge = require('../../models/userBadgeModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('badge')
    .setDescription('Manage badges')
    .addSubcommand(sc => sc
      .setName('create')
      .setDescription('Create a badge')
      .addStringOption(o => o.setName('name').setDescription('Badge name').setRequired(true))
      .addStringOption(o => o.setName('description').setDescription('Badge description').setRequired(true))
      .addStringOption(o => o.setName('icon').setDescription('Badge icon URL (optional)').setRequired(false))
    )
    .addSubcommand(sc => sc
      .setName('assign')
      .setDescription('Assign a badge to a user')
      .addStringOption(o => o.setName('badgeid').setDescription('Badge ID').setRequired(true))
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    )
    .addSubcommand(sc => sc
      .setName('remove')
      .setDescription('Remove badge from user')
      .addStringOption(o => o.setName('badgeid').setDescription('Badge ID').setRequired(true))
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'create') {
      const name = interaction.options.getString('name') || 'Unnamed';
      const description = interaction.options.getString('description') || 'No description';
      const icon = interaction.options.getString('icon') || null;

      const b = new Badge({ guildId: interaction.guildId, name, description, iconURL: icon });
      await b.save();

      return interaction.reply({ content: `✅ Badge created (ID: ${b.id})`, ephemeral: true });
    }

    if (sub === 'assign') {
      const id = interaction.options.getString('badgeid');
      const user = interaction.options.getUser('user');

      const b = await Badge.findById(id);
      if (!b) return interaction.reply({ content: '❌ Badge not found', ephemeral: true });

      const existing = await UserBadge.findOne({ guildId: interaction.guildId, userId: user.id, badgeId: id });
      if (existing) return interaction.reply({ content: `${user.tag} already has this badge`, ephemeral: true });

      const ub = new UserBadge({ guildId: interaction.guildId, userId: user.id, badgeId: id });
      await ub.save();

      return interaction.reply({ content: `✅ Badge assigned to ${user.tag}`, ephemeral: true });
    }

    if (sub === 'remove') {
      const id = interaction.options.getString('badgeid');
      const user = interaction.options.getUser('user');

      const result = await UserBadge.deleteOne({ guildId: interaction.guildId, userId: user.id, badgeId: id });
      if (result.deletedCount === 0) {
        return interaction.reply({ content: `${user.tag} did not have this badge`, ephemeral: true });
      }

      return interaction.reply({ content: `✅ Badge removed from ${user.tag}`, ephemeral: true });
    }
  }
};
