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
    await db.createTable('saving', {
        id: {type: 'int', primaryKey: true, autoIncrement: true, unsigned: true},
        idBudgetLine: {
            type: 'int', unsigned: true, notNull: false, foreignKey: {
                name: 'saving_budgetLine_id_fk',
                table: 'budgetLine',
                rules: {
                    onDelete: 'SET NULL',
                },
                mapping: 'id'
            }
        },
        label: 'string',
        color: 'string',
        addedAt: 'timestamp',
        updatedAt: 'timestamp'
    });
};

exports.down = async function (db) {
    await db.dropTable('saving');
};

exports._meta = {
    "version": 1
};
