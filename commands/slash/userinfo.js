const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user')
    .addUserOption(option => option.setName('user').setDescription('Select a user')),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    await interaction.reply(`Username: ${user.username}\nID: ${user.id}\nAccount created: ${user.createdAt}`);
  }
};
