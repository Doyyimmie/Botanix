const log = require('../../utils/logs');

module.exports = {
    name: 'guildBanRemove',
    async execute(ban, client) {
        const { guild, user } = ban;

        if (!guild) return;

        log(client, guild, `User unbanned: ${user.tag} (${user.id})`);
    }
};
