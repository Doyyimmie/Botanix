const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  guildId: String,
  createdAt: { type: Date, default: Date.now },
  data: mongoose.Schema.Types.Mixed, // store roles, channels and basic config JSON
  authorId: String,
  name: String
});

module.exports = mongoose.model('Backup', backupSchema);
