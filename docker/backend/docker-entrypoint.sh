#!/bin/sh
set -e

# Wait for the database to be ready
echo "Waiting for PostgreSQL to start..."
until nc -z -v -w30 $DB_HOST $DB_PORT; do
  echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."
  sleep 2
done
echo "PostgreSQL is up and running!"

# Run database migrations if needed
if [ -f "./src/scripts/migrate.js" ]; then
  echo "Running database migrations..."
  node ./src/scripts/migrate.js
  echo "Migrations completed!"
fi

# Run database seed if needed and in development mode
if [ "$NODE_ENV" = "development" ] && [ -f "./src/scripts/seed.js" ]; then
  echo "Running database seed..."
  node ./src/scripts/seed.js
  echo "Seed completed!"
fi

# Execute the main command
exec "$@"
