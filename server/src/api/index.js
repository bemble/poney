const router = require('express').Router();

const jwtDecode = require('jwt-decode');

["config"].forEach(publicApi => {
    router.use(`/public/${publicApi}`, require(`./${publicApi}`));
});
router.use('/database', require('./database'));
router.use('/service', require('./service'));

module.exports = router;

/*
const addHeaders = (res, statusCode) => {
    if (statusCode) {
        res.writeStatus(`${statusCode}`);
    }

    const headers = {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': '*',
        'content-type': 'application/json'
    };
    Object.entries(headers).forEach(e => res.writeHeader(e[0], e[1]));
};
const userCheck = (req) => {
    const bearer = req.getHeader('authorization');
    if (!bearer) {
        throw "No token";
    }

    const decodedToken = jwtDecode(bearer.replace(/bearer\s+/i, ''));
    if (process.env.ALLOWED_EMAILS.split(',').indexOf(decodedToken.email) < 0) {
        throw "Not allowed";
    }
};

module.exports = {
    get: {
        '/config': async (res, req) => {
            let statusCode = null;
            let response = null;

            try {
                userCheck(req);
            } catch (e) {
                statusCode = 403;
                response = {message: e.message};
            }

            addHeaders(res, statusCode);
            if (!response) {
                response = await Config.getPublic();
            }
            return res.end(JSON.stringify(response));
        }
    }
};

/*
module.exports = (socket) => {
    ["database", "service", "config"].forEach(api => {
        socket.on(api, async (event) => {
            let ok = false;
            let data = null;
            try {
                if (api !== "config" && event.type === "getPublic") {
                    if (!event.token) {
                        throw "No token";
                    }
                    const decodedToken = jwtDecode(event.token);
                    if (process.env.ALLOWED_EMAILS.split(',').indexOf(decodedToken.email) < 0) {
                        throw "Not allowed";
                    }
                }

                const Api = require(`./${api}`);
                data = await Api[event.type](event);
                ok = true;
            } catch (e) {
                console.error(e);
                data = {message: e.message};
            }
            socket.emit(`${api}-${event.id}`, {ok, data});
        });
    });
};
*/