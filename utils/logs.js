const { TextChannel } = require('discord.js');

module.exports = async (client, guild, message) => {
    try {
        const channelId = process.env.LOG_CHANNEL_ID;
        if (!channelId) return;
        const channel = await client.channels.fecth(channelId).ctch(()=>null);
        if (!channel || !(channel instanceof TextChannel)) return;
        channel.send({
            content: message
        }).catch(()=>{});
    } catch (err) {
        console.error('Logging error:', err);
    }
};