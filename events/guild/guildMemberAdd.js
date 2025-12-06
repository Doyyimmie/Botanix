const log = require('../../utils/logs');

module.exports = {
    name: 'guildMemberAdd',
    execute(member, client) {
        log(client, `User joined: ${member.user.tag}`);
    }
};