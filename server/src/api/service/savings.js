const router = require('express').Router();

router.get('/totals', async (req, res) => {
    res.json(await Savings.getTotals());
});
router.get('/total/:id', async (req, res) => {
    res.json(await Savings.getTotal(req.params.id));
});
router.get('/budget_lines', async (req, res) => {
    res.json(await Savings.getBudgetLines());
});

module.exports = router;

const {Database} = require('../../core');
const {Accounts} = require('../../core/helpers');

class Savings {
    static async getTotals() {
        const db = await Database;
        const conditions = await Accounts.conditions();
        const amountReal = (await db.get(`SELECT SUM(amount) as amount
                                      FROM rawData
        WHERE (${conditions.savings.join(' OR ')})`)).amount;

        const amountInApp = (await db.get(`SELECT (SUM(amountIncomes) - SUM(amountExpenses)) as amount
                                           FROM savingLine`)).amount;

        return {real: amountReal, inApp: amountInApp};
    }

    static async getTotal(idSaving) {
        const db = await Database;
        return db.get(`SELECT SUM(amountIncomes) - SUM(amountExpenses) AS amount
                       FROM savingLine
                       WHERE idSaving = ?`, [idSaving]);
    }

    static async getBudgetLines() {
        const db = await Database;
        return db.all(`SELECT bl.id,bl.label,b.label AS budgetLabel
                       FROM budgetLine bl
                              JOIN budget b ON b.id = bl.idBudget
                       WHERE bl.operationKind = ?
                         AND bl.id NOT IN (SELECT idBudgetLine FROM saving)`, ["savingTransfer"]);
    }
}