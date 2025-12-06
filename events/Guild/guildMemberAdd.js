const WelcomeConfig = require('../models/welcomeModel');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    try {
      const cfg = await WelcomeConfig.findOne({ guildId: member.guild.id });
      if (!cfg || !cfg.enabled || !cfg.channelId) return;
      const channel = await member.guild.channels.fetch(cfg.channelId).catch(() => null);
      if (!channel || !channel.isTextBased()) return;

      const text = cfg.message
        .replace(/{user}/g, `<@${member.id}>`)
        .replace(/{username}/g, member.user.username)
        .replace(/{guild}/g, member.guild.name);

      const embed = {
        title: `Welcome to ${member.guild.name}!`,
        description: text,
        thumbnail: { url: member.user.displayAvatarURL({ dynamic: true }) },
        color: 0x57f287,
        timestamp: new Date()
      };

      channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('Welcome event error:', err);
    }
  }
};
