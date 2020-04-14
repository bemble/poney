const router = require('express').Router();

const fs = require('fs');

fs.readdir(`${__dirname}`, (err, files) => {
    files.forEach(file => {
        if (["index.js", ".", ".."].indexOf(file) === -1) {
            router.use(`/${file.replace(/\.js$/, '')}`, require(`${__dirname}/${file}`));
        }
    });
});

module.exports = router;

/*
const SuiviApi = require("./suivi");
const SavingApi = require("./saving");
const AuthApi = require("./auth");

class ServiceApi {
    static async suivi(e) {
        return SuiviApi.get(e);
    }
    static async suiviDetails(e) {
        return SuiviApi.getDetails(e);
    }
    static async suiviTotals(e) {
        return SuiviApi.getTotals(e);
    }
    static async savingTotals(e) {
        return SavingApi.getTotals(e);
    }
    static async auth(e) {
        return AuthApi.check(e);
    }
}

module.exports = ServiceApi;*/