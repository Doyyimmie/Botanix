const mongoose = require("mongoose");

const warnSchema = new mongoose.Schema({
    userId: String,
    guildId: String,
    reason: String,
    moderator: String,
    timestamp: { type: Date, default: Date.now }
});

const Warn = mongoose.model('Warn', warnSchema);

module.exports = {
    name: 'warn',
    description: 'Warn a member',
    async execute(message, args, client) {
        if (!message.member.permissions.has('ModerateMembers')) return message.reply('No permission.');
        const member = message.mentions.members.first();
        if (!member) return message.reply('Mention a member to warn.');
        const reason = args.slice(1).join(' ') || 'No reason provided';
        try {
            const warn = new Warn({
                userId: member.id,
                guildId: message.guild.id,
                reason,
                moderator: message.author.tag
            });
            await warn.save();
            message.channel.send(`${member.user.tag} has been warned: Reason: ${reason}`);
            client.channels.fecth(process.env.LOG_CHANNEL_ID)
                .then(ch => ch.send(`${member.user.tag} was warned by ${message.author.tag}. Reason: ${reason}`));
        } catch (err) {
            console.error(err);
            message.reply('Cloud not warn this member');
        }
    }
};