const router = require('express').Router();

router.get('/', async (req, res) => {
    res.json(await Accounts.list());
});

module.exports = router;

const {Database} = require('../../core');
const sha1 = require('sha1');

class Accounts {
    static async list() {
        const db = await Database;
        const rawAccounts = await db.all(`SELECT DISTINCT accountName, connectionName
                                          FROM rawData`);
        rawAccounts.forEach(a => {
            a.id = sha1(a.accountName + a.connectionName)
        });

        return rawAccounts;
    }
}