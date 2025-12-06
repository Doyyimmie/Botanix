const mongoose = require('mongoose');

const afkSchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  reason: { type: String, default: 'AFK' },
  since: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AFK', afkSchema);
