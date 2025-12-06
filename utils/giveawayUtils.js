const Giveaway = require('../models/giveawayModel');

async function endGiveaway(client, giveawayId) {
  const g = await Giveaway.findById(giveawayId);
  if (!g || g.ended) return;
  const channel = await client.channels.fetch(g.channelId).catch(()=>null);
  if (!channel) return;
  // fetch message reactions to get entrants OR use stored entrants
  let entrants = g.entrants || [];
  if (!entrants.length) {
    try {
      const msg = await channel.messages.fetch(g.messageId);
      const reaction = msg.reactions.cache.first();
      if (reaction) {
        const users = await reaction.users.fetch();
        entrants = users.filter(u => !u.bot).map(u => u.id);
      }
    } catch (err) { console.error(err); }
  }
  if (!entrants.length) {
    channel.send('No entrants for the giveaway.');
    g.ended = true; await g.save(); return;
  }
  // pick winners
  const winners = [];
  while (winners.length < Math.min(g.winnersCount, entrants.length)) {
    const pick = entrants[Math.floor(Math.random() * entrants.length)];
    if (!winners.includes(pick)) winners.push(pick);
  }
  g.ended = true;
  await g.save();
  channel.send(`Giveaway ended! Prize: **${g.prize}**\nWinners: ${winners.map(id => `<@${id}>`).join(', ')}`);
}

module.exports = { endGiveaway };
