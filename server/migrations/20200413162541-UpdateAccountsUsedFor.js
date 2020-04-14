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
    db.runSql("UPDATE accountSetting SET usedFor = 'checks' WHERE usedFor = 'courant'");
    db.runSql("UPDATE accountSetting SET usedFor = 'savings' WHERE usedFor = 'epargne'");
    db.runSql("UPDATE accountSetting SET usedFor = 'deferredDebitCreditCard' WHERE usedFor = 'cbDiff'", callback);
};

exports.down = function (db, callback) {
    db.runSql("UPDATE accountSetting SET usedFor = 'courant' WHERE usedFor = 'checks'");
    db.runSql("UPDATE accountSetting SET usedFor = 'epargne' WHERE usedFor = 'savings'");
    db.runSql("UPDATE accountSetting SET usedFor = 'cbDiff' WHERE usedFor = 'deferredDebitCreditCard'", callback);
};

exports._meta = {
    "version": 1
};
