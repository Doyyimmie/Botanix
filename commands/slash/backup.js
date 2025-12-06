// commands/slash/backup.js
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const Backup = require('../../models/backupModel');
const AutoBackup = require('../../models/autoBackupModel');
const { serializeGuild } = require('../../utils/backupUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('backup')
    .setDescription('Create/load backups of the server')
    .addSubcommand(sc => sc.setName('create').setDescription('Create a backup'))
    .addSubcommand(sc => sc.setName('info').setDescription('List backups for this guild'))
    .addSubcommand(sc => sc.setName('load').setDescription('Load a backup (admin only)').addStringOption(o => o.setName('id').setDescription('Backup ID').setRequired(true)).addStringOption(o => o.setName('part').setDescription('Which part to restore (roles|channels|permissions|all)').setRequired(false)))
    .addSubcommand(sc => sc.setName('auto').setDescription('Auto backup controls').addStringOption(o => o.setName('action').setDescription('enable|disable').setRequired(true)).addStringOption(o => o.setName('interval').setDescription('interval in hours when enabling').setRequired(false)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guild = interaction.guild;

    // --- CREATE ---
    if (sub === 'create') {
      await interaction.deferReply({ flags: 64 });

      const snapshot = await serializeGuild(guild);

      const backup = new Backup({
        guildId: guild.id,
        data: snapshot,
        authorId: interaction.user.id
      });

      await backup.save();

      const embed = new EmbedBuilder()
        .setTitle('Backup created')
        .setColor(0xbb2f34)
        .addFields(
          { name: 'ID', value: `\`\`\`${backup._id.toString()}\`\`\`` },
          { name: 'Author', value: `<@${interaction.user.id}>` },
          { name: 'Items', value: `Roles: ${snapshot.roles.length}, Channels: ${snapshot.channels.length}` }
        )
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    // --- INFO ---
    if (sub === 'info') {
      const list = await Backup.find({ guildId: guild.id }).sort({ createdAt: -1 }).limit(25);
      if (!list.length) return interaction.reply({ content: 'No backups found.', flags: 64 });

      const menu = new StringSelectMenuBuilder()
        .setCustomId('backup_select')
        .setPlaceholder('Choose a backup to preview/load')
        .addOptions(
          list.map(b => ({
            label: `Backup ${b._id.toString().slice(0, 6)}`,
            description: `Created: ${b.createdAt.toISOString().slice(0,19)}`,
            value: b._id.toString()
          }))
        );

      const row = new ActionRowBuilder().addComponents(menu);

      const text = list.map(b => `• **${b._id}** — ${b.createdAt.toISOString()} (by ${b.authorId})`).join('\n');

      return interaction.reply({ content: `Backups found:\n${text}`, components: [row], flags: 64 });
    }

    // --- LOAD (direct via option) ---
    if (sub === 'load') {
      const id = interaction.options.getString('id');
      const part = interaction.options.getString('part') || 'all';

      if (!/^[a-f0-9]{24}$/i.test(id)) return interaction.reply({ content: 'Invalid ID format. Use only the 24-character ObjectId.', flags: 64 });

      const backup = await Backup.findById(id);
      if (!backup) return interaction.reply({ content: 'Backup not found.', flags: 64 });

      // Build confirmation buttons
      const previewBtn = new ButtonBuilder().setCustomId(`backup_preview:${id}`).setLabel('Preview').setStyle(ButtonStyle.Secondary);
      const loadBtn = new ButtonBuilder().setCustomId(`backup_load_confirm:${id}:${part}`).setLabel('Load (Dry-Run)').setStyle(ButtonStyle.Danger);
      const deleteBtn = new ButtonBuilder().setCustomId(`backup_delete:${id}`).setLabel('Delete').setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(previewBtn, loadBtn, deleteBtn);

      const embed = new EmbedBuilder()
        .setTitle('Backup selected')
        .setColor(0xbb2f34)
        .addFields(
          { name: 'ID', value: `\`\`\`${id}\`\`\`` },
          { name: 'Author', value: `\`${backup.authorId}\`` },
          { name: 'Created', value: backup.createdAt.toISOString() },
          { name: 'Parts', value: `roles: ${backup.data.roles?.length || 0}, channels: ${backup.data.channels?.length || 0}` }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed], components: [row], flags: 64 });
    }

    // --- AUTO (enable/disable) ---
    if (sub === 'auto') {
      const action = interaction.options.getString('action');
      const intervalStr = interaction.options.getString('interval') || null;

      if (action === 'enable') {
        const hours = Math.max(1, Math.min(168, parseFloat(intervalStr || '24'))); // 1h..168h
        // save config
        const ms = hours * 60 * 60 * 1000;
        await AutoBackup.findOneAndUpdate({ guildId: guild.id }, { enabled: true, intervalMs: ms, lastRun: new Date() }, { upsert: true, new: true });
        require('../../utils/backupScheduler').scheduleGuild(guild.id); // reload scheduler
        return interaction.reply({ content: `Auto-backup enabled every ${hours} hour(s).`, flags: 64 });
      } else {
        await AutoBackup.findOneAndUpdate({ guildId: guild.id }, { enabled: false }, { upsert: true, new: true });
        require('../../utils/backupScheduler').cancelGuild(guild.id);
        return interaction.reply({ content: 'Auto-backup disabled.', flags: 64 });
      }
    }
  }
};
