const mongoose = require('mongoose');

const ubSchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  badgeId: String,
  awardedAt: { type: Date, default: Date.now }
});

// Evita OverwriteModelError
module.exports = mongoose.models.UserBadge || mongoose.model('UserBadge', ubSchema);
