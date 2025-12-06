// events/interactionCreate.js
const Ticket = require('../models/ticketModel');
const Backup = require('../models/backupModel');
const { previewRestore, applyRestore } = require('../utils/backupRestore');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      // --- STRING SELECT MENU ---
      if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'backup_select') {
          const id = interaction.values[0];
          if (!/^[a-f0-9]{24}$/i.test(id)) {
            return interaction.reply({ content: 'Invalid backup id selected.', ephemeral: true });
          }

          const backup = await Backup.findById(id);
          if (!backup) return interaction.reply({ content: 'Backup not found.', ephemeral: true });

          const previewBtn = new ButtonBuilder()
            .setCustomId(`backup_preview:${id}`)
            .setLabel('Preview')
            .setStyle(ButtonStyle.Secondary);

          const loadBtn = new ButtonBuilder()
            .setCustomId(`backup_load_confirm:${id}:all`)
            .setLabel('Load (Dry-Run)')
            .setStyle(ButtonStyle.Danger);

          const deleteBtn = new ButtonBuilder()
            .setCustomId(`backup_delete:${id}`)
            .setLabel('Delete')
            .setStyle(ButtonStyle.Secondary);

          const row = new ActionRowBuilder().addComponents(previewBtn, loadBtn, deleteBtn);

          const embed = new EmbedBuilder()
            .setTitle('Backup Selected')
            .setDescription(`ID: \`\`\`${id}\`\`\``)
            .addFields([{ name: 'Created', value: backup.createdAt.toISOString(), inline: false }])
            .setColor(0xbb2f34)
            .setTimestamp();

          return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }
      }

      // --- BUTTONS ---
      if (interaction.isButton()) {
        const [actionPart, id, extra] = interaction.customId.split(':');

        // Preview Backup
        if (actionPart === 'backup_preview') {
          const backup = await Backup.findById(id);
          if (!backup) return interaction.reply({ content: 'Backup not found.', ephemeral: true });

          const preview = await previewRestore(backup, 'all');
          return interaction.reply({ content: `Preview:\n${preview.detail.join('\n')}`, ephemeral: true });
        }

        // Dry-Run Load Backup
        if (actionPart === 'backup_load_confirm') {
          const part = extra || 'all';
          const backup = await Backup.findById(id);
          if (!backup) return interaction.reply({ content: 'Backup not found.', ephemeral: true });

          const preview = await previewRestore(backup, part);
          const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`backup_load_apply:${id}:${part}`)
              .setLabel('Confirm Load (Apply)')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId(`backup_load_cancel:${id}`)
              .setLabel('Cancel')
              .setStyle(ButtonStyle.Secondary)
          );

          return interaction.reply({ content: `Dry-run preview:\n${preview.detail.join('\n')}`, components: [confirmRow], ephemeral: true });
        }

        // Apply Backup
        if (actionPart === 'backup_load_apply') {
          const part = extra || 'all';
          const backup = await Backup.findById(id);
          if (!backup) return interaction.reply({ content: 'Backup not found.', ephemeral: true });

          await interaction.deferReply({ ephemeral: true });
          const res = await applyRestore(backup, interaction.guild, part);
          return interaction.editReply({ content: `Apply results:\n${(res.created || []).join('\n') || 'No changes applied.'}` });
        }

        // Delete Backup
        if (actionPart === 'backup_delete') {
          await Backup.findByIdAndDelete(id);
          return interaction.reply({ content: `Backup ${id} deleted.`, ephemeral: true });
        }
      }

      // --- SLASH COMMANDS ---
      if (interaction.isChatInputCommand()) {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, client);
      }
    } catch (err) {
      console.error('Interaction handler error:', err);
      if (!interaction.replied && !interaction.deferred) {
        interaction.reply({ content: 'An error occurred.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
