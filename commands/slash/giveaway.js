const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Giveaway = require('../../models/giveawayModel');
const { endGiveaway } = require('../../utils/giveawayUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Manage giveaways: start/end/reroll')
    .addSubcommand(sc => sc.setName('start').setDescription('Start a giveaway').addStringOption(o => o.setName('prize').setRequired(true)).addIntegerOption(o => o.setName('duration').setDescription('seconds').setRequired(true)).addIntegerOption(o => o.setName('winners').setRequired(false)))
    .addSubcommand(sc => sc.setName('end').setDescription('End a giveaway').addStringOption(o => o.setName('id').setRequired(true)))
    .addSubcommand(sc => sc.setName('reroll').setDescription('Reroll a giveaway').addStringOption(o => o.setName('id').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      const prize = interaction.options.getString('prize');
      const duration = interaction.options.getInteger('duration');
      const winners = interaction.options.getInteger('winners') || 1;

      const msg = await interaction.channel.send({ embeds:[{ title:'Giveaway', description:`Prize: **${prize}**\nReact to enter!`}]});
      await msg.react('🎉');

      const g = new Giveaway({ guildId: interaction.guildId, channelId: interaction.channelId, messageId: msg.id, prize, hostId: interaction.user.id, endsAt: new Date(Date.now()+duration*1000), winnersCount: winners });
      await g.save();

      // schedule end
      setTimeout(() => endGiveaway(interaction.client, g.id), duration*1000);

      return interaction.reply({ content: `Giveaway started (id: ${g.id})`, ephemeral: true });
    }

    if (sub === 'end') {
      const id = interaction.options.getString('id');
      await endGiveaway(interaction.client, id);
      return interaction.reply({ content: 'Ending giveaway (if found).', ephemeral: true });
    }

    if (sub === 'reroll') {
      const id = interaction.options.getString('id');
      // simple reroll: find ended giveaway and pick new winners
      const g = await Giveaway.findById(id);
      if (!g) return interaction.reply({ content: 'Giveaway not found.', ephemeral: true });
      // reuse endGiveaway logic: mark ended=false and call endGiveaway
      g.ended = false; await g.save();
      await endGiveaway(interaction.client, id);
      return interaction.reply({ content: 'Rerolled giveaway.', ephemeral: true });
    }
  }
};
