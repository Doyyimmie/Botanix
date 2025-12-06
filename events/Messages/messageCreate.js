const AutoResponder = require('../models/autoresponderModel');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        // ---- Prefix commands ----
        const prefix = process.env.PREFIX;
        if (message.content.startsWith(prefix)) {
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = client.prefixCommands.get(commandName);
            if (command) {
                try {
                    await command.execute(message, args);
                } catch (error) {
                    console.error(error);
                    message.reply('There was an error executing that command!');
                }
            }
        }

        // ---- AutoResponder ----
        try {
            const list = await AutoResponder.find({ guildId: message.guild.id });
            if (!list?.length) return;

            for (const a of list) {
                const content = message.content.toLowerCase();
                if (a.type === 'contains' && content.includes(a.trigger.toLowerCase())) {
                    return message.channel.send(a.response);
                }
                if (a.type === 'exact' && content.trim() === a.trigger.toLowerCase()) {
                    return message.channel.send(a.response);
                }
            }
        } catch (err) {
            console.error('Autoresponder error', err);
        }
    }
};
