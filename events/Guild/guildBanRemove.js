const log = require('../../utils/logs');

module.exports = {
    name: 'guildBanRemove',
    async execute(guild, user, client) {
        log(client, guild, `User unbanned: ${user.tag} (${user.id})`);
    }
};