const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  messageId: String,
  prize: String,
  hostId: String,
  endsAt: Date,
  winnersCount: { type: Number, default: 1 },
  ended: { type: Boolean, default: false },
  entrants: [String]
});

module.exports = mongoose.model('Giveaway', giveawaySchema);
