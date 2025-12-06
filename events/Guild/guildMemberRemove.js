module.exports = {
    name: 'guildMemberRemove',
    execute(member, client) {
        try {
            log(client, member.guild, `User left: ${member.user.tag}`);
        } catch (err) {
            console.error('guildMemberRemove log error:', err);
        }
    }
};
