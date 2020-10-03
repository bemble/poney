const fs = require('fs');
const http = require('http');
const express = require('express');
const helmet = require("helmet");
const bodyParser = require('body-parser');
const compression = require('compression');
const cron = require("node-cron");
const WebSocket = require("ws");
const jwt = require('jsonwebtoken');
const {Tokens} = require('./core');

const envFilePath = fs.realpathSync(`${__dirname}/../../data/.env`);
if (fs.existsSync(envFilePath)) {
    require('dotenv').config({path: envFilePath});
}

const app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(compression());

const {PORT = 3100, BASE_PATH = "", APP_ENVIRONMENT} = process.env;
// API
app.use(`${BASE_PATH}/api`, require("./api"));
// FRONT
app.use(`${BASE_PATH}/`, express.static('../front/build'));
app.use(`${BASE_PATH}/*`, express.static('../front/build/index.html'));

const server = http.createServer(app);
const wss = new WebSocket.Server({noServer: true});

const map = new Map();
wss.on('connection', (ws, request, userId) => {
    map.set(userId, ws);
    ws.on('message', (msg) => {
        console.log(`Received message ${msg} from user ${user}`);
    });
    ws.on('close', function () {
        map.delete(userId);
    });
});

server.on('upgrade', (request, socket, head) => {
    if (request.url.replace(/\?.+/, "") !== `${BASE_PATH}/api`) socket.destroy();

    try {
        jwt.verify(request.headers["sec-websocket-protocol"], Tokens.SECRET, {
            issuer: Tokens.ISSUER,
            audience: Tokens.AUDIENCES.CONNECT_WS
        });
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request, "totot");
        });
    } catch (e) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
    }
});

server.listen(PORT, () => {
    console.log(`Running on port ${PORT}. Home url: http://localhost:${PORT}${BASE_PATH}`);
});

if (APP_ENVIRONMENT !== "dev") {
    cron.schedule('5 7,9,11,13,15,17,19,21 * * *', () => {
        (async () => {
            try {
                let linxoImporter = require("./batchs/linxo-importer");
                await linxoImporter();
                linxoImporter = undefined;
                if (global.gc) {
                    global.gc();
                }
            } catch (e) {
                console.error(e);
            }
        })();
    });
    console.log('Data will be imported every 2 hours, from 7:05 to 21:05, from Linxo.');

    cron.schedule('30 0 * * 6', () => {
        (async () => {
            try {
                let creditCardCalendar = require("./batchs/credit-card-calendar");
                await creditCardCalendar();
                creditCardCalendar = undefined;
                if (global.gc) {
                    global.gc();
                }
            } catch (e) {
                console.error(e);
            }
        })();
    });
    console.log('Deferred credit card calendar will be updated every sunday, if necessary.');
}