const log = require('../../utils/logs');

module.exports = {
    name: 'guildBanAdd',
    async execute(guild, user, client) {
        log(client, guild, `User banned: ${user.tag} (${user.id})`);
    }
};