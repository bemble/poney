const Database = require('../../core/Database');

class Accounts {
    static async conditions() {
        if (!Accounts._conditions) {
            const db = await Database;
            Accounts._conditions = {checks: [], savings: [], deferredDebitCreditCard: []};
            await db.all(`SELECT *
                          FROM accountSetting`)
                .then(settings => {
                    settings.forEach(l => {
                        const query = `(accountName = "${l.accountName}" AND connectionName = "${l.connectionName}")`;
                        Accounts._conditions[l.usedFor].push(query);
                    });
                });
        }
        return Accounts._conditions;
    }
}

Accounts._conditions = null;

module.exports = Accounts;