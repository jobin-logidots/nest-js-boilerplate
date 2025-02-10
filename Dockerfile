FROM node:18.20.6-alpine

RUN apk add --no-cache bash curl rsync
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /tmp/app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm install

COPY . /usr/src/app

RUN mkdir -p /usr/src/app/node_modules \
    && rsync -a /tmp/app/node_modules/ /usr/src/app/node_modules/

COPY ./wait-for-it.sh /opt/wait-for-it.sh
COPY ./startup.dev.sh /opt/startup.dev.sh
RUN chmod +x /opt/wait-for-it.sh /opt/startup.dev.sh
RUN sed -i 's/\r//g' /opt/wait-for-it.sh /opt/startup.dev.sh

WORKDIR /usr/src/app

RUN if [ ! -f .env ]; then cp env-example .env; fi

RUN pnpm prisma generate

RUN pnpm run build

CMD ["/opt/startup.dev.sh"]
