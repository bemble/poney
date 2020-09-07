const sqlite = require('sqlite');
const mysql = require('mysql2/promise');
const moment = require("moment");
const SQLBuilder = require('json-sql-builder2');

const allDbConf = require(`${__dirname}/../../../data/database.json`);
const dbConf = allDbConf[allDbConf.defaultEnv];

if (dbConf.driver === "sqlite3") {
    Database = sqlite.open(`${__dirname}/../../${dbConf.filename}`, {Promise});
    Database.builder = new SQLBuilder("SQLite");
    Database.currentTimestamp = () => moment.utc().unix();
} else {
    const mysqlConf = {...dbConf};
    delete mysqlConf.driver;
    Database = (mysql.createConnection(mysqlConf)).then(db => {
        db.all = (sql, params) => db.execute(sql, params).then(([rows]) => rows);
        db.get = (sql, params) => db.execute(sql, params).then(([rows]) => rows[0] || {});
        db.run = (sql, params) => db.execute(sql, params);
        return db;
    });
    Database.builder = new SQLBuilder("MySQL");
    Database.currentTimestamp = () => new Date(moment.utc().unix());
}

Database.driverName = dbConf.driver;

module.exports = Database;