const { TextChannel } = require('discord.js');

module.exports = async (client, message) => {
    if (!process.env.LOG_CHANNEL_ID) return;
    const channel = await client.channels.fecth(process.env.LOG_CHANNEL_ID);
    if (!(channel instanceof TextChannel)) return;
    channel.send(message);
};