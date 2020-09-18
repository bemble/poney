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
    await db.createTable('users', {
        id: {type: 'int', primaryKey: true, autoIncrement: true, unsigned: true},
        publicId: {type: 'string', notNull: true},
        email: {type: 'string', notNull: true},
        password: {type: 'string', notNull: true},
        addedAt: 'timestamp',
        updatedAt: 'timestamp'
    });
    await db.addIndex('users', 'email-index', 'email');
    await db.addIndex('users', 'publicId-index', 'publicId');
};

exports.down = async function (db) {
    await db.dropTable('users');
};

exports._meta = {
    "version": 1
};
