const Database = require('../core/Database');

const SCRIPT_NAME = "reset-batchs-status";

module.exports = async () => {
    const db = await Database;

    console.log('Starting reset batchs status...');
    try {
        await db.run(`UPDATE batchHistory
                      SET status = ?
                      WHERE 1 = 1`, [0]);
        await db.run(`INSERT OR
                      REPLACE INTO batchHistory
                        (script, status, message, lastRunnedAt)
                      VALUES
                        (?, ?, ?, ?)`, [SCRIPT_NAME, 0, null, Database.currentTimestamp()]);
    } catch (e) {
        console.error(e.message);
    }
    console.log('Task finished.');
};