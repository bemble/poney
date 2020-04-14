'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
    db.createTable('accountSetting', {
        id: {type: 'string', primaryKey: true},
        accountName: {type: 'string'},
        connectionName: {type: 'string'},
        usedFor: {type: 'string'}
    }, callback);
};

exports.down = function(db, callback) {
    return db.dropTable('accountSetting', callback);
};

exports._meta = {
  "version": 1
};
