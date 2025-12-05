require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Prefix commands collection
client.prefixCommands = new Collection();

// Slash commands collection
client.slashCommands = new Collection();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch(console.error);

// Load events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Load prefix commands
const prefixCommandFiles = fs.readdirSync('./commands/prefix').filter(file => file.endsWith('.js'));
for (const file of prefixCommandFiles) {
  const command = require(`./commands/prefix/${file}`);
  client.prefixCommands.set(command.name, command);
}

// Load slash commands
const slashCommandFiles = fs.readdirSync('./commands/slash').filter(file => file.endsWith('.js'));
for (const file of slashCommandFiles) {
  const command = require(`./commands/slash/${file}`);
  client.slashCommands.set(command.data.name, command);
}

client.login(process.env.TOKEN);
