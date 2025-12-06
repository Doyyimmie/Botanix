const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get information about this server'),
  async execute(interaction) {
    const { guild } = interaction;
    await interaction.reply(`Server name: ${guild.name}\nMembers: ${guild.memberCount}\nCreated at: ${guild.createdAt}`);
  }
};
