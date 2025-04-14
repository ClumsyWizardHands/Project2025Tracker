FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

# Create docker-entrypoint.sh
COPY ../docker/backend/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 5000

# Set entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]

# Start the application
CMD ["npm", "run", "dev"]
