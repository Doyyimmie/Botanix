module.exports = {
    name: 'kick',
    description: 'Kick a member from the server',
    async execute(message, args, client) {
        if (!message.member.permissions.has('KickMembers')) return message.reply('You do not have permission.');
        const member = message.mentions.members.first();
        if (!member) return message.reply('Please mention a member to kick');
        try {
            await member.kick();
            message.channel.send(`${member.user.tag} was been kicked`);
            client.channels.fetch(process.env.LOG_CHANNEL_ID)
                .then(ch => ch.send(`${member.user.tag} was kicked by ${message.author.tag}`));
        } catch (err) {
            console.error(err);
            message.reply('Cloud not kick this member.');
        }
    }
}