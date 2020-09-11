const moment = require('moment');
const Database = require('../core/Database');

const getBusinessDayDateClosestTo = (expectedMoment) => {
    if (expectedMoment.day() < 6) {
        return expectedMoment.date();
    }
    return expectedMoment.subtract((expectedMoment.day() % 5), 'days').date();
};

const SCRIPT_NAME = "credit-card-calendar";

module.exports = async () => {
    const db = await Database;

    const {currentStatus} = (await db.get(`SELECT COALESCE(status, 0) AS currentStatus FROM batchHistory WHERE script = "${SCRIPT_NAME}"`)) || {};
    if (currentStatus === 2) {
        console.log('A credit card calendar update task is already in process, aborting.');
        process.exit(0);
    }

    console.log('Starting updating credit card calendar...');

    const exists = !!db.get("SELECT script FROM batchHistory WHERE script = ?", [SCRIPT_NAME]);
    await db.run(`${!exists ? "INSERT" : "REPLACE"} INTO batchHistory
                     (script, status, message, lastRunnedAt)
                   VALUES
                     (?, ?, ?, ?)`, [SCRIPT_NAME, 2, null, Database.currentTimestamp()]);

    const firstData = await db.get(`SELECT *
                                    FROM rawData
                                    ORDER BY date ASC
                                    LIMIT 1`);
    if (firstData) {
        const firstMoment = moment.unix(Database.dbDateToUnix(firstData.date)).subtract(1, 'months');
        const creditCardCalendar = {};
        ((await db.all(`SELECT *
                        FROM creditCardCalendar`)) || []).forEach(c => {
            creditCardCalendar[`${c.year}-${c.month}`] = c.day;
        });
        const insertPromises = [];
        const toMoment = moment().add(6, 'months');
        for (let currentYear = firstMoment.year(); currentYear <= toMoment.year(); currentYear++) {
            const startMonth = (currentYear === firstMoment.year()) ? firstMoment.month() : 0;
            const endMonth = (currentYear === toMoment.year()) ? toMoment.month() : 11;
            for (let currentMonth = startMonth; currentMonth <= endMonth; currentMonth++) {
                if (!creditCardCalendar[`${currentYear}-${currentMonth + 1}`]) {
                    const expectedMoment = moment([currentYear, currentMonth, 28]);
                    const values = [currentYear, currentMonth + 1, getBusinessDayDateClosestTo(expectedMoment)];
                    insertPromises.push(db.run(`INSERT INTO creditCardCalendar (year, month, day)
                                                VALUES (?, ?, ?)`, values))
                }
            }
        }

        await Promise.all(insertPromises);
    }

    await db.run(`REPLACE INTO batchHistory
                    (script, status, message, lastRunnedAt)
                  VALUES
                    (?, ?, ?, ?)`, [SCRIPT_NAME, 0, null, Database.currentTimestamp()]);
    console.log('Task finished.');
};