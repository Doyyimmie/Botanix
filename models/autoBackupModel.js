// models/autoBackupModel.js
const mongoose = require('mongoose');

const autoBackupSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  intervalMs: { type: Number, default: 0 }, // milliseconds
  lastRun: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('AutoBackup', autoBackupSchema);
