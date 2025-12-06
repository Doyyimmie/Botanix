const { SlashCommandBuilder } = require('discord.js');
const UserBadge = require('../../models/userBadgeModel');
const Badge = require('../../models/badgeModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Show user profile and badges')
    .addUserOption(o => o.setName('user').setDescription('Select a user').setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    // busca badges do usuário
    const userBadges = await UserBadge.find({ guildId: interaction.guildId, userId: user.id });
    if (!userBadges.length) 
      return interaction.reply({ content: `❌ ${user.tag} has no badges.`, ephemeral: true });

    const badges = await Badge.find({ _id: { $in: userBadges.map(u => u.badgeId) } });
    if (!badges.length) 
      return interaction.reply({ content: `⚠️ ${user.tag} has badges, but none found in the database.`, ephemeral: true });

    // formata badges
    const text = badges
      .map(b => `${b.iconURL ? `${b.iconURL} ` : ''}**${b.name}** — ${b.description || 'No description.'}`)
      .join('\n');

    // limita a 2000 caracteres do Discord
    const replyText = text.length > 1990 ? text.slice(0, 1990) + '...' : text;

    return interaction.reply({ content: `🎖️ Badges for ${user.tag}:\n${replyText}` });
  }
};
