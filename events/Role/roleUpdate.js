const log = require('../utils/logs');

module.exports = {
  name: 'roleUpdate',
  execute(oldRole, newRole, client) {
    log(client, oldRole.guild, `Role updated: ${oldRole.name}\n**Old:** ${JSON.stringify({ name: oldRole.name, color: oldRole.color, permissions: oldRole.permissions.bitfield })}\n**New:** ${JSON.stringify({ name: newRole.name, color: newRole.color, permissions: newRole.permissions.bitfield })}`);
  }
};
