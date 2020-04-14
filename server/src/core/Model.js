const Database = require('./Database');

class Model {
    static async getOne(jsonQuery) {
        const rows = await Model.getAll({...jsonQuery, $limit: 1});
        if (rows.length) {
            return rows[0];
        }
        return null;
    }

    static async getAll(jsonQuery) {
        const query = Database.builder.$select(jsonQuery);

        query.values = (query.values || []).map(e => e === "CURRENT_TIMESTAMP" ? Database.currentTimestamp() : e);
        const db = await Database;
        const rows = await db.all(query.sql, query.values);
        return rows || [];
    }

    static async insert(jsonQuery) {
        if (Model.AUTO_TIMESTAMPS_TABLES.indexOf(jsonQuery.$table) >= 0) {
            jsonQuery.$documents.addedAt = Database.currentTimestamp();
            jsonQuery.$documents.updatedAt = jsonQuery.$documents.addedAt;
        }
        const query = Database.builder.$insert(jsonQuery);

        query.values = (query.values || []).map(e => e === "CURRENT_TIMESTAMP" ? Database.currentTimestamp() : e);

        const db = await Database;
        const {lastID} = await db.run(query.sql, query.values);
        if (!lastID) {
            return null;
        }

        return Model.getOne({
            $from: jsonQuery.$table,
            $where: {id: lastID}
        });
    }

    static async update(jsonQuery) {
        if (Model.AUTO_TIMESTAMPS_TABLES.indexOf(jsonQuery.$table) >= 0) {
            jsonQuery.$set.updatedAt = Database.currentTimestamp();
        }
        const query = Database.builder.$update(jsonQuery);

        query.values = (query.values || []).map(e => e === "CURRENT_TIMESTAMP" ? Database.currentTimestamp() : e);
        const db = await Database;
        await db.run(query.sql, query.values);

        return Model.getOne({
            $from: jsonQuery.$table,
            $where: jsonQuery.$where
        });
    }

    static async delete(jsonQuery) {
        const query = Database.builder.$delete(jsonQuery);

        const db = await Database;
        return db.run(query.sql, query.values);
    }
}

Model.AUTO_TIMESTAMPS_TABLES = ["budget", "budgetLine", "project", "projectLine", "rawData", "saving", "savingLine"];

module.exports = Model;