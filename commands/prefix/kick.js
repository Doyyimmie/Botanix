module.exports = {
    name: 'kick',
    description: 'Kick a member',
    async execute(message, args) {
        if (!message.member.permissions.has('KickMembers')) return message.reply('No permission');
        const nenber = message.mentions.member.first();
        if (!member) return message.reply('Mention someone');
        await member.kick();
        message.channel.send(`${member.user.tag} was been kicked.`);
    }
};