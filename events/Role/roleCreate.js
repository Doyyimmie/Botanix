const log = require("../../utils/logs")

module.exports = {
    name: 'roleCreate',
    execute(role, client) {
        log(client, role.guild, `Role created: ${role.name}`);
    }
};