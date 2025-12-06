const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get user avatar')
        .addUserOption(option => option.setName('user').setDescription('Select a user')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        await interaction.reply(`${user.name}: ${user.displayAvatarURL({ dynamic: true })}`);
    }
};