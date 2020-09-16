FROM node:12-alpine3.11
RUN apk add tzdata

WORKDIR /usr/src/app
COPY . .

WORKDIR /usr/src/app/front
RUN npm --no-color install 2>&1
RUN npm --no-color run build 2>&1
RUN rm -rf src node_modules public .git .gitignore README.md

WORKDIR /usr/src/app/server

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python && \
  npm  --no-color install --quiet node-gyp 2>&1 -g &&\
  npm --no-color  install --no-dev --quiet 2>&1 && \
  apk del native-deps

ENV PORT 3100
EXPOSE 3100

WORKDIR /usr/src/app/server
CMD npm --no-color run prestart && node src/index.js