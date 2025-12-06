const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord-api-types/v10");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Open a support ticket'),
    async execute(interaction) {
        const chennel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel]
                }
            ],
        });
        await interaction.reply({
            content: `Ticket created: ${chennel}`,
            ephemeral: true
        });
    }
};