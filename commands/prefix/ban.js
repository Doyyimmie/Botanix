module.exports = {
    name: 'ban',
    description: 'Ban a member from the server',
    async execute(message, args, client) {
        if (!message.member.permissions.has('BanMember')) return message.reply('You do not have permission.');
        const member = message.mentions.members.first();
        if (!member) return message.reply('Please mention a member to ban');
        try {
            await member.ban();
            messsage.channel.send(`${member.user.tag} was been banned`);
            client.channels.fetch(process.env.LOG_CHANNEL_ID)
                .then(ch => ch.send(`${member.user.tag} was banned by ${message.author.tag}`));
        } catch (err) {
            console.error(err);
            message.reply('Cloud not ban this member.');
        }
    }
}