#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh postgres:5432
pnpm db:migrate:deploy
pnpm db:seed
pnpm start:prod
