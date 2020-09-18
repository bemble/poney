const router = require('express').Router();
const {Tools} = require('../core');
const jwt = require('jsonwebtoken');

const userCheck = (req, res, next) => {
    try {
        const bearer = req.header(`authorization`);
        if (!bearer) {
            throw new Error("No token");
        }
        const token = bearer.replace(/bearer\s+/i, '');
        jwt.verify(token, Tools.getJwtSecret(), {issuer: "Poney", audience: "resources:access"});

        next();
    } catch (e) {
        return res.status(401).json({message: e.message});
    }
};


["auth", "config"].forEach(publicApi => {
    router.use(`/public/${publicApi}`, require(`./${publicApi}`));
});
router.use('/database', userCheck, require('./database'));
router.use('/service', userCheck, require('./service'));

module.exports = router;