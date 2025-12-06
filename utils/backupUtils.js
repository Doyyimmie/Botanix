async function serializeGuild(guild) {
  // Roles
  const roles = guild.roles.cache
    .filter(r => !r.managed)
    .sort((a,b) => b.position - a.position)
    .map(r => ({
      id: r.id,
      name: r.name,
      color: r.color,
      hoist: r.hoist,
      permissions: r.permissions.bitfield,
      position: r.position
    }));

  // Channels (keep structure)
  const channels = guild.channels.cache
    .sort((a,b) => a.position - b.position)
    .map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      parentId: c.parentId,
      position: c.position,
      permissionOverwrites: c.permissionOverwrites.cache.map(po => ({
        id: po.id,
        allow: po.allow.bitfield,
        deny: po.deny.bitfield
      }))
    }));

  // Basic guild info
  const info = {
    name: guild.name,
    region: guild.preferredLocale,
    icon: guild.iconURL()
  };

  return { roles, channels, info };
}

module.exports = { serializeGuild };
