const sqlite = require('sqlite');
const mysql = require('mysql2');
const moment = require("moment");
const SQLBuilder = require('json-sql-builder2');

const allDbConf = require(`${__dirname}/../../../data/database.json`);
const dbConf = allDbConf[allDbConf.defaultEnv];

if (dbConf.driver === "sqlite3") {
    Database = sqlite.open(`${__dirname}/../../${dbConf.filename}`, {Promise});
    Database.builder = new SQLBuilder("SQLite");
    Database.currentTimestamp = () => moment.utc().unix();
    Database.unixToDbDate = (unix) => unix;
    Database.dbDateToUnix = (date) => date;
} else {
    const mysqlConf = {
        ...dbConf,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
    delete mysqlConf.driver;
    Database = Promise.resolve(mysql.createPool(mysqlConf).promise()).then(db => {
        db.all = (sql, params) => db.execute(sql, params).then(([rows]) => rows);
        db.get = (sql, params) => db.execute(sql, params).then(([rows]) => rows[0] || null);
        db.run = (sql, params) => db.execute(sql, params);
        return db;
    });
    Database.builder = new SQLBuilder("MySQL");
    Database.currentTimestamp = () => new Date(moment.utc().unix() * 1000);
    Database.unixToDbDate = (unix) => (unix instanceof Date) ? unix : new Date(unix * 1000);
    Database.dbDateToUnix = (date) => (date instanceof Date) ? Math.round(date.valueOf() / 1000) : date;
}

Database.driverName = dbConf.driver;

module.exports = Database;