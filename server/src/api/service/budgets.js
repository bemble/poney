const moment = require("moment");
const router = require('express').Router();

const Accounts = require('../../core/helpers/Accounts');

router.post('/set_in_use/:id', async (req, res) => {
    res.json(await Budgets.setInUse(req.params.id));
});

router.post('/duplicate/:id', async (req, res) => {
    res.json(await Budgets.duplicate(req.params.id));
});

router.get('/totals/:id', async (req, res) => {
    res.json(await Budgets.getTotals(req.params.id));
});

router.get('/usage/:id*?', async (req, res) => {
    res.json(await Budgets.getUsage(req.params.id));
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

    static async getUsage(id) {
        const db = await Database;
        if (!id) {
            id = (await db.get(`SELECT id
                                FROM budget
                                WHERE inUse = ?`, [1])).id;
        }

        const budgetLines = await db.all(`SELECT *
                                          FROM budgetLine
                                          WHERE idBudget = ?`, [id]);
        const categories = {};
        budgetLines.forEach(l => {
            (l.categories || "").split('|').forEach(c => {
                c = c === "" ? "Sans catégorie Linxo" : c;
                if (!categories[c]) {
                    categories[c] = {expected: 0, total: 0, calendar: [], isIncome: l.isIncome};
                }
                const amount = l.isIncome ? l.amount : -l.amount;
                categories[c].expected += amount;
                categories[c].calendar.push({dayOfMonth: l.dayOfMonth, amount});
            });
        });
        categories.off = {expected: 0, total: 0, calendar: [], isIncome: false};

        const from = moment().startOf('month');
        let to = moment().endOf('month');

        if (from.unix() === moment().startOf('month').unix() && to.unix() > moment().unix()) {
            to = moment();
        }

        const conditions = await Accounts.conditions();

        const conditionDeferredCard = conditions.deferredCard ? `OR (${conditions.deferredCard.join(' OR ')})` : "";
        const rawData = (await db.all(`SELECT category, SUM(amount) AS total
                                      FROM rawData
                                      WHERE date BETWEEN ? AND ?
                                        AND (${conditions.checks.join(' OR ')}
                                        ${conditionDeferredCard})
                                        GROUP BY category`, [from.unix(), to.unix()])).filter(d => d.total !== 0);
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
            categories[k].hasWarning = (!categories[k].isIncome && currentExpected - categories[k].total > 1)
                || (categories[k].isIncome && categories[k].total - currentExpected < 1);

            categories[k].displayCalendar = categories[k].calendar
                .map(e => e.dayOfMonth)
                .filter((value, index, self) => self.indexOf(value) === index)
                .filter(e => e > to.date());
            categories[k].displayCalendar.sort();
        });

        return categories;
    }
}
