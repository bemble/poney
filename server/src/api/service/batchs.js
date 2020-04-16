const router = require('express').Router();
const spawn = require('child_process').spawn;
const fs = require('fs');

router.get('/linxo-importer', async (req, res) => {
    const params = [fs.realpathSync(`${__dirname}/../../../scripts/launch-batch.js`), 'linxo-importer'];
    spawn('node', params, {stdio: 'ignore', detached: true});
    res.json({message: params.join(' ') + " started."});
});

module.exports = router;
