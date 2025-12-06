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
            return interaction.reply({ content: 'Invalid backup id selected.', flags: 64 });
          }
          const backup = await Backup.findById(id);
          if (!backup) return interaction.reply({ content: 'Backup not found.', flags: 64 });

          const previewBtn = new ButtonBuilder().setCustomId(`backup_preview:${id}`).setLabel('Preview').setStyle(ButtonStyle.Secondary);
          const loadBtn = new ButtonBuilder().setCustomId(`backup_load_confirm:${id}:all`).setLabel('Load (Dry-Run)').setStyle(ButtonStyle.Danger);
          const deleteBtn = new ButtonBuilder().setCustomId(`backup_delete:${id}`).setLabel('Delete').setStyle(ButtonStyle.Secondary);
          const row = new ActionRowBuilder().addComponents(previewBtn, loadBtn, deleteBtn);

          const embed = new EmbedBuilder()
            .setTitle('Backup selected')
            .setDescription(`ID: \`\`\`${id}\`\`\``)
            .addFields({ name: 'Created', value: backup.createdAt.toISOString() })
            .setColor(0xbb2f34)
            .setTimestamp();

          return interaction.reply({ embeds: [embed], components: [row], flags: 64 });
        }
      }

      // --- BUTTONS ---
      if (interaction.isButton()) {
        const [actionPart, id, extra] = interaction.customId.split(':'); // e.g. backup_preview:ID
        if (actionPart === 'backup_preview') {
          const backupId = id;
          const backup = await Backup.findById(backupId);
          if (!backup) return interaction.reply({ content: 'Backup not found.', flags: 64 });

          const preview = await previewRestore(backup, 'all');
          return interaction.reply({ content: `Preview:\n${preview.detail.join('\n')}`, flags: 64 });
        }

        if (actionPart === 'backup_load_confirm') {
          const part = extra || 'all';
          const backup = await Backup.findById(id);
          if (!backup) return interaction.reply({ content: 'Backup not found.', flags: 64 });

          // Preview first
          const preview = await previewRestore(backup, part);
          const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`backup_load_apply:${id}:${part}`).setLabel('Confirm Load (Apply)').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`backup_load_cancel:${id}`).setLabel('Cancel').setStyle(ButtonStyle.Secondary)
          );

          return interaction.reply({ content: `Dry-run preview:\n${preview.detail.join('\n')}`, components: [confirmRow], flags: 64 });
        }

        if (actionPart === 'backup_load_apply') {
          const part = extra || 'all';
          const backup = await Backup.findById(id);
          if (!backup) return interaction.reply({ content: 'Backup not found.', flags: 64 });

          // apply restore carefully (role creation implemented minimally)
          await interaction.deferReply({ flags: 64 });
          const res = await applyRestore(backup, interaction.guild, part);
          return interaction.editReply({ content: `Apply results:\n${(res.created||[]).join('\n') || 'No changes applied.'}` });
        }

        if (actionPart === 'backup_delete') {
          const backupId = id;
          await Backup.findByIdAndDelete(backupId);
          return interaction.reply({ content: `Backup ${backupId} deleted.`, flags: 64 });
        }
      }

      // --- existing slash command handler ---
      if (interaction.isChatInputCommand()) {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, client);
      }
    } catch (err) {
      console.error('Interaction handler error:', err);
      if (!interaction.replied && !interaction.deferred) interaction.reply({ content: 'An error occurred.', flags: 64 }).catch(()=>{});
    }
  }
};
