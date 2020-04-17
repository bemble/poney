const router = require('express').Router();

router.post('/set_in_use/:id', async (req, res) => {
    res.json(await Budgets.setInUse(req.params.id));
});

router.post('/duplicate/:id', async (req, res) => {
    res.json(await Budgets.duplicate(req.params.id));
});

router.get('/totals/:id', async (req, res) => {
    res.json(await Budgets.getTotals(req.params.id));
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
}
