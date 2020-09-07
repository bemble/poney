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
    await db.runSql("UPDATE accountSetting SET usedFor = 'checks' WHERE usedFor = 'courant'");
    await db.runSql("UPDATE accountSetting SET usedFor = 'savings' WHERE usedFor = 'epargne'");
    await db.runSql("UPDATE accountSetting SET usedFor = 'deferredDebitCreditCard' WHERE usedFor = 'cbDiff'");
};

exports.down = async function (db) {
    await db.runSql("UPDATE accountSetting SET usedFor = 'courant' WHERE usedFor = 'checks'");
    await db.runSql("UPDATE accountSetting SET usedFor = 'epargne' WHERE usedFor = 'savings'");
    await db.runSql("UPDATE accountSetting SET usedFor = 'cbDiff' WHERE usedFor = 'deferredDebitCreditCard'");
};

exports._meta = {
    "version": 1
};
