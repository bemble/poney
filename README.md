# Poney

> Manage your money and budget like I do, go further with Linxo.

It relies on Linxo to fetch data from your bank accounts.
It uses Google Signin to login.

## Configuration

Used environment variables:

- `LINXO_USERNAME`: Linxo username/email
- `LINXO_PASSWORD`: Linxo password
- `ALLOWED_EMAILS`: list of emails allowed to use the app, comma separated
- `PASSWORD_SALT`: salt used in passwords, if wanted to override default (strongly advised)
- `JWT_SECRET`: secret used to generate JWT tokens, if wanted to override default (strongly advised)
- `BASE_PATH`: base path, if Poney is reachable with a specific path (ie. not a dedicated URL)
- `BROWSERLESS_HOST`: host of your browserless instance

You can also set them in a `.env` file, placed in the `data` folder.

## Run

```
cd front
npm run start
cd server
npm run start:dev
```

## Docker

### Docker run

```
docker-run -v local/dir/data:/usr/src/app/data
```

### Docker compose

```
  poney:
    build:
      context: "${PWD}/poney/src"
      args:
        - "BASE_PATH=/poney"
    restart: unless-stopped
    container_name: poney
    user: "${DOCKER_UID}:${DOCKER_GID}"
    networks:
        - traefik
    environment:
      - "BASE_PATH=/poney"
      - "TZ=${TIMEZONE}"
    volumes:
      - "${PWD}/poney/data:/usr/src/app/data"
      - "/etc/localtime:/etc/localtime:ro"
    ports:
      - 3100:3100
    labels:
      - "traefik.enable=true"
      - "traefik.frontend.port=3100"
      - "traefik.frontend.redirect.regex=^(.*)/poney$$"
      - "traefik.frontend.redirect.replacement=$$1/poney/"
      - "traefik.frontend.rule=ReplacePathRegex: ^/poney/(.*) /$$1"
      - "traefik.frontend.rule=Host:${MAIN_PUBLIC_DOMAIN_NAME};PathPrefix:/poney;"
      - "traefik.frontend.entryPoints=http,https"
      - "traefik.frontend.redirect.entryPoint=https"
```