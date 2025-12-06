const mongoose = require('mongoose');

const autoSchema = new mongoose.Schema({
  guildId: String,
  trigger: String, // exact match or substring depending on mode
  response: String,
  type: { type: String, default: 'contains' } // contains | exact
});

module.exports = mongoose.model('AutoResponder', autoSchema);
