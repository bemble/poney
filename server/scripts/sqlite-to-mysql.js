const fs = require("fs");
const dbConf = require("../../data/database.json");
const sqlite = require('sqlite');
const mysql = require('mysql2/promise');

const envFilePath = fs.realpathSync(`${__dirname}/../../data/.env`);
if (fs.existsSync(envFilePath)) {
    require('dotenv').config({path: envFilePath});
}

const hasSqlite = !!Object.values(dbConf).filter(e => e.driver === "sqlite3").length;
const hasMysql = !!Object.values(dbConf).filter(e => e.driver === "mysql").length;
const sqliteFile = hasSqlite && `${__dirname}/../${Object.values(dbConf).filter(e => e.driver === "sqlite3")[0].filename}`;

if (!(hasSqlite && hasMysql && dbConf[dbConf.defaultEnv].driver === "mysql" && fs.existsSync(sqliteFile))) {
    return;
}

(async () => {
    const sqliteDb = await sqlite.open(sqliteFile, {Promise});
    const mysqlConf = {...dbConf[dbConf.defaultEnv]};
    delete mysqlConf.driver;
    const mysqlDb = await mysql.createConnection(mysqlConf);

    const tables = await sqliteDb.all("select name from sqlite_master where type='table'");
    const tablesToMigrate = tables.map(({name}) => name).filter(name => !name.startsWith("sqlite_") && (["migrations"].indexOf(name) === -1));

    await mysqlDb.query("SET FOREIGN_KEY_CHECKS = 0");

    const promises = tablesToMigrate.map(async (tableName) => {
        const lines = await sqliteDb.all(`SELECT *
        FROM ${tableName}`);
        const keys = Object.keys(lines[0]);
        const query = `INSERT INTO ${tableName} (\`${keys.join('`,`')}\`) VALUES ?`;
        const values = lines.map(line => {
            if (line.updatedAt && !line.addedAt) {
                line.addedAt = line.updatedAt;
            }
            Object.keys(line).forEach(key => {
                if (key.endsWith("At") || (tableName === "rawData" && key === "date")) {
                    line[key] = new Date(line[key] * 1000);
                } else if (["amount", "expectedAmount", "alreadyPaidAmount"].indexOf(key) >= 0 && !line[key]) {
                    line[key] = 0;
                }
            });
            const v = [];
            keys.forEach(k => v.push(line[k]));
            return v;
        });
        await mysqlDb.query(query, [values]);
    });
    await Promise.all(promises);

    await mysqlDb.query("SET FOREIGN_KEY_CHECKS = 1");
    fs.renameSync(sqliteFile, `${sqliteFile}.back`);
    process.exit(0);
})();