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
    return db.runSql("UPDATE accountSetting SET usedFor = 'deferredCard' WHERE usedFor = 'deferredDebitCreditCard'");
};

exports.down = async function (db) {
    return db.runSql("UPDATE accountSetting SET usedFor = 'deferredDebitCreditCard' WHERE usedFor = 'deferredCard'");
};

exports._meta = {
    "version": 1
};
