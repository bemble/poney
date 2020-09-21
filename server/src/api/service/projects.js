const router = require('express').Router();

router.get('/remaining', async (req, res) => {
    res.json(await Projects.remaining());
});

router.get('/summaries', async (req, res) => {
    res.json(await Projects.summariesList());
});

router.get('/totals/:id', async (req, res) => {
    res.json(await Projects.getTotals(req.params.id));
});

module.exports = router;

const {Database} = require('../../core');

class Projects {
    static async summariesList() {
        const db = await Database;
        return db.all(`SELECT p.*,
                              (SELECT SUM(pl.amount) FROM projectLine pl WHERE pl.idProject = p.id) AS amount,
                              (SELECT SUM(pl.alreadyPaidAmount)
                               FROM projectLine pl
                               WHERE pl.idProject = p.id)                                           AS alreadyPaid,
                              (SELECT SUM(pl.expectedAmount)
                               FROM projectLine pl
                               WHERE pl.idProject = p.id)                                           AS expected
                       FROM project p
                       ORDER BY p.hidden ASC, p.endAt DESC, p.addedAt DESC`)
            .then(summaries => {
                summaries.forEach(s => {
                    s.endAt = Database.dbDateToUnix(s.endAt);
                    s.addedAt = Database.dbDateToUnix(s.addedAt);
                    s.updatedAt = Database.dbDateToUnix(s.updatedAt);
                });
                return summaries;
            });
    }

    static async remaining() {
        const db = await Database;
        return db.get(`SELECT COALESCE((SUM(expectedAmount) - SUM(alreadyPaidAmount) - SUM(amount)), 0) AS amount
                       FROM projectLine
                       WHERE idProject IN (SELECT id FROM project WHERE endAt >= ?)`, ["CURRENT_TIMESTAMP"]);
    }

    static async getTotals(id) {
        const db = await Database;
        return db.get(`SELECT
                         SUM(amount)            AS amount,
                         SUM(expectedAmount)    AS expected,
                         SUM(alreadyPaidAmount) AS alreadyPaid
                       FROM projectLine
                       WHERE idProject = ?`, [id])
    }
}