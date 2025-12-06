# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all source code
COPY . .

# Expose port (optional, e.g., for dashboard or webhooks)
EXPOSE 3000

# Environment variables will be loaded from .env file
# Make sure to provide .env when running container
# Example:
# docker run --env-file .env botanix-bot

# Start the bot
CMD ["node", "index.js"]
