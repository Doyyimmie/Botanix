const { SlashCommandBuilder } = require('discord.js');
const UserBadge = require('../../models/userBadgeModel');
const Badge = require('../../models/badgeModel');

module.exports = {
  data: new SlashCommandBuilder().setName('profile').setDescription('Show user profile and badges').addUserOption(o=>o.setName('user').setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const ub = await UserBadge.find({ guildId: interaction.guildId, userId: user.id });
    if (!ub.length) return interaction.reply({ content: `${user.tag} has no badges.`, ephemeral: true });
    const badges = await Badge.find({ _id: { $in: ub.map(u => u.badgeId) }});
    const text = badges.map(b => `${b.iconURL ? `${b.iconURL} ` : ''}**${b.name}** — ${b.description}`).join('\n');
    return interaction.reply({ content: `Badges for ${user.tag}:\n${text}` });
  }
};
