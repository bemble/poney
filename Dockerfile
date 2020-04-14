FROM node:10-alpine
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
RUN node -p -e "const conf = require(__dirname + '/package.json'); const fs = require('fs'); conf.homepage = '/poney'; fs.writeFileSync(__dirname + '/package.json', JSON.stringify(conf, null, 2));"
RUN npm install
RUN BASE_PATH=${BASE_PATH} npm run build
RUN rm -rf src node_modules public .git .gitignore package* README.md

WORKDIR /usr/src/app/server
RUN npm install --no-dev

ENV PORT 3100
EXPOSE 3100

WORKDIR /usr/src/app/server
CMD BASE_PATH=${BASE_PATH} npm start