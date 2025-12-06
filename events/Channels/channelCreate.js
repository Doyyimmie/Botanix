const log = require("../../utils/logs");

module.exports = {
    name: 'channelCreate',
    async execute(channel, client) {
        if (!channel.guild) return;
        log(client, channel.guild, `Channel created: ${channel.name} (${channel.type})`);
    }
};