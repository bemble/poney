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
    db.createTable('projectLine', {
        id: {type: 'int', primaryKey: true, autoIncrement: true, unsigned: true},
        idProject: {
            type: 'int', unsigned: true, notNull: true, foreignKey: {
                name: 'projectLine_project_id_fk',
                table: 'project',
                rules: {
                    onDelete: 'CASCADE',
                },
                mapping: 'id'
            }
        },
        label: {type: 'string'},
        amount: {type: 'real', unsigned: true, defaultValue: 0},
        expectedAmount: {type: 'real', unsigned: true, defaultValue: 0},
        alreadyPaidAmount: {type: 'real', unsigned: true, defaultValue: 0},
        comment: {type: 'text'},
        addedAt: 'timestamp',
        updatedAt: 'timestamp'
    }, callback);
};

exports.down = function (db, callback) {
    return db.dropTable('projectLine', callback);
};

exports._meta = {
    "version": 1
};
