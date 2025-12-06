const log = require('../../utils/logs');

module.exports = {
    name: 'guildMemberRemove',
    execute(member, client) {
        log(client, `User left: ${member.user.tag}`);
    }
};