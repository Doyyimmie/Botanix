require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const connectMongo = require('./utils/mongo');
const deploySlash = require('./utils/deploySlash');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ----------------- Collections -----------------
client.prefixCommands = new Collection();
client.slashCommands = new Collection();

// ----------------- Connect MongoDB -----------------
connectMongo();

// ----------------- Load Events -----------------
fs.readdirSync('./events')
  .filter(f => f.endsWith('.js'))
  .forEach(file => {
    const event = require(`./events/${file}`);
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));
  });

// ----------------- Load Prefix Commands -----------------
fs.readdirSync('./commands/prefix')
  .filter(f => f.endsWith('.js'))
  .forEach(file => {
    const command = require(`./commands/prefix/${file}`);
    client.prefixCommands.set(command.name, command);
  });

// ----------------- Load Slash Commands -----------------
fs.readdirSync('./commands/slash')
  .filter(f => f.endsWith('.js'))
  .forEach(file => {
    const command = require(`./commands/slash/${file}`);
    client.slashCommands.set(command.data.name, command);
  });

// ----------------- Login and Deploy Slash Commands -----------------
client.login(process.env.TOKEN).then(() => {
  console.log('Bot logged in.');
  deploySlash(client);
});
