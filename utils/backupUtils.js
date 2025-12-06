async function serializeGuild(guild) {
  if (!guild) return { roles: [], channels: [], info: {} };

  // Safe roles
  const roles = guild.roles?.cache
    ? guild.roles.cache
        .filter(r => !r.managed)
        .sort((a, b) => b.position - a.position)
        .map(r => ({
          id: r.id,
          name: r.name,
          color: r.color,
          hoist: r.hoist,
          permissions: r.permissions.bitfield,
          position: r.position
        }))
    : [];

  // Safe channels
  const channels = guild.channels?.cache
    ? guild.channels.cache
        .filter(c => !!c) // remove canais fantasmas
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          parentId: c.parentId ?? null,
          position: c.position ?? 0,
          permissionOverwrites: c.permissionOverwrites?.cache
            ? c.permissionOverwrites.cache.map(po => ({
                id: po.id,
                allow: po.allow.bitfield,
                deny: po.deny.bitfield
              }))
            : []
        }))
    : [];

  const info = {
    name: guild.name,
    region: guild.preferredLocale ?? null,
    icon: guild.iconURL() ?? null
  };

  return { roles, channels, info };
}

module.exports = { serializeGuild };
