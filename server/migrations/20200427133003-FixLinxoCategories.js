'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};

exports.up = async function (db) {
    await db.runSql("UPDATE budgetLine SET categories = \"Salaire/Revenus d'activité\" WHERE categories = \"Salaire / Revenus d'activité\"");
    await db.runSql("UPDATE budgetLine SET categories = 'Shopping/e-Commerce' WHERE categories = 'Shopping / e - Commerce'");
};

exports.down = async function (db) {
    await db.runSql("UPDATE budgetLine SET categories = \"Salaire / Revenus d'activité\" WHERE categories = \"Salaire/Revenus d'activité\"");
    await db.runSql("UPDATE budgetLine SET categories = \"Shopping / e - Commerce\" WHERE categories = \"Shopping/e-Commerce\"");
};

exports._meta = {
    "version": 1
};
