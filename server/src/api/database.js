const router = require('express').Router();
const {Model, Configuration, Tools} = require('../core');
const _ = require('lodash');

// List
router.get('/:tableName', async (req, res) => {
    const jsonQuery = {
        $from: _.chain(req.params.tableName).camelCase().value(),
    };

    try {
        const models = (await Model.getAll(jsonQuery)).map(e => {
            if (jsonQuery.$from === "users") {
                delete e.password;
            }
            return e;
        });
        return res.json(models);
    } catch (e) {
        console.error(e);
        return res.status(500).json({message: "An error occurred", details: e.message})
    }
});

// Get one
router.get('/:tableName/:id', async (req, res) => {
    let field = (req.query.field ? req.query.field : false) || "id";

    const id = req.params.id;
    const jsonQuery = {
        $from: _.chain(req.params.tableName).camelCase().value(),
        $where: {
            [field]: id
        }
    };

    try {
        const model = await Model.getOne(jsonQuery);
        if (!model) {
            if (jsonQuery.$from !== "configuration" || Configuration.defaultValue[id] === undefined) {
                return res.status(404).json(null);
            }
            return res.json({id, value: Configuration.defaultValue[id], isDefaultValue: true})
        }

        if (jsonQuery.$from === "users") {
            delete model.password;
        }
        return res.json(model);
    } catch (e) {
        console.error(e);
        return res.status(500).json({message: "An error occurred", details: e.message})
    }
});

// Add One
router.post('/:tableName', async (req, res) => {
    const jsonQuery = {
        $table: _.chain(req.params.tableName).camelCase().lowerFirst().value(),
        $documents: req.body
    };

    if (jsonQuery.$table === "users" && jsonQuery.$documents.password) {
        jsonQuery.$documents.password = Tools.getHashedPassword(jsonQuery.$documents.password);
    }

    try {
        const model = await Model.insert(jsonQuery);
        return res.json(model);
    } catch (e) {
        console.error(e);
        return res.status(500).json({message: "An error occurred", details: e.message})
    }
});

// Update One
router.patch('/:tableName/:id', async (req, res) => {
    let field = (req.query.field ? req.query.field : false) || "id";

    try {
        const jsonQuery = {
            $table: _.chain(req.params.tableName).camelCase().value(),
            $set: req.body,
            $where: {
                [field]: req.params.id
            }
        };

        if (jsonQuery.$table === "users" && jsonQuery.$set.password) {
            jsonQuery.$set.password = Tools.getHashedPassword(jsonQuery.$set.password);
        }

        const model = await Model.update(jsonQuery);
        return res.json(model);
    } catch (e) {
        console.error(e);
        return res.status(500).json({message: "An error occurred", details: e.message})
    }
});

// Delete One
router.delete('/:tableName/:id', async (req, res) => {
    let field = (req.query.field ? req.query.field : false) || "id";

    const jsonQuery = {
        $from: _.chain(req.params.tableName).camelCase().value(),
        $where: {
            [field]: req.params.id
        }
    };

    try {
        await Model.delete(jsonQuery);
        return res.status(204).send();
    } catch (e) {
        console.error(e);
        return res.status(500).json({message: "An error occurred", details: e.message})
    }
});

// Search
router.post('/search/:tableName', async (req, res) => {
    const jsonQuery = {
        $from: _.chain(req.params.tableName).camelCase().value(),
        ...req.body
    };

    try {
        const models = (await Model.getAll(jsonQuery)).map(e => {
            if (jsonQuery.$from === "users") {
                delete e.password;
            }
            return e;
        });
        return res.json(models);
    } catch (e) {
        console.error(e);
        return res.status(500).json({message: "An error occurred", details: e.message})
    }
});

module.exports = router;