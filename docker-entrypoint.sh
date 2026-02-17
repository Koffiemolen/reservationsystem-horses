#!/bin/sh
set -e

# Ensure data directory exists
mkdir -p /app/data

# Run database migrations
echo "Running database migrations..."
npx prisma db push --skip-generate

# Optionally seed the database
if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts
fi

# Start the application
echo "Starting Next.js server..."
exec node server.js
