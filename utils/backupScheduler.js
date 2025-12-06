// utils/backupScheduler.js
const AutoBackup = require('../models/autoBackupModel');
const Backup = require('../models/backupModel');
const { serializeGuild } = require('./backupUtils');

const timers = new Map();

async function runBackupForGuild(guildId, client) {
  try {
    const guild = await client.guilds.fetch(guildId).catch(()=>null);
    if (!guild) return;
    const snapshot = await serializeGuild(guild);
    const backup = new Backup({ guildId, data: snapshot, authorId: 'auto' });
    await backup.save();
    await AutoBackup.findOneAndUpdate({ guildId }, { lastRun: new Date() });
    console.log(`Auto-backup created for ${guildId}`);
  } catch (e) {
    console.error('Auto-backup error:', e);
  }
}

async function scheduleGuild(guildId, clientInstance) {
  // cancel existing
  cancelGuild(guildId);
  const cfg = await AutoBackup.findOne({ guildId });
  if (!cfg || !cfg.enabled || !cfg.intervalMs) return;
  const fn = () => runBackupForGuild(guildId, clientInstance);
  const id = setInterval(fn, cfg.intervalMs);
  timers.set(guildId, id);
  // run immediately once
  fn();
}

function cancelGuild(guildId) {
  const id = timers.get(guildId);
  if (id) clearInterval(id);
  timers.delete(guildId);
}

// Call this once at bot start to schedule all
async function initAll(clientInstance) {
  const list = await AutoBackup.find({ enabled: true });
  for (const cfg of list) {
    scheduleGuild(cfg.guildId, clientInstance);
  }
}

module.exports = { scheduleGuild, cancelGuild, initAll };
