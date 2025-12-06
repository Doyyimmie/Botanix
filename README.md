# Botanix Discord Bot

A multi-purpose Discord bot built with **Node.js**, **Discord.js v14**, **MongoDB**, and **dotenv**.  
Supports both **slash commands** and **prefix commands**, including moderation, AFK, giveaways, suggestions, auto-responders, badges, and more.

---

## ⚡ Features

- Moderation: warn, kick, mute, ban with auto-punishments  
- Tickets system  
- AFK system  
- Suggestions system (with voting and management)  
- AutoResponder (custom triggers and responses)  
- Status monitor (CPU, RAM, Ping, Uptime)  
- Giveaways / Raffles  
- Auto Highlights (reaction-based pin system)  
- Badges system (user achievements)  
- Logs and welcome messages  
- Configurable via MongoDB

---

## 🛠 Installation

1. Clone the repository:

```bash
git clone https://github.com/Doyyimie/Botanix.git
cd Botanix
````

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root folder:

```env
TOKEN=YOUR_BOT_TOKEN
MONGO_URI=YOUR_MONGO_URI
CLIENT_ID=YOUR_CLIENT_ID
LOG_CHANNEL_ID=OPTIONAL_LOG_CHANNEL_ID
```

4. Start the bot:

```bash
npm start
```

---

## ⚙ Commands

All commands are **slash commands** by default (`/`). Some **prefix commands** are still available.

**Examples:**

* `/suggest submit` – submit a suggestion
* `/autoresponder add` – create auto-response
* `/giveaway start` – start a giveaway
* `/afk set` – set AFK status
* `/warn` – warn a user (moderators only)
* `/highlight setchannel` – configure highlights channel
* `/badge create` – create a badge
* `/profile` – view user badges

> For a full command list, check the `commands/slash` folder.

---

## 🐳 Docker

Build and run the bot using Docker:

```bash
docker build -t botanix-bot .
docker run -d --name botanix-bot --env-file .env botanix-bot
```

---

## 📄 License

This project is licensed under the **Apache License 2.0**. See [LICENSE](./LICENSE) for details.