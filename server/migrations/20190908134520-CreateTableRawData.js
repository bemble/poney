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
    await db.createTable('rawData', {
        id: {type: 'int', primaryKey: true, autoIncrement: true, unsigned: true},
        computedId: {type: 'string', unique: true, notNull: true},
        date: 'timestamp',
        label: 'string',
        category: 'string',
        amount: 'real',
        notes: 'string',
        chequeNumber: 'string',
        labels: 'string',
        accountName: 'string',
        connectionName: 'string',
        addedAt: 'timestamp',
        updatedAt: 'timestamp'
    });
    await db.addIndex('rawData', 'computedId-index', 'computedId');
};

exports.down = async function (db) {
    await db.dropTable('rawData');
};

exports._meta = {
    "version": 1
};
