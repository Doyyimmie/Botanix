const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Badge = require('../../models/badgeModel');
const UserBadge = require('../../models/userBadgeModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('badge')
    .setDescription('Manage badges')
    .addSubcommand(sc => sc.setName('create').setDescription('Create a badge').addStringOption(o=>o.setName('name').setRequired(true)).addStringOption(o=>o.setName('description').setRequired(true)).addStringOption(o=>o.setName('icon').setRequired(false)))
    .addSubcommand(sc => sc.setName('assign').setDescription('Assign a badge to a user').addStringOption(o=>o.setName('badgeid').setRequired(true)).addUserOption(o=>o.setName('user').setRequired(true)))
    .addSubcommand(sc => sc.setName('remove').setDescription('Remove badge from user').addStringOption(o=>o.setName('badgeid').setRequired(true)).addUserOption(o=>o.setName('user').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'create') {
      const name = interaction.options.getString('name');
      const description = interaction.options.getString('description');
      const icon = interaction.options.getString('icon');
      const b = new Badge({ guildId: interaction.guildId, name, description, iconURL: icon });
      await b.save();
      return interaction.reply({ content: `Badge created (id: ${b.id})`, ephemeral: true });
    }
    if (sub === 'assign') {
      const id = interaction.options.getString('badgeid');
      const user = interaction.options.getUser('user');
      const b = await Badge.findById(id);
      if (!b) return interaction.reply({ content: 'Badge not found', ephemeral: true });
      const ub = new UserBadge({ guildId: interaction.guildId, userId: user.id, badgeId: id });
      await ub.save();
      return interaction.reply({ content: `Badge assigned to ${user.tag}`, ephemeral: true });
    }
    if (sub === 'remove') {
      const id = interaction.options.getString('badgeid');
      const user = interaction.options.getUser('user');
      await UserBadge.deleteOne({ guildId: interaction.guildId, userId: user.id, badgeId: id });
      return interaction.reply({ content: `Badge removed from ${user.tag}`, ephemeral: true });
    }
  }
};
