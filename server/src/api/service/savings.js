const router = require('express').Router();
const moment = require("moment");
const {Model} = require("../../core");

router.get('/totals', async (req, res) => {
    res.json(await Savings.getTotals());
});
router.post('/dispatch', async (req, res) => {
    res.json(await Savings.dispatch());
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

    static async dispatch() {
        const {real, inApp} = await this.getTotals();
        const db = await Database;
        const savings = (await db.all(`SELECT saving.*, budgetLine.amount
                                       FROM saving
                                              JOIN budgetLine ON saving.idBudgetLine = budgetLine.id
                                       WHERE saving.isArchived = ?
                                       ORDER BY amount DESC`, [false]));

        let difference = real - inApp;
        if (difference > savings.map(({amount}) => amount).reduce((a, v) => a + v, 0)) {
            const month = moment.utc().format("YYYY-MM");
            await Promise.all(savings.map(async (saving) => {
                const line = (await db.get(`SELECT *
                                            FROM savingLine
                                            WHERE idSaving = ?
                                              AND month = ?`, [saving.id, month]));
                const newComment = `Versement mensuel (${moment().format("DD/MM HH:mm")}): ${saving.amount}`;
                if (line) {
                    await Model.update({
                        $table: "savingLine",
                        $set: {
                            amountIncomes: {$: {$coalesce: [`~~amountIncomes`, 0], $add: saving.amount}},
                            comment: {$concat: [{$coalesce: [{$concat: [`~~comment`, '\n']}, ""]}, newComment]}
                        },
                        $where: {
                            id: line.id
                        }
                    });
                } else {
                    await Model.insert({
                        $table: "savingLine",
                        $documents: {
                            month,
                            idSaving: saving.id,
                            amountIncomes: saving.amount,
                            amountExpenses: 0.0,
                            comment: newComment
                        }
                    });
                }
            }));
        }
        return {message: "success"};
    }

    static
    async getTotal(idSaving) {
        const db = await Database;
        return db.get(`SELECT SUM(amountIncomes) - SUM(amountExpenses) AS amount
                       FROM savingLine
                       WHERE idSaving = ?`, [idSaving]);
    }

    static
    async getBudgetLines() {
        const db = await Database;
        return db.all(`SELECT bl.id,bl.label,b.label AS budgetLabel
                       FROM budgetLine bl
                              JOIN budget b ON b.id = bl.idBudget
                       WHERE bl.operationKind = ?
                         AND bl.id NOT IN (SELECT idBudgetLine FROM saving)`, ["savingTransfer"]);
    }
}