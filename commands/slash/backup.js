const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Backup = require('../../models/backupModel');
const { serializeGuild } = require('../../utils/backupUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('backup')
    .setDescription('Create/load backups of the server')
    .addSubcommand(sc => sc.setName('create').setDescription('Create a backup'))
    .addSubcommand(sc => sc.setName('info').setDescription('List backups for this guild'))
    .addSubcommand(sc => sc.setName('load').setDescription('Load a backup (admin only)').addStringOption(o => o.setName('id').setDescription('Backup id').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guild = interaction.guild;

    if (sub === 'create') {
      await interaction.deferReply({ ephemeral: true });
      const snapshot = await serializeGuild(guild);
      const backup = new Backup({ guildId: guild.id, data: snapshot, authorId: interaction.user.id });
      await backup.save();
      return interaction.editReply({ content: `Backup created with id: ${backup._id}` });
    }

    if (sub === 'info') {
      const list = await Backup.find({ guildId: guild.id }).sort({ createdAt: -1 }).limit(10);
      if (!list.length) return interaction.reply({ content: 'No backups found.', ephemeral: true });
      const text = list.map(b => `${b._id} — ${b.createdAt.toISOString()} by ${b.authorId}`).join('\n');
      return interaction.reply({ content: `Backups:\n${text}`, ephemeral: true });
    }

    if (sub === 'load') {
      const id = interaction.options.getString('id');
      const backup = await Backup.findById(id);
      if (!backup) return interaction.reply({ content: 'Backup not found.', ephemeral: true });
      // WARNING: restoring is potentially destructive. Here we just outline the steps.
      // For safety we won't auto-delete/create; provide instructions and a dry-run result.
      return interaction.reply({ content: 'Backup loaded (dry-run). Implement restoration logic carefully to avoid data loss.', ephemeral: true });
    }
  }
};
