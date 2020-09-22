const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const cron = require("node-cron");

const envFilePath = fs.realpathSync(`${__dirname}/../../data/.env`);
if (fs.existsSync(envFilePath)) {
    require('dotenv').config({path: envFilePath});
}

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(compression());

const BASE_PATH = process.env.BASE_PATH || "";
app.use(`${BASE_PATH}/api`, require("./api"));

app.use(`${BASE_PATH}/`, express.static('../front/build'));
app.use(`${BASE_PATH}/*`, express.static('../front/build/index.html'));

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}. Home url: http://localhost:${PORT}${BASE_PATH}`);
});

if (process.env.APP_ENVIRONMENT !== "dev") {
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