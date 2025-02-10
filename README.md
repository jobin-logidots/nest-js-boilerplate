# NestJS TypeScript REST API PrismaORM Starter

![github action status](https://github.com/jobin-logidots/nest-js-boilerplate/actions/workflows/docker-e2e.yml/badge.svg)
[![renovate](https://img.shields.io/badge/renovate-enabled-%231A1F6C?logo=renovatebot)](https://app.renovatebot.com/dashboard)

## Description

This is a fork of [Artem Shchirov's NestJS Starter](https://github.com/artshchirov/nest-js-boilerplate), enhanced with Prisma ORM integration and improved Docker support. The boilerplate provides a robust foundation for building REST APIs with NestJS, featuring seamless database management through Prisma, complete Docker containerization, and various pre-configured essential features for modern web applications.

[Full documentation here](/docs/readme.md)

## Table of Contents <!-- omit in toc -->

- [Features](#features)
- [Todo](#todo)
- [Quick run](#quick-run)
- [Comfortable development](#comfortable-development)
- [Links](#links)
- [Automatic update of dependencies](#automatic-update-of-dependencies)
- [Database utils](#database-utils)
- [Tests](#tests)
- [Tests in Docker](#tests-in-docker)
- [Test benchmarking](#test-benchmarking)

## Features

- [x] Database ([prisma](https://www.npmjs.com/package/prisma)).
- [x] Seeding.
- [x] Config Service ([@nestjs/config](https://www.npmjs.com/package/@nestjs/config)).
- [x] Mailing ([nodemailer](https://www.npmjs.com/package/nodemailer)).
- [x] Engagespot. (TODO)
- [x] Sign in and sign up via email.
- [x] Social sign in (Apple, Facebook, Google, Twitter).
- [x] Admin and User roles.
- [x] I18N ([nestjs-i18n](https://www.npmjs.com/package/nestjs-i18n)).
- [x] File uploads. Support local and Amazon S3 drivers.
- [x] Swagger.
- [x] E2E and units tests.
- [x] Docker.
- [x] CI (Github Actions).  TODO


## Quick run

```bash
git clone --depth 1 https://github.com/jobin-logidots/nest-js-boilerplate.git
cd my-app/
cp env-example .env
docker compose up -d
```

For check status run

```bash
docker compose logs
```

## Comfortable development

```bash
git clone --depth 1 https://github.com/jobin-logidots/nest-js-boilerplate.git my-app
cd my-app/
cp env-example .env
```

Change `DATABASE_HOST=postgres` to `DATABASE_HOST=localhost`

Change `MAIL_HOST=maildev` to `MAIL_HOST=localhost`

Run additional container:

```bash
docker compose up -d postgres adminer maildev
```

```bash
pnpm install

pnpm run env:local:up

pnpm run db:migrate:dev

pnpm run db:seed

pnpm run start
```

## Links

- Swagger: <http://localhost:3001/docs>
- Adminer (client for DB): <http://localhost:8080>
- Maildev: <http://localhost:1080>

## Automatic update of dependencies

If you want to automatically update dependencies, you can connect [Renovate](https://github.com/marketplace/renovate) for your project.

## Database utils

Generate migration

```bash
pnpm run db:migrate:dev:create
```

Run migration

```bash
pnpm run db:migrate:dev
```

Drop all tables in database

```bash
pnpm run db:reset
```

Run seed

```bash
pnpm run db:seed
```

## Tests

```bash
# unit tests
pnpm run test

# e2e tests
pnpm run test:e2e
```

## Tests in Docker

```bash
docker compose -f docker-compose.ci.yaml --env-file env-example -p ci up --build --exit-code-from api && docker compose -p ci rm -svf
```

## Test benchmarking

```bash
docker run --rm jordi/ab -n 100 -c 100 -T application/json -H "Authorization: Bearer USER_TOKEN" -v 2 http://<server_ip>:3001/api/v1/users
```
