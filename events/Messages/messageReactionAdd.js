const HighlightConfig = require('../../models/highlightConfigModel');

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user, client) {
    try {
      if (user.bot) return;
      const message = reaction.message;
      if (!message.guild) return;
      const cfg = await HighlightConfig.findOne({ guildId: message.guild.id });
      if (!cfg || !cfg.enabled || !cfg.highlightsChannelId) return;
      // if emoji matches
      const emoji = reaction.emoji.name;
      if (emoji !== cfg.emoji) return;
      const count = reaction.count || 0;
      if (count < cfg.threshold) return;
      // send to highlights channel
      const channel = await client.channels.fetch(cfg.highlightsChannelId).catch(()=>null);
      if (!channel) return;
      // avoid duplicate posts: check if already posted by searching recent messages containing message id
      const embed = {
        author: { name: message.author.tag, icon_url: message.author.displayAvatarURL({ dynamic: true }) },
        description: message.content || '[embed/attachment]',
        footer: { text: `In #${message.channel.name} • ${count} ${emoji}` },
        timestamp: new Date()
      };
      channel.send({ embeds: [embed], content: `Original: ${message.url}` });
    } catch (err) { console.error('Highlight error', err); }
  }
};
