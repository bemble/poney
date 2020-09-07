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
    await db.createTable('savingLine', {
        id: {type: 'int', primaryKey: true, autoIncrement: true, unsigned: true},
        month: {type: 'string'},
        idSaving: {
            type: 'int', unsigned: true, notNull: true, foreignKey: {
                name: 'savingLine_saving_id_fk',
                table: 'saving',
                rules: {
                    onDelete: 'CASCADE',
                },
                mapping: 'id'
            }
        },
        amountIncomes: {type: 'real', unsigned: true, defaultValue: 0},
        amountExpenses: {type: 'real', unsigned: true, defaultValue: 0},
        comment: {type: 'text'},
        addedAt: 'timestamp',
        updatedAt: 'timestamp'
    });
};

exports.down = async function (db) {
    await db.dropTable('savingLine');
};

exports._meta = {
    "version": 1
};
