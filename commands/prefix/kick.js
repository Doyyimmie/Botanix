const Warn = require('../../models/warnModel');
const { applyPunishments } = require('../../utils/punishUtils');

module.exports = {
  name: 'warn',
  description: 'Warn a member',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ModerateMembers')) return message.reply('No permission');
    const member = message.mentions.members.first();
    if (!member) return message.reply('Mention a member');
    const reason = args.slice(1).join(' ') || 'No reason';
    const w = new Warn({ guildId: message.guild.id, userId: member.id, moderatorId: message.author.id, reason });
    await w.save();
    message.channel.send(`${member.user.tag} warned. Reason: ${reason}`);
    client.channels.fetch(process.env.LOG_CHANNEL_ID).then(ch => ch.send(`${member.user.tag} warned by ${message.author.tag} (${reason})`)).catch(()=>{});
    await applyPunishments(client, message.guild.id, member.id);
  }
};
