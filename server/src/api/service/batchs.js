const router = require('express').Router();

router.get('/linxo-importer', async (req, res) => {
    (async () => {
        try {
            let linxoImporter = require("../../batchs/linxo-importer");
            await linxoImporter();
            linxoImporter = undefined;
            if (global.gc) {
                global.gc();
            }
        } catch (e) {
            console.error(e);
        }
    })();
    res.json({message: "Batch linxo-importer started."});
});

module.exports = router;
