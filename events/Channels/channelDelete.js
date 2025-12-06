const log = require("../../utils/logs");

module.exports = {
    name: 'channelDelete',
    async execute(channel, client) {
        if (!channel.guild) return;
        log(client, channel.guild, `Channel deleted: ${channel.name} (${channel.type})`);
    }
};