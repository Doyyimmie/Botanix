const log = require('../utils/logs');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage, client) {
    if (!oldMessage.guild) return;
    if (oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return; // embed only edits
    const msg = `Message edited in #${oldMessage.channel.name} by ${oldMessage.author.tag}\n**Before:** ${oldMessage.content || '[embed/attachment]'}\n**After:** ${newMessage.content || '[embed/attachment]'}`;
    log(client, oldMessage.guild, msg);
  }
};
