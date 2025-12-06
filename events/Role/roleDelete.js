const log = require("../../utils/logs")

module.exports = {
    name: 'roleDelete',
    execute(role, client) {
        log(client, role.guild, `Role deleted: ${role.name}`);
    }
};