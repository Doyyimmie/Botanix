const { 
  SlashCommandBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  PermissionFlagsBits, 
  EmbedBuilder, 
  ChannelType 
} = require('discord.js');

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
      // Botão para abrir ticket
      const openBtn = new ButtonBuilder()
        .setCustomId('ticket_open')
        .setLabel('🎫 Open Ticket')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(openBtn);

      // Embed para painel de ticket
      const embed = new EmbedBuilder()
        .setTitle('Support Tickets')
        .setDescription('Click the button below to open a ticket.')
        .setColor('Blue');

      await interaction.reply({ content: 'Ticket panel created.', ephemeral: true });
      await interaction.channel.send({ embeds: [embed], components: [row] });
      return;
    }

    if (sub === 'open') {
      const guild = interaction.guild;

      // Nome do canal limitado a 90 caracteres
      const name = `ticket-${interaction.user.username}`.toLowerCase().slice(0, 90);

      // Criação do canal de ticket
      const channel = await guild.channels.create({
        name,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: ['ViewChannel'] },
          { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
        ],
      });

      // Botão para fechar ticket
      const closeBtn = new ButtonBuilder()
        .setCustomId('ticket_close')
        .setLabel('🔒 Close Ticket')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(closeBtn);

      const embed = new EmbedBuilder()
        .setTitle('Ticket Opened')
        .setDescription(`<@${interaction.user.id}>, thanks — staff will join shortly.`)
        .setColor('Green');

      await channel.send({ embeds: [embed], components: [row] });

      // Salvar ticket no banco
      const Ticket = require('../../models/ticketModel');
      const t = new Ticket({ guildId: guild.id, channelId: channel.id, userId: interaction.user.id });
      await t.save();

      await interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
      return;
    }

    if (sub === 'close') {
      const Ticket = require('../../models/ticketModel');
      const ticket = await Ticket.findOne({ channelId: interaction.channelId });

      if (!ticket) {
        return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });
      }

      ticket.status = 'closed';
      ticket.closedAt = new Date();
      await ticket.save();

      // Embed de fechamento
      const embed = new EmbedBuilder()
        .setTitle('Ticket Closed')
        .setDescription('Ticket closed. Generating transcript...')
        .setColor('Red');

      await interaction.reply({ embeds: [embed], ephemeral: true });

      // Alterar nome do canal e remover permissão do usuário
      await interaction.channel.setName(`closed-${interaction.channel.name}`).catch(() => {});
      await interaction.channel.permissionOverwrites.edit(ticket.userId, { ViewChannel: false }).catch(() => {});
      return;
    }
  }
};
