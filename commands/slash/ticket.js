const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket system: panel / open / close')
    .addSubcommand(sc => sc.setName('panel').setDescription('Create a ticket panel (admin only)'))
    .addSubcommand(sc => sc.setName('open').setDescription('Open a ticket (creates ticket channel)'))
    .addSubcommand(sc => sc.setName('close').setDescription('Close the ticket (in ticket channel)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'panel') {
      const openBtn = new ButtonBuilder().setCustomId('ticket_open').setLabel('🎫 Open Ticket').setStyle(ButtonStyle.Primary);
      const row = new ActionRowBuilder().addComponents(openBtn);
      await interaction.reply({ content: 'Ticket panel created.', ephemeral: true });
      await interaction.channel.send({ embeds: [{ title: 'Support Tickets', description: 'Click the button to open a ticket.' }], components: [row] });
      return;
    }

    if (sub === 'open') {
      // Create a ticket channel for this user
      const guild = interaction.guild;
      const name = `ticket-${interaction.user.username}`.toLowerCase().slice(0, 90);
      const channel = await guild.channels.create({
        name,
        type: 0, // GuildText
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: ['ViewChannel'] },
          { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
        ]
      });

      // Add close button
      const closeBtn = new ButtonBuilder().setCustomId('ticket_close').setLabel('🔒 Close Ticket').setStyle(ButtonStyle.Danger);
      await channel.send({ content: `<@${interaction.user.id}> thanks — staff will join shortly.`, components: [new ActionRowBuilder().addComponents(closeBtn)] });

      // Save ticket to DB
      const Ticket = require('../../models/ticketModel');
      const t = new Ticket({ guildId: guild.id, channelId: channel.id, userId: interaction.user.id });
      await t.save();

      await interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
      return;
    }

    if (sub === 'close') {
      // Close ticket by command: only allow in ticket channels
      const Ticket = require('../../models/ticketModel');
      const ticket = await Ticket.findOne({ channelId: interaction.channelId });
      if (!ticket) return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });

      ticket.status = 'closed';
      ticket.closedAt = new Date();
      await ticket.save();

      // Optionally save transcript (not implemented: placeholder)
      await interaction.reply({ content: 'Ticket closed. Generating transcript...', ephemeral: true });
      await interaction.channel.setName(`closed-${interaction.channel.name}`).catch(()=>{});
      // Optionally remove permissions
      await interaction.channel.permissionOverwrites.edit(ticket.userId, { ViewChannel: false }).catch(()=>{});
      return;
    }
  }
};
