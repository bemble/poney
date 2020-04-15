const router = require('express').Router();

const jwtDecode = require('jwt-decode');

const userCheck = (req, res, next) => {
    try {
        const bearer = req.header(`authorization`);
        if (!bearer) {
            throw new Error("No token");
        }

        const decodedToken = jwtDecode(bearer.replace(/bearer\s+/i, ''));
        if (process.env.ALLOWED_EMAILS.split(',').indexOf(decodedToken.email) < 0) {
            throw new Error("Not allowed");
        }

        next();
    } catch (e) {
        return res.status(401).json({message: e.message});
    }
};


["config"].forEach(publicApi => {
    router.use(`/public/${publicApi}`, require(`./${publicApi}`));
});
router.use('/database', userCheck, require('./database'));
router.use('/service', userCheck, require('./service'));

module.exports = router;