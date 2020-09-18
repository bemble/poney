const router = require('express').Router();
const {Model, Tools} = require('../core');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
    return res.json(await Auth.getToken(req.body));
});

router.get('/token', async (req, res) => {
    try {
        const bearer = req.header(`authorization`);
        if (!bearer) {
            throw new Error("No token");
        }
        const token = bearer.replace(/bearer\s+/i, '');
        const decoded = jwt.verify(token, Tools.getJwtSecret(), {issuer: "Poney", audience: "auth:renew-token"});

        return res.json(await Auth.getToken(decoded));
    } catch (e) {
        return res.status(401).json({message: e.message});
    }
});

module.exports = router;

class Auth {
    static async getToken({email, password, publicId}) {
        let user = null;
        if (email && password) {
            user = await Model.getOne({
                $from: "users",
                $where: {email}
            });
            if (user && Tools.getHashedPassword(password) !== user.password) {
                user = null;
            }
        } else if (publicId) {
            user = await Model.getOne({
                $from: "users",
                $where: {publicId}
            });
        }

        if (!user) {
            return null;
        }

        const access_token = jwt.sign({email}, Tools.getJwtSecret(), {
            expiresIn: "15m",
            issuer: "Poney",
            audience: "resources:access"
        });
        const refresh_token = jwt.sign({publicId: user.publicId}, Tools.getJwtSecret(), {
            expiresIn: "5d",
            issuer: "Poney",
            audience: "auth:renew-token"
        });
        return {access_token, refresh_token};
    }
}