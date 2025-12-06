const Warn = require('../models/warnModel');
const PunishConfig = require('../models/punishConfigModel');

async function applyPunishments(client, guildId, userId) {
  const warns = await Warn.countDocuments({ guildId, userId });
  const cfg = await PunishConfig.findOne({ guildId });
  if (!cfg) return;
  // find highest threshold <= warns
  const sorted = cfg.thresholds.sort((a,b)=>a.warns-b.warns);
  let chosen = null;
  for (const t of sorted) if (warns >= t.warns) chosen = t;
  if (!chosen || chosen.action === 'none') return;
  const guild = client.guilds.cache.get(guildId);
  const member = guild?.members.cache.get(userId) || await guild?.members.fetch(userId).catch(()=>null);
  if (!member) return;
  if (chosen.action === 'kick') return member.kick(`Auto-punish after ${warns} warns`);
  if (chosen.action === 'ban') return guild.members.ban(userId, { reason: `Auto-punish after ${warns} warns` });
  if (chosen.action === 'mute') {
    const ms = (chosen.duration || 10) * 60 * 1000;
    await member.timeout(ms, `Auto-mute after ${warns} warns`).catch(()=>null);
  }
}

module.exports = { applyPunishments };
