#!/usr/bin/env bash
set -e

# Wait for Postgres to be ready
/opt/wait-for-it.sh postgres:5432

# Run database migrations and seeds
pnpm db:migrate:deploy
pnpm db:seed

# Start the application in the foreground
pnpm start:prod --port 3000