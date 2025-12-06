const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Ban a member from the server',
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) 
      return message.reply('You do not have permission.');

    const member = message.mentions.members.first();
    if (!member) 
      return message.reply('Please mention a member to ban');

    try {
      await member.ban();
      message.channel.send(`${member.user.tag} was banned`);

      const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID).catch(() => null);
      if (logChannel) 
        logChannel.send(`${member.user.tag} was banned by ${message.author.tag}`);
      
    } catch (err) {
      console.error(err);
      message.reply('Could not ban this member.');
    }
  }
};
