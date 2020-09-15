const moment = require("moment");
const router = require('express').Router();

const Accounts = require('../../core/helpers/Accounts');

router.post('/set_in_use/:id', async (req, res) => {
    res.json(await Budgets.setInUse(req.params.id));
});

router.post('/duplicate/:id', async (req, res) => {
    res.json(await Budgets.duplicate(req.params.id));
});

router.post('/reorder/:id', async (req, res) => {
    res.json(await Budgets.reorder(req.params.id, req.body));
});

router.get('/totals/:id', async (req, res) => {
    res.json(await Budgets.getTotals(req.params.id));
});

router.get('/usage/details/:id*?', async (req, res) => {
    res.json(await Budgets.getUsageDetails(req.params.id, req.query.category, req.query.month));
});

router.get('/usage/:id*?', async (req, res) => {
    res.json(await Budgets.getUsage(req.params.id, req.query.month));
});

module.exports = router;

const {Database} = require('../../core');

class Budgets {
    static async setInUse(id) {
        const db = await Database;
        await db.run('UPDATE budget SET inUse = ? WHERE 1 = 1', [0]);
        return db.run('UPDATE budget SET inUse = ? WHERE id = ?', [1, id]);
    }

    static async getTotals(id) {
        const db = await Database;
        return db.get(`SELECT
                         SUM(CASE WHEN isIncome = ? THEN amount ELSE 0 END)                       AS incomes,
                         SUM(CASE WHEN isIncome = ? THEN amount ELSE 0 END)                       AS expenses,
                         SUM(CASE WHEN isIncome = ? AND operationKind = ? THEN amount ELSE 0 END) AS transfers
                       FROM budgetLine
                       WHERE idBudget = ?`, [1, 0, 0, "savingTransfer", id])
    }

    static async duplicate(id) {
        const db = await Database;
        const currentTimestamp = Database.currentTimestamp();

        const stmt = await db.run(`INSERT INTO budget (label, inUse, addedAt, updatedAt)
                                   SELECT label || " copie", ?, ?, ?
                                   FROM budget
                                   WHERE id = ?`, [0, currentTimestamp, currentTimestamp, id]);
        return db.run(`INSERT INTO budgetLine (idBudget, label, amount, isIncome, dayOfMonth, operationKind, categories,
                                               color, \`order\`, addedAt, updatedAt)
                       SELECT ?,
                              label,
                              amount,
                              isIncome,
                              dayOfMonth,
                              operationKind,
                              categories,
                              color,
                              \`order\`,
                              ?,
                              ?
                       FROM budgetLine
                       WHERE idBudget = ?`, [stmt.lastID, currentTimestamp, currentTimestamp, id]);
    }

    static async reorder(id, newOrder) {
        const db = await Database;
        const currentTimestamp = Database.currentTimestamp();
        await Promise.all(newOrder.map((id, i) => {
            return db.run(`UPDATE budgetLine
                           SET \`order\`=?,
                               updatedAt=?
                           WHERE id = ?`, [i + 1, currentTimestamp, id]);
        }));

        return {message: "done"};
    }

    static async getUsage(id, month = null) {
        const db = await Database;
        if (!id) {
            id = (await db.get(`SELECT id
                                FROM budget
                                WHERE inUse = ?`, [1])).id;
        }
        if (!id) {
            return {};
        }

        const budgetLines = await db.all(`SELECT *
                                          FROM budgetLine
                                          WHERE idBudget = ?`, [id]);
        const categories = {};
        budgetLines.forEach(l => {
            (l.categories || "").split('|').forEach(c => {
                c = c === "" ? "Sans catégorie Linxo" : c;
                if (!categories[c]) {
                    categories[c] = {expected: 0, total: 0, calendar: [], isIncome: l.isIncome, color: l.color};
                }
                const amount = l.isIncome ? l.amount : -l.amount;
                categories[c].expected += amount;
                categories[c].calendar.push({dayOfMonth: l.dayOfMonth, amount});
            });
        });
        categories.off = {expected: 0, total: 0, calendar: [], isIncome: false};

        const from = moment.utc(month ? `${month}-01` : undefined).startOf('month');
        let to = moment.utc(month ? `${month}-01` : undefined).endOf('month');

        if (from.unix() === moment.utc().startOf('month').unix() && to.unix() > moment.utc().unix()) {
            to = moment.utc();
        }

        const conditions = await Accounts.conditions();

        const conditionDeferredCard = conditions.deferredCard ? `OR (${conditions.deferredCard.join(' OR ')})` : "";
        const rawData = (await db.all(`SELECT category, SUM(amount) AS total
                                      FROM rawData
                                      WHERE date BETWEEN ? AND ?
                                        AND category NOT IN (?)
                                        AND (${conditions.checks.join(' OR ')}
                                        ${conditionDeferredCard})
                                        GROUP BY category`, [Database.unixToDbDate(from.unix()), Database.unixToDbDate(to.unix()), "Prél. carte débit différé"])).filter(d => d.total !== 0);
        rawData.forEach(d => {
            if (categories[d.category] !== undefined) {
                categories[d.category].total += d.total;
            } else {
                categories.off.total += d.total;
            }
        });

        Object.keys(categories).forEach(k => {
            const currentExpected = categories[k].calendar
                .filter(e => e.dayOfMonth <= to.date())
                .reduce((a, e) => a + e.amount, 0);

            categories[k].isLightWarning = !categories[k].isIncome && (currentExpected !== 0 && categories[k].total === 0);
            categories[k].hasWarning = (!categories[k].isIncome && ((currentExpected - categories[k].total > 1) || categories[k].isLightWarning))
                || (categories[k].isIncome && currentExpected > 0 && categories[k].total - currentExpected < 1);

            categories[k].displayCalendar = categories[k].calendar
                .map(e => e.dayOfMonth)
                .filter((value, index, self) => self.indexOf(value) === index)
                .filter(e => e > to.date());
            categories[k].displayCalendar.sort();
        });

        return categories;
    }

    static async getUsageDetails(id, category, month = null) {
        const db = await Database;

        if (category === "Sans catégorie Linxo") {
            category = "";
        }

        if (!id) {
            id = (await db.get(`SELECT id
                                FROM budget
                                WHERE inUse = ?`, [1])).id;
        }

        let budgetCategories = [];
        const budgetLines = (await db.all(`SELECT *
                                           FROM budgetLine
                                           WHERE idBudget = ?`, [id]))
            .map(l => {
                if (l.categories.length) {
                    budgetCategories.push(l.categories);
                }
                l.categories = (l.categories || "").split('|');

                if (!l.isIncome) {
                    l.amount = -l.amount;
                }
                return l;
            }).filter(l => l.categories.indexOf(category) !== -1);
        budgetCategories = budgetCategories.join("|").split("|").filter((value, index, self) => self.indexOf(value) === index);

        const from = moment.utc(month ? `${month}-01` : undefined).startOf('month');
        let to = moment.utc(month ? `${month}-01` : undefined).endOf('month');

        if (from.unix() === moment.utc().startOf('month').unix() && to.unix() > moment.utc().unix()) {
            to = moment.utc();
        }

        const conditions = await Accounts.conditions();

        const conditionDeferredCard = conditions.deferredCard ? `OR (${conditions.deferredCard.join(' OR ')})` : "";
        let data = [];

        if (category === "off") {
            budgetCategories.push("Prél. carte débit différé");
            data = (await db.all(`SELECT *
                                      FROM rawData
                                      WHERE \`date\` BETWEEN ? AND ?
                                        AND category NOT IN (${budgetCategories.map(() => "?").join(', ')})
                                        AND (${conditions.checks.join(' OR ')}
                                        ${conditionDeferredCard})
                                      ORDER BY date DESC`, [Database.unixToDbDate(from.unix()), Database.unixToDbDate(to.unix()), ...budgetCategories])).filter(d => d.total !== 0);
        } else {
            data = (await db.all(`SELECT *
                                      FROM rawData
                                      WHERE \`date\` BETWEEN ? AND ?
                                        AND category = ?
                                        AND (${conditions.checks.join(' OR ')}
                                        ${conditionDeferredCard})
                                      ORDER BY date DESC`, [Database.unixToDbDate(from.unix()), Database.unixToDbDate(to.unix()), category])).filter(d => d.total !== 0);
        }

        return {budgetLines, data};
    }
}
