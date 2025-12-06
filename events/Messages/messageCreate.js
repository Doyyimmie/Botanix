const AutoResponder = require('../models/autoresponderModel');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;
        if (!message.guild || !message.channel) return;

        // ---- Prefix commands ----
        const prefix = process.env.PREFIX;
        if (message.content.startsWith(prefix)) {
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = client.prefixCommands.get(commandName);
            if (command) {
                try {
                    await command.execute(message, args, client);
                } catch (error) {
                    console.error(error);
                    message.reply('There was an error executing that command!').catch(()=>{});
                }
            }
        }

        // ---- AutoResponder ----
        try {
            const list = await AutoResponder.find({ guildId: message.guild.id });
            if (!list?.length) return;

            const content = message.content.toLowerCase();

            for (const a of list) {
                const trigger = (a.trigger || '').toLowerCase();
                const response = a.response || '';

                if (!response) continue; // evita ValidationError

                if ((a.type === 'contains' && content.includes(trigger)) ||
                    (a.type === 'exact' && content.trim() === trigger)) {
                    message.channel.send(response).catch(console.error);
                    break; // só envia uma resposta por mensagem
                }
            }
        } catch (err) {
            console.error('Autoresponder error', err);
        }
    }
};
