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
    await db.createTable('project', {
        id: {type: 'int', primaryKey: true, autoIncrement: true, unsigned: true},
        label: {type: 'string'},
        endAt: {type: 'timestamp'},
        hidden: {type: 'boolean'},
        addedAt: 'timestamp',
        updatedAt: 'timestamp'
    });
};

exports.down = async function (db) {
    await db.dropTable('project');
};

exports._meta = {
    "version": 1
};
