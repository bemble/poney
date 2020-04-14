const moment = require('moment');
const Database = require('../core/Database');

const getBusinessDayDateClosestTo = (expectedMoment) => {
    if (expectedMoment.day() < 6) {
        return expectedMoment.date();
    }
    return expectedMoment.subtract((expectedMoment.day() % 5), 'days').date();
};

module.exports = async () => {
    const db = await Database;

    const firstData = await db.get(`SELECT *
                                    FROM rawData
                                    ORDER BY date ASC
                                    LIMIT 1`);
    if (firstData) {
        const firstMoment = moment.unix(firstData.date).subtract(1, 'months');
        const creditCardCalendar = {};
        ((await db.all(`SELECT *
                        FROM creditCardCalendar`)) || []).forEach(c => {
            creditCardCalendar[`${c.year}-${c.month}`] = c.day;
        });
        const insertPromises = [];
        const toMoment = moment().add(2, 'months');
        for (let currentYear = firstMoment.year(); currentYear <= toMoment.year(); currentYear++) {
            const startMonth = (currentYear === firstMoment.year()) ? firstMoment.month() : 0;
            const endMonth = (currentYear === toMoment.year()) ? toMoment.month() : 11;
            for (let currentMonth = startMonth; currentMonth <= endMonth; currentMonth++) {
                if (!creditCardCalendar[`${currentYear}-${currentMonth + 1}`]) {
                    const expectedMoment = moment([currentYear, currentMonth, 28]);
                    const values = [currentYear, currentMonth + 1,  getBusinessDayDateClosestTo(expectedMoment)];
                    insertPromises.push(db.run(`INSERT INTO creditCardCalendar (year, month, day) VALUES (?1, ?2, ?3)`, values))
                }
            }
        }

        await Promise.all(insertPromises);
    }

    return db.run(`INSERT OR
                   REPLACE INTO batchHistory
                     (script, status, message, lastRunnedAt)
                   VALUES
                     (?, ?, ?, ?)`, ['credit-card-calendar', 0, null, Database.currentTimestamp()]);
};