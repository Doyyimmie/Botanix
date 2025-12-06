const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Suggestion = require('../../models/suggestionModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Create or manage suggestions')
    .addSubcommand(sc => sc.setName('submit').setDescription('Submit a suggestion').addStringOption(o => o.setName('text').setRequired(true)))
    .addSubcommand(sc => sc.setName('list').setDescription('List recent suggestions').addIntegerOption(o => o.setName('limit').setRequired(false)))
    .addSubcommand(sc => sc.setName('handle').setDescription('Approve or deny a suggestion').addStringOption(o => o.setName('id').setRequired(true)).addStringOption(o => o.setName('action').setRequired(true).addChoices({ name:'approve', value:'approve' },{ name:'deny', value:'deny' })))
    .setDefaultMemberPermissions(0),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'submit') {
      const text = interaction.options.getString('text');
      const s = new Suggestion({ guildId: interaction.guildId, userId: interaction.user.id, content: text });
      await s.save();

      // post to current channel with reaction buttons
      const up = new ButtonBuilder().setCustomId(`s_up_${s.id}`).setLabel('👍').setStyle(ButtonStyle.Success);
      const down = new ButtonBuilder().setCustomId(`s_down_${s.id}`).setLabel('👎').setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(up, down);

      const msg = await interaction.channel.send({ embeds: [{ title: 'New suggestion', description: text, footer: { text: `ID: ${s.id}` } }], components: [row] });
      s.messageId = msg.id; s.channelId = msg.channel.id;
      await s.save();
      return interaction.reply({ content: 'Suggestion submitted!', ephemeral: true });
    }

    if (sub === 'list') {
      const limit = interaction.options.getInteger('limit') || 5;
      const list = await Suggestion.find({ guildId: interaction.guildId }).sort({ createdAt: -1 }).limit(limit);
      if (!list.length) return interaction.reply({ content: 'No suggestions found.', ephemeral: true });
      const text = list.map(s => `ID:${s.id} [${s.status}] ${s.content.slice(0,80)} — by <@${s.userId}>`).join('\n');
      return interaction.reply({ content: text, ephemeral: true });
    }

    if (sub === 'handle') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: 'No permission', ephemeral: true });
      const id = interaction.options.getString('id');
      const action = interaction.options.getString('action');
      const s = await Suggestion.findById(id);
      if (!s) return interaction.reply({ content: 'Suggestion not found', ephemeral: true });
      s.status = action === 'approve' ? 'approved' : 'denied';
      s.handledBy = interaction.user.tag; s.handledAt = new Date();
      await s.save();
      return interaction.reply({ content: `Suggestion ${action}d.`, ephemeral: true });
    }
  }
};
