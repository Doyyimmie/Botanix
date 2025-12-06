const log = require('../utils/logs');

module.exports = {
  name: 'guildMemberUpdate',
  execute(oldMember, newMember, client) {
    if (oldMember.nickname !== newMember.nickname) {
      log(client, oldMember.guild, `Nickname changed: ${oldMember.user.tag}\nOld: ${oldMember.nickname || '[none]'}\nNew: ${newMember.nickname || '[none]'}`);
    }

    // roles changed
    const oldRoles = oldMember.roles.cache.map(r => r.id).sort();
    const newRoles = newMember.roles.cache.map(r => r.id).sort();
    if (oldRoles.join(',') !== newRoles.join(',')) {
      log(client, oldMember.guild, `Roles changed for ${oldMember.user.tag}`);
    }
  }
};
