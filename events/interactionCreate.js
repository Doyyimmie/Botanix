const Ticket = require('../models/ticketModel');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      if (interaction.isButton()) {
        const id = interaction.customId;

        if (id === 'ticket_open') {
          // emulate /ticket open
          const guild = interaction.guild;
          const name = `ticket-${interaction.user.username}`.toLowerCase().slice(0, 90);
          const channel = await guild.channels.create({
            name,
            type: 0,
            permissionOverwrites: [
              { id: guild.roles.everyone.id, deny: ['ViewChannel'] },
              { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
            ]
          });
          const closeBtn = new ButtonBuilder().setCustomId('ticket_close').setLabel('🔒 Close Ticket').setStyle(4);
          await channel.send({ content: `<@${interaction.user.id}> Ticket created. Staff will be with you shortly.`, components: [new ActionRowBuilder().addComponents(closeBtn)] });

          const t = new Ticket({ guildId: guild.id, channelId: channel.id, userId: interaction.user.id });
          await t.save();
          return interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
        }

        if (id === 'ticket_close') {
          const ticket = await Ticket.findOne({ channelId: interaction.channelId });
          if (!ticket) return interaction.reply({ content: 'Not a ticket channel.', ephemeral: true });

          ticket.status = 'closed';
          ticket.closedAt = new Date();
          await ticket.save();

          // Change name and disable user view
          await interaction.channel.setName(`closed-${interaction.channel.name}`).catch(()=>{});
          await interaction.channel.permissionOverwrites.edit(ticket.userId, { ViewChannel: false }).catch(()=>{});
          return interaction.reply({ content: 'Ticket closed.', ephemeral: true });
        }
      }

      // existing slash command handling (if any)
      if (interaction.isChatInputCommand()) {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, client);
      }
    } catch (err) {
      console.error('Interaction handler error:', err);
      if (!interaction.replied) interaction.reply({ content: 'An error occurred.', ephemeral: true }).catch(()=>{});
    }
  }
};
