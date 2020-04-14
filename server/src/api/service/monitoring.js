const router = require('express').Router();
const {formatDate, getDateStr} = require("../../core/Tools");
const {Database} = require('../../core');
const {Accounts} = require('../../core/helpers');
const moment = require('moment');

router.get('/', async (req, res) => {
    res.json(await Monitoring.get(req.query));
});
router.get('/details', async (req, res) => {
    res.json(await Monitoring.getDetails(req.query.date));
});
router.get('/totals', async (req, res) => {
    res.json(await Monitoring.getTotals());
});

module.exports = router;

class Monitoring {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    static get({start, end}) {
        const api = new Monitoring(start, end);
        return api.getAggregatedData();
    }

    static async getTotals() {
        const db = await Database;
        const conditions = await Accounts.conditions();
        const amount = (await db.get(`SELECT SUM(amount) as amount
                                      FROM rawData
        WHERE (${conditions.checks.join(' OR ')})`)).amount;
        return {amount};
    }

    static async getDetails(date) {
        const api = new Monitoring(date, date);
        return api.getData();
    }

    async getData() {
        const hasDeferredCreditCard = !!(await Accounts.conditions()).deferredDebitCreditCard.length;
        const conditions = await Accounts.conditions();

        const data = {date: this.start, credits: [], debits: [], deferredDebitCreditCard: []};
        const db = await Database;
        if (moment.utc(this.start, 'X').isSameOrBefore(moment(), "day")) {
            data.credits = await db.all(`
        SELECT * FROM
        rawData
        WHERE
        date = ? AND amount > ? AND(${conditions.checks.join(' OR ')})`, [this.start, 0]);
            data.debits = (await db.all(`SELECT * FROM
        rawData
        WHERE
        date = ? AND amount < ? AND(${conditions.checks.join(' OR ')})`, [this.start, 0])).map(l => ({
                ...l,
                amount: Math.abs(l.amount)
            }));
            if (hasDeferredCreditCard) {
                data.deferredCreditCard = (await db.all(`SELECT * FROM
        rawData
        WHERE
        date = ? AND amount < ? AND(${conditions.deferredDebitCreditCard.join(' OR ')})`, [this.start, 0])).map(l => ({
                    ...l,
                    amount: Math.abs(l.amount)
                }));
            }
        } else {
            const query = `SELECT
                             bl.*
                           FROM
                             budgetLine bl
                               JOIN
                               budget b
                               ON
                                 bl.idBudget = b.id
                           WHERE
                             dayOfMonth = ?
                             AND b.inUse = ? `;
            const budgetLines = await db.all(query, [moment.utc(this.start, 'X').date(), 1]);
            budgetLines.forEach(line => {
                if (line.isIncome) {
                    data.credits.push(line);
                } else if (hasDeferredCreditCard && line.operationKind === "creditCard") {
                    data.deferredCreditCard.push(line);
                } else {
                    data.debits.push(line);
                }
            });
            const deferredCreditCardDebits = await this.deferredCreditCardDebits();
            if (deferredCreditCardDebits[formatDate(moment.utc(this.start, 'X'))]) {
                data.debits.push({
                    amount: deferredCreditCardDebits[formatDate(moment.utc(this.start, 'X'))],
                    label: "Total carte débit différé"
                });
            }
        }
        return data;
    }

    async getAggregatedData() {
        const hasDeferredCreditCard = !!(await Accounts.conditions()).deferredDebitCreditCard.length;
        const linesByDay = {};
        const budget = await this.budget();
        const lines = await this.aggregatedLines();
        const deferredCreditCard = await this.deferredCreditCard();
        const deferredCreditCardDebits = await this.deferredCreditCardDebits();

        lines.forEach(line => {
            linesByDay[formatDate(line.date)] = line;
        });
        const dataByDay = [];
        const curMoment = moment.utc(this.start, 'X');
        let lastAmount = 0;

        while (curMoment.unix() < this.end) {
            const formattedDate = formatDate(curMoment);
            const data = {
                date: curMoment.unix(),
                credits: 0,
                debits: 0,
                deferredCreditCard: 0,
                amount: lastAmount
            };

            if (deferredCreditCard[formattedDate]) {
                data.deferredCreditCard = deferredCreditCard[formattedDate];
            }

            if (linesByDay[formattedDate]) {
                data.credits = linesByDay[formattedDate].credits;
                data.debits = Math.abs(linesByDay[formattedDate].debits);
                data.amount = linesByDay[formattedDate].amount;
                lastAmount = data.amount;
            } else if (curMoment > moment()) {
                const day = curMoment.date();
                if (budget && budget[day]) {
                    data.credits = budget[day].credits;
                    data.debits = budget[day].debits + (deferredCreditCardDebits[formattedDate] || 0);
                    data.amount = lastAmount + budget[day].credits - budget[day].debits - (deferredCreditCardDebits[formattedDate] || 0);
                    lastAmount = data.amount;
                }
            }
            dataByDay.push(data);
            curMoment.add(1, "days");
        }
        return {lines: dataByDay, hasDeferredCreditCard};
    }

    async aggregatedLines() {
        const conditions = await Accounts.conditions();
        const db = await Database;
        return db.all(`SELECT date,
            SUM(CASE WHEN amount > 0 AND(${conditions.checks.join(' OR ')}) THEN amount ELSE 0 END) AS credits,
            SUM(CASE WHEN amount <= 0 AND(${conditions.checks.join(' OR ')}) THEN amount ELSE 0 END) AS debits,
            (SELECT SUM(amount) FROM rawData r2 WHERE(${conditions.checks.join(' OR ')}) AND r2.date <= rawData.date) AS amount
            FROM rawData
            WHERE date BETWEEN ? AND ?
            GROUP BY date
            ORDER BY date DESC`, [this.start, this.end]);
    }

    async budget() {
        if (!this._budget) {
            const db = await Database;
            const query = ` SELECT dayOfMonth,
                                   SUM(CASE WHEN isIncome > ? THEN amount ELSE 0 END)                           AS credits,
                                   SUM(
                                       CASE WHEN (isIncome <= ? AND operationKind != ?) THEN amount ELSE 0 END) AS debits,
                                   SUM(
                                       CASE WHEN (isIncome <= ? AND operationKind = ?) THEN amount ELSE 0 END)  AS deferredCreditCard
                            FROM budgetLine
                                   JOIN budget b ON idBudget = b.id
                            WHERE b.inUse = ?
                            GROUP BY dayOfMonth`;

            const budgetLines = await db.all(query, [0, 0, "creditCard", 0, "creditCard", 1]);
            this._budget = {};
            budgetLines.forEach(l => this._budget[l.dayOfMonth] = l);
        }
        return this._budget;
    }

    async deferredCreditCard() {
        const conditions = await Accounts.conditions();
        if (!conditions.deferredDebitCreditCard.length) {
            return {};
        }

        const db = await Database;
        const startMoment = moment.utc(this.start, 'X');
        startMoment.subtract(1, 'm');
        const endMoment = moment.utc(Math.max(this.end, moment().unix()), 'X');

        let monthCondition = "(month >= ? AND year = ?) AND (month <= ? AND year = ?)";
        let monthParams = [startMoment.month() - 2, startMoment.year(), endMoment.month() + 1, endMoment.year()];
        for (let i = startMoment.year() + 1; i < endMoment.year(); i++) {
            monthCondition += " OR (year = ?)";
            monthParams = [...monthParams, i];
        }
        const endCbDays = await db.all(`SELECT *
                                            FROM creditCardCalendar
                                            WHERE ${monthCondition}
                                            ORDER BY year ASC, month ASC`, monthParams);
        const triggers = {};
        endCbDays.forEach((d, i) => {
            if (i > 0) {
                const start = moment(getDateStr(endCbDays[i - 1])).unix() + 24 * 60 * 60;
                const end = moment(getDateStr(d)).unix();
                triggers[formatDate(d)] = {start, end};
            }
        });

        const budget = await this.budget();

        const operations = await Promise.all(Object.entries(triggers).map(async ([date, params]) => {
            const periodOperations = await db.all(`SELECT r.date AS date,
                (SELECT SUM(r2.amount)
                  FROM rawData r2
                  WHERE r2.date <= r.date
                    AND r2.date >= ?
                    AND r2.amount < 0
                    AND(${conditions.deferredDebitCreditCard.join(' OR ')})) AS amount
                FROM rawData r
                WHERE r.date >= ?
                  AND r.date <= ?
                GROUP BY r.date
                ORDER BY r.date ASC`, [params.start, params.start, params.end]);
            const tmpOperationsByDay = {};
            periodOperations.forEach(l => {
                tmpOperationsByDay[formatDate(moment.utc(l.date, 'X'))] = l.amount;
            });

            const operationsByDay = {};
            const curMoment = moment.utc(params.start, 'X');
            let lastAmount = 0;
            while (curMoment.unix() <= params.end) {
                const curDateStr = formatDate(curMoment);
                if (tmpOperationsByDay[curDateStr]) {
                    lastAmount = tmpOperationsByDay[curDateStr];
                }
                if (curMoment > moment() && budget[curMoment.date()] && budget[curMoment.date()].deferredCreditCard) {
                    lastAmount -= budget[curMoment.date()].deferredCreditCard;
                }
                operationsByDay[curDateStr] = Math.abs(lastAmount);
                curMoment.add(1, 'days');
            }
            return operationsByDay;
        }));

        let operationsByDay = {};
        operations.forEach(d => {
            operationsByDay = Object.assign({}, operationsByDay, d);
        });

        return operationsByDay;
    }

    async deferredCreditCardDebits() {
        const conditions = await Accounts.conditions();
        if (!conditions.deferredDebitCreditCard.length) {
            return {};
        }

        const db = await Database;
        const {value} = await db.get(`SELECT *
                                      FROM configuration
                                      WHERE id = ?`, ["DEFERREDCB_LEVY_DAY"]);
        const linesByDay = {};
        if (value) {
            const curMoment = moment();
            curMoment.set({hour: 0, minute: 0, second: 0, millisecond: 0});
            let budgetized = 0;
            const budget = await this.budget();
            while (curMoment.unix() <= this.end) {
                if (curMoment > moment() && budget[curMoment.date()] && budget[curMoment.date()].deferredCreditCard) {
                    budgetized += budget[curMoment.date()].deferredCreditCard;
                }

                if (curMoment.date() === parseInt(value)) {
                    const queryStartMoment = moment(curMoment);
                    queryStartMoment.subtract(2, 'months');
                    const queryEndMoment = moment(curMoment);
                    queryEndMoment.subtract(1, 'months');

                    const startCalendar = await db.get(`SELECT *
                                                        FROM creditCardCalendar
                                                        WHERE month = ?
                                                          AND year = ? `, [queryStartMoment.month() + 1, queryStartMoment.year()]);
                    const endCalendar = await db.get(`SELECT *
                                                      FROM creditCardCalendar
                                                      WHERE month = ?
                                                        AND year = ? `, [queryEndMoment.month() + 1, queryEndMoment.year()]);

                    const startStr = getDateStr(startCalendar);
                    const endStr = getDateStr(endCalendar);

                    const startMoment = moment(startStr);
                    const endMoment = moment(endStr);

                    const data = await db.get(`SELECT SUM(amount) AS amount
                        FROM rawData
                        WHERE amount < ?
                          AND date > ?
                          AND date <= ?
                          AND(${conditions.deferredDebitCreditCard.join(' OR ')})`, [0, startMoment.unix(), endMoment.unix()]);
                    linesByDay[formatDate(curMoment)] = Math.abs(data.amount - budgetized);
                    budgetized = 0;
                }
                curMoment.add(1, "days");
            }
        }
        return linesByDay;
    }
}