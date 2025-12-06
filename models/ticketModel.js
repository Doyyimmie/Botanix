const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  userId: String,
  status: { type: String, default: 'open' },
  createdAt: { type: Date, default: Date.now },
  closedAt: Date,
  transcript: String // optional: store transcript text or URL
});

module.exports = mongoose.model('Ticket', ticketSchema);
