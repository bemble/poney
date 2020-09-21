const router = require('express').Router();

router.get('/', async (req, res) => {
    return res.json(Config.getPublic());
});

module.exports = router;

class Config {
    static getPublic() {
        return {
            apiVersion: process.env.APP_ENVIRONMENT !== "dev" ? require("../../package").version : "dev"
        };
    }
}