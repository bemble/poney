const fs = require('fs');
const cron = require('node-cron');
const importLinxo = require('./batchs/linxo-importer');
const creditCardCalendar = require('./batchs/credit-card-calendar');

const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const proxy = require('http-proxy-middleware');

const envFilePath = fs.realpathSync(`${__dirname}/../../data/.env`);
if (fs.existsSync(envFilePath)) {
    require('dotenv').config({path: envFilePath});
}

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(compression());

app.use("/api", require("./api"));

const http = require('http').createServer(app);

if (process.env.APP_ENVIRONMENT === "dev") {
    app.use('/', proxy("/", {target: 'http://localhost:3500', ws: true}));
} else {
    app.use(`${process.env.BASE_PATH}/`, express.static('../front/build'));
    app.use(`${process.env.BASE_PATH}/*`, express.static('../front/build/index.html'));
}

const port = process.env.PORT || 3100;
http.listen(port, () => {
    console.log(`Running on port ${port}`);
});

(async () => {
    await creditCardCalendar();
})();

if (process.env.APP_ENVIRONMENT !== "dev") {
    cron.schedule('0 * * * *', () => {
        (async () => {
            try {
                await importLinxo();
                console.log('Data imported');
            } catch (e) {
                console.error(e);
            }
        })();
    });
    console.log('Data will be imported every hour from Linxo.');

    cron.schedule('30 0 * * 7', () => {
        (async () => {
            try {
                await creditCardCalendar();
                console.log('Credit card calendar updated.');
            } catch (e) {
                console.error(e);
            }
        })();
    });
    console.log('Deferred credit card calendar will be updated every sunday, if necessary.');
}