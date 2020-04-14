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
    db.createTable('creditCardCalendar', {
        id: {type: 'int', primaryKey: true, autoIncrement: true, unsigned: true},
        year: {type: 'int'},
        month: {type: 'int'},
        day: {type: 'int'}
    }, callback);
};

exports.down = function(db, callback) {
    return db.dropTable('creditCardCalendar', callback);
};

exports._meta = {
    "version": 1
};
