const router = require('express').Router();

router.get('/', async (req, res) => {
    return res.json(Config.getPublic());
});

module.exports = router;

class Config {
    static getPublic() {
        return {
            GOOGLE_SIGNIN_CLIENT_ID: process.env.GOOGLE_SIGNIN_CLIENT_ID
        };
    }
}