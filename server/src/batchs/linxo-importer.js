const fs = require('fs');
const puppeteer = require('puppeteer');
const util = require('util');
const sha1 = require("sha1");
const moment = require("moment");

const Database = require('../core/Database');

const downloadPath = `/tmp`;
const headless = true;

const SCRIPT_NAME = "linxo-importer";

module.exports = async () => {
    const db = await Database;

    const {currentStatus} = await db.get(`SELECT COALESCE(status, 0) AS currentStatus FROM batchHistory WHERE script = "${SCRIPT_NAME}"`);
    if(currentStatus === 2) {
        console.log('A Linxo import task is already in process, aborting.');
        process.exit(0);
    }

    console.log('Starting import data from Linxo...');
    await db.run(`INSERT OR
                   REPLACE INTO batchHistory
                     (script, status, message, lastRunnedAt)
                   VALUES
                     (?, ?, ?, ?)`, [SCRIPT_NAME, 2, null, Database.currentTimestamp()]);

    let hasError = true;
    let retries = 3;
    let lastError = null;
    while (hasError && retries > 0) {
        try {
            await LinxoImporter.process();
            hasError = false;
        } catch (e) {
            lastError = e.message;
            retries--;
        }
    }

    await db.run(`INSERT OR
                   REPLACE INTO batchHistory
                     (script, status, message, lastRunnedAt)
                   VALUES
                     (?, ?, ?, ?)`, [SCRIPT_NAME, hasError ? 1 : 0, hasError ? lastError : null, Database.currentTimestamp()]);
    console.log('Task finished.');
};

class LinxoImporter {
    static async process() {
        const importer = new LinxoImporter();
        await importer.getData();
    }

    async importData(fileName) {
        const lines = fs.readFileSync(fileName, {encoding: 'utf-16le'}).toString().split('\n').filter(Boolean);
        lines.shift();
        lines.reverse();
        const ids = {};
        const db = await Database;

        const updates = lines.map(async (line) => {
                if (line.trim().length > 10) {
                    const [date, label, category, amount, notes, chequeNumber, labels, accountName, connectionName] = line.split('\t');
                    const id = sha1(date + label + amount + accountName);
                    ids[id] = ids[id] ? ids[id] + 1 : 1;
                    const currentId = `${id}.${ids[id]}`;
                    const [day, month, year] = date.split('/');

                    const found = await db.get(`SELECT id, date
                                                FROM rawData
                                                WHERE computedId = ?`, [currentId]);
                    let query = "";
                    let queryParams = [];
                    const dateTimestamp = moment.utc(`${year}-${month}-${day}`).unix();
                    if (found) {
                        query = `UPDATE rawData
                                 SET
                                   date      = ?,
                                   label     = ?,
                                   category  = ?,
                                   notes     = ?,
                                   labels    = ?,
                                   updatedAt = ?
                                 WHERE id = ?`;
                        queryParams = [dateTimestamp, label, category, notes, labels, Database.currentTimestamp(), found.id];
                    } else {
                        query = `INSERT INTO rawData (computedId, date, label, category, amount, notes,
                                                      chequeNumber, labels, accountName, connectionName, addedAt,
                                                      updatedAt)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                        queryParams = [currentId, dateTimestamp, label, category, parseFloat(`${amount}`.replace(',', '.')), notes, chequeNumber, labels, accountName, connectionName, Database.currentTimestamp(), Database.currentTimestamp()];
                    }
                    return db.run(query, queryParams);
                }

                return Promise.resolve(true);
            })
        ;
        await Promise.all(updates);
    }

    async getData() {
        if (!(process.env.LINXO_USERNAME && process.env.LINXO_USERNAME)) {
            return false;
        }

        const browser = await puppeteer.launch({
            headless,
            executablePath: process.env.CHROME_BIN || null,
            args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();

        await page.goto('https://wwws.linxo.com/auth.page#Login');

        await new Promise((resolve) => {
            setTimeout(() => resolve(), 5 * 1000);
        });

        await page.type('input[name="username"]', process.env.LINXO_USERNAME);
        await page.type('input[name="password"]', process.env.LINXO_PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForNavigation();

        await page.goto('https://wwws.linxo.com/secured/history.page#Search;accountTypes=Checkings,CreditCard;pageNumber=0;excludeDuplicates=true');
        await new Promise((resolve) => {
            setTimeout(() => resolve(), 10 * 1000);
        });

        const [button] = await page.$x("//button[contains(., 'CSV')]");
        if (button) {
            await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath});
            await button.click();

            let fileName;
            while (!fileName || fileName.endsWith('.crdownload')) {
                await new Promise(resolve => setTimeout(resolve, 100));
                [fileName] = await util.promisify(fs.readdir)(downloadPath);
            }

            await (new Promise((resolve) => {
                setTimeout(() => resolve(true), 1000);
            }));

            await this.importData(`${downloadPath}/operations.csv`);
            fs.unlinkSync(`${downloadPath}/operations.csv`);
        } else {
            console.log("Download CSV button not found.");
        }

        browser.close();
    }
}