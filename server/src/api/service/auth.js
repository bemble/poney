const router = require('express').Router();

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_SIGNIN_CLIENT_ID);

router.get('/check', async(req, res) => {
    res.json(await Auth.check(req.header('Authorization').replace(/bearer\s+/i, '')));
});

module.exports = router;

class Auth {
    static async check(token) {
        const ticket = await client.verifyIdToken({
            idToken: token
        });
        const payload = ticket.getPayload();
        const response = {
            isAllowed: Auth.isAllowed(payload.email)
        };
        if(response.isAllowed) {
            response.tokenId = token;
        }
        return response;
    }

    static isAllowed(email) {
        return process.env.ALLOWED_EMAILS.split(',').indexOf(email) >= 0;
    }
}
