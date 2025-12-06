const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const AutoResponder = require('../../models/autoresponderModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoresponder')
    .setDescription('Manage autoresponders')
    .addSubcommand(sc => sc.setName('add').setDescription('Add an autoresponder')
      .addStringOption(o => o.setName('trigger').setDescription('Trigger text').setRequired(true))
      .addStringOption(o => o.setName('response').setDescription('Response text').setRequired(true))
      .addStringOption(o => o.setName('type').setDescription('Match type').addChoices({ name:'contains', value:'contains' }, { name:'exact', value:'exact' })))
    .addSubcommand(sc => sc.setName('remove').setDescription('Remove by id').addStringOption(o => o.setName('id').setDescription('Autoresponder ID').setRequired(true)))
    .addSubcommand(sc => sc.setName('list').setDescription('List autoresponders'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'add') {
      const trigger = interaction.options.getString('trigger');
      const response = interaction.options.getString('response');
      const type = interaction.options.getString('type') || 'contains';
      const a = new AutoResponder({ guildId: interaction.guildId, trigger, response, type });
      await a.save();
      return interaction.reply({ content: `Autoresponder added (ID: ${a.id})`, ephemeral: true });
    }
    if (sub === 'remove') {
      const id = interaction.options.getString('id');
      await AutoResponder.findByIdAndDelete(id);
      return interaction.reply({ content: 'Autoresponder removed.', ephemeral: true });
    }
    if (sub === 'list') {
      const list = await AutoResponder.find({ guildId: interaction.guildId });
      if (!list.length) return interaction.reply({ content: 'No autoresponders.', ephemeral: true });
      const text = list.map(a => `${a.id} — [${a.type}] "${a.trigger}" => "${a.response}"`).join('\n');
      return interaction.reply({ content: text, ephemeral: true });
    }
  }
};
