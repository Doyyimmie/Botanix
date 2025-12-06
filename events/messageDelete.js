const log = require('../utils/logs');

module.exports = {
    name: 'messageDelete',
    execute(message, client) {
        if (!message.guild) return;
        log(client, `Message deleted in ${message.channel.name}: ${message.content}`);
    }
};