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
    db.createTable('budgetLine', {
        id: {type: 'int', primaryKey: true, autoIncrement: true, unsigned: true},
        idBudget: {
            type: 'int', unsigned: true, notNull: true, foreignKey: {
                name: 'budgetLine_budget_id_fk',
                table: 'budget',
                rules: {
                    onDelete: 'CASCADE',
                },
                mapping: 'id'
            }
        },
        label: {type: 'string'},
        amount: {type: 'real', unsigned: false, defaultValue: 0},
        isIncome: {type: 'smallint', default: 0},
        dayOfMonth: 'smallint',
        operationKind: 'string',
        categories: 'text',
        color: 'string',
        order: {type: 'int', unsigned: true},
        addedAt: 'timestamp',
        updatedAt: 'timestamp'
    }, callback);
};

exports.down = function (db, callback) {
    return db.dropTable('budgetLine', callback);
};

exports._meta = {
    "version": 1
};
