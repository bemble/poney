const router = require('express').Router();
const {Model, Configuration} = require('../core');
const _ = require('lodash');

// List
router.get('/:tableName', async (req, res) => {
    const jsonQuery = {
        $from: _.chain(req.params.tableName).camelCase().value(),
    };

    try {
        const models = await Model.getAll(jsonQuery);
        return res.json(models);
    } catch (e) {
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
            if (req.params.tableName !== "configuration" || Configuration.defaultValue[id] === undefined) {
                return res.status(404).json(null);
            }
            return res.json({id, value: Configuration.defaultValue[id], isDefaultValue: true})
        }
        return res.json(model);
    } catch (e) {
        return res.status(500).json({message: "An error occurred", details: e.message})
    }
});

// Add One
router.post('/:tableName', async (req, res) => {
    const jsonQuery = {
        $table: _.chain(req.params.tableName).camelCase().value(),
        $documents: req.body
    };

    try {
        const model = await Model.insert(jsonQuery);
        return res.json(model);
    } catch (e) {
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

        const model = await Model.update(jsonQuery);
        return res.json(model);
    } catch (e) {
        return res.status(500).json({message: "An error occurred", details: e.message})
    }
});

// Delete One
router.delete('/:tableName/:id', async (req, res) => {
    let field = (req.query.field ? req.query.field : false) || "id";

    const jsonQuery = {
        $from: _.chain(req.params.tableName).camelCase().upperFirst().value(),
        $where: {
            [field]: req.params.id
        }
    };

    try {
        await Model.delete(jsonQuery);
        return res.status(204).send();
    } catch (e) {
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
        const models = await Model.getAll(jsonQuery);
        return res.json(models);
    } catch (e) {
        return res.status(500).json({message: "An error occurred", details: e.message})
    }
});

module.exports = router;