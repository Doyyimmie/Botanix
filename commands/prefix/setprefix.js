const mongoose = require('mongoose');

const prefixSchema = new mongoose.Schema({
  guildId: String,
  prefix: String
});

const Prefix = mongoose.model('Prefix', prefixSchema);

module.exports = {
  name: 'setprefix',
  description: 'Set a new prefix for this server',
  async execute(message, args) {
    if (!message.member.permissions.has('Administrator')) return message.reply('No permission.');
    const newPrefix = args[0];
    if (!newPrefix) return message.reply('Please provide a new prefix.');
    try {
      await Prefix.findOneAndUpdate(
        { guildId: message.guild.id },
        { prefix: newPrefix },
        { upsert: true }
      );
      message.channel.send(`Prefix updated to \`${newPrefix}\``);
    } catch (err) {
      console.error(err);
      message.reply('Could not update prefix.');
    }
  }
};
