const sqlite = require('sqlite');
const moment = require("moment");
const SQLBuilder = require('json-sql-builder2');

const Database = sqlite.open(`${__dirname}/../../../data/database.sqlite`, {Promise});
Database.currentTimestamp = () => moment.utc().unix();
Database.builder = new SQLBuilder("SQLite");

module.exports = Database;