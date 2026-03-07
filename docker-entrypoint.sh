#!/bin/sh
set -e

# Run database migrations before starting the server using the project-local Prisma CLI
echo "Running database migrations..."
node node_modules/prisma/build/index.js migrate deploy

echo "Starting server..."
exec node server.js
