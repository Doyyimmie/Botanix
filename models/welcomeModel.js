const mongoose = require('mongoose');

const welcomeSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    channelId: {
        type: String,
        default: null
    },
    message: {
        type: String,
        default: "Welcome {user} to {guild}"
    },
    enabled: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('WelcomeCOnfig', welcomeSchema);