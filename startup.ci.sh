#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh postgres:5432
pnpm db:migrate:deploy
pnpm db:seed
pnpm start:prod > /dev/null 2>&1 &
/opt/wait-for-it.sh maildev:1080
/opt/wait-for-it.sh localhost:3000
pnpm lint
pnpm test:e2e -- --runInBand
