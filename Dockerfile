FROM node:12-alpine3.11
RUN apk add tzdata

ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    ttf-freefont \
    chromium

ARG BASE_PATH=/

WORKDIR /usr/src/app
COPY . .

WORKDIR /usr/src/app/front
RUN npm install
RUN BASE_PATH=${BASE_PATH} npm run build
RUN rm -rf src node_modules public .git .gitignore README.md

WORKDIR /usr/src/app/server
RUN npm install --no-dev

ENV PORT 3100
EXPOSE 3100

RUN echo '*/15 7-21 * * 0-6 node /usr/src/app/server/scripts/launch-batch.js linxo-importer' > /etc/crontabs/root
RUN echo '30 0 * * 7 node /usr/src/app/server/scripts/launch-batch.js credit-card-calendar' >> /etc/crontabs/root
CMD chown root:root /etc/crontabs/root && /usr/sbin/crond -f

WORKDIR /usr/src/app/server
CMD BASE_PATH=${BASE_PATH} npm run prestart
CMD BASE_PATH=${BASE_PATH} node src/index.js