module.exports = {
    name: 'mute',
    description: 'Mute a member in the server',
    async execute(message, args, client) {
        if (!message.member.permissions.has('ModerateMembers')) return message.reply('No permission.');
        const member = message.mentions.members.first();
        if (!member) return message.reply('Mention a member to mute');
        try {
            await member.timeout(10 * 60 * 1000);
            message.channel.send(`${member.user.tag} has been muted for 10 minutes`);
            client.channel.fetch(process.env.LOG_CHANNEL_ID)
                .then(ch => ch.send(`${member.user.tag} was muted by ${message.author.tag}`));
        } catch (err) {
            console.error(err);
            message.reply('Cloud not mute this member.');
        } 
    }
};