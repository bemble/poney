const router = require('express').Router();
const {Model, Tools, Tokens} = require('../core');
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
        const decoded = jwt.verify(token, Tokens.SECRET, {issuer: Tokens.ISSUER, audience: Tokens.AUDIENCES.RENIEW_TOKEN});

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

        const access_token = jwt.sign({email}, Tokens.SECRET, {
            expiresIn: "15m",
            issuer: "Poney",
            audience: Tokens.AUDIENCES.ACCESS_RESOURCES
        });
        const refresh_token = jwt.sign({publicId: user.publicId}, Tokens.SECRET, {
            expiresIn: "6h",
            issuer: "Poney",
            audience: Tokens.AUDIENCES.RENIEW_TOKEN
        });
        return {access_token, refresh_token};
    }
}