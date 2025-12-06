// utils/backupRestore.js
const { PermissionsBitField } = require('discord.js');

async function previewRestore(backup, part) {
  // backup.data contains roles, channels, info
  const data = backup.data;
  const res = { part, detail: [] };

  if (part === 'roles' || part === 'all') {
    res.detail.push(`Roles to restore: ${data.roles?.length ?? 0}`);
  }
  if (part === 'channels' || part === 'all') {
    res.detail.push(`Channels to restore: ${data.channels?.length ?? 0}`);
  }
  if (part === 'permissions' || part === 'all') {
    res.detail.push(`Permission overwrites to restore: ${data.channels?.reduce((sum, c) => sum + (c.permissionOverwrites?.length || 0), 0)}`);
  }

  return res;
}

async function applyRestore(backup, guild, part) {
  // WARNING: destructive operations. Must be used carefully.
  // Implement minimal safe actions: create missing roles (no deletion).
  const data = backup.data;
  const results = { part, created: [], skipped: [] };

  if (part === 'roles' || part === 'all') {
    for (const r of data.roles || []) {
      // skip managed/system roles
      const existing = guild.roles.cache.find(x => x.name === r.name && x.position === r.position);
      if (existing) {
        results.skipped.push(`Role exists: ${r.name}`);
        continue;
      }
      // create role (permissions as integer)
      try {
        const created = await guild.roles.create({
          name: r.name || 'role',
          color: r.color || 0,
          hoist: !!r.hoist,
          permissions: BigInt(r.permissions || 0),
          reason: 'Backup restore (partial)'
        });
        results.created.push(`Created role: ${created.name}`);
      } catch (e) {
        results.skipped.push(`Failed role ${r.name}: ${e.message}`);
      }
    }
  }

  // Channels and permission restoration can be implemented similarly,
  // but are potentially destructive: omitted from auto-apply by default.
  // Return results summary:
  return results;
}

module.exports = { previewRestore, applyRestore };
