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

exports.up = function (db, callback) {
    db.runSql("UPDATE budgetLine SET categories = \"Salaire/Revenus d'activité\" WHERE categories = \"Salaire / Revenus d'activité\"", callback);
    db.runSql("UPDATE budgetLine SET categories = 'Shopping/e-Commerce' WHERE categories = 'Shopping / e - Commerce'", callback);
};

exports.down = function (db, callback) {
    db.runSql("UPDATE budgetLine SET categories = \"Salaire / Revenus d'activité\" WHERE categories = \"Salaire/Revenus d'activité\"", callback);
    db.runSql("UPDATE budgetLine SET categories = \"Shopping / e - Commerce\" WHERE categories = \"Shopping/e-Commerce\"", callback);
};

exports._meta = {
    "version": 1
};
