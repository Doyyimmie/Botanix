const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  guildId: String,
  emoji: { type: String, default: '⭐' },
  threshold: { type: Number, default: 5 },
  highlightsChannelId: String,
  enabled: { type: Boolean, default: true }
});

module.exports = mongoose.model('HighlightConfig', schema);
