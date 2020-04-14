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
    db.createTable('batchHistory', {
        script: {type: 'string', primaryKey: true},
        status: {type: 'smallint', unsigned: true},
        message: 'text',
        lastRunnedAt: 'timestamp'
    }, callback);
};

exports.down = function (db, callback) {
    return db.dropTable('batchHistory', callback);
};

exports._meta = {
    "version": 1
};
