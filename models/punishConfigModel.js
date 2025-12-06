const mongoose = require('mongoose');

const pcSchema = new mongoose.Schema({
  guildId: String,
  thresholds: [{ warns: Number, action: { type: String, enum: ['none','mute','kick','ban'] }, duration: Number }] // duration for mute in minutes
});

module.exports = mongoose.model('PunishConfig', pcSchema);
