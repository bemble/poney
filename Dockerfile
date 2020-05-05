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

WORKDIR /usr/src/app
COPY . .

WORKDIR /usr/src/app/front
RUN npm install
RUN npm run build
RUN rm -rf src node_modules public .git .gitignore README.md

WORKDIR /usr/src/app/server

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python && \
  npm install --quiet node-gyp -g &&\
  npm install --no-dev --quiet && \
  apk del native-deps

ENV PORT 3100
EXPOSE 3100

WORKDIR /usr/src/app/server
CMD npm run prestart && node src/index.js