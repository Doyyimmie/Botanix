const { REST, Routes } = require('discord.js');
const fs = require('fs');

module.exports = async (client) => {
    const commands = [];
    const slashFiles = fs.readdirSync('./commands/slash').filter(f => f.endsWith('.js'));

    for (const file of slashFiles) {
        const command = require(`../commands/slash/${file}`);
        client.slashCommands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        console.log('Started registering slash commands.');
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('Sucessfully registered slash commands.');
    } catch (error) {
        console.error(error);
    }
};