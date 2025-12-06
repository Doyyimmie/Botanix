const mongoose = require('mongoose');

const ubSchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  badgeId: String,
  awardedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserBadge', ubSchema);
