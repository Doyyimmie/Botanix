const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  content: String,
  status: { type: String, default: 'pending' }, // pending / approved / denied
  votes: {
    up: { type: Number, default: 0 },
    down: { type: Number, default: 0 }
  },
  messageId: String, // if posted to suggestion channel
  channelId: String,
  createdAt: { type: Date, default: Date.now },
  handledBy: String,
  handledAt: Date
});

module.exports = mongoose.model('Suggestion', suggestionSchema);
