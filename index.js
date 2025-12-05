require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Prefix commands collection
client.prefixCommands = new Collection();

// Slash commands collection
client.slashCommands = new Collection();

// MongoDB connection
require('./utils/mongo');

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

// Register slash commands globally
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
  try {
    console.log('Started refreshing slash commands.');
    await rest.put(
      Routes.applicationCommands(client.user?.id || process.env.CLIENT_ID),
      { body: slashData }
    );
    console.log('Sucessfully reloaded slash commands.');
  } catch (error) {
    console.error(error);
  } 
})();

client.login(process.env.TOKEN);
