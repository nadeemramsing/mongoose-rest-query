module.exports = function (ModelName) {

    var model = require('../util/model').model,
        getQuery = require('../').getQuery;

    function getModel(req) {
        return model(req, ModelName);
    }

    var list = function (req, res) {
        var Model = getModel(req);

        var query = {};

        if (req.query) {
            query = getQuery(req.query, Object.keys(Model.schema.paths));
        }

        Model
            .find(query.filter)
            .select(query.select)
            .populate(query.populate)
            .sort(query.sort)
            .limit(query.limit)
            .skip(query.skip)
            .exec(function (err, data) {
                if (err)
                    res.status(500).send(err);
                else
                    res.json(data);
            });
    };

    var count = function (req, res) {
        var Model = getModel(req);

        var query = {
            filter: {}
        };

        if (req.query) {
            query = getQuery(req.query, Object.keys(Model.schema.paths));
        }

        Model.count(query.filter, function (err, data) {
            if (err)
                res.status(500).send(err);
            else
                res.json(data);
        });

    };

    var create = function (req, res) {
        var Model = getModel(req);

        Model.create(req.body, function (err, data) {
            if (err)
                res.status(500).send(err);
            else
                res.status(201).send(data);

        });
    };

    var get = function (req, res) {
        var Model = getModel(req);

        var query = {};

        if (req.query) {
            query = getQuery(req.query, Object.keys(Model.schema.paths));
        }

        Model
            .findById(req.params.id)
            .select(query.select)
            .populate(query.populate)
            .exec(function (err, data) {
                if (err)
                    res.status(500).send(err);
                else if (data) {
                    res.status(200).send(data);
                } else {
                    res.status(404).send('Not found');
                }
            });
    };

    var update = function (req, res) {

        var Model = getModel(req);

        Model.findById(req.params.id, function (err, model) {

            for (var p in req.body) {
                if (req.body[p] == 'null')
                    model[p] = null;
                else
                    model[p] = req.body[p];
            }


            model.save(function (err, data) {
                if (err)
                    res.status(500).send(err);
                else {
                    Model.findById(data.id, function (err, m) {
                        if (err)
                            res.status(500).send(err);
                        else {
                            res.status(201).send(m);
                        }
                    });
                }
            });

        });

        //methods below do not trigger hook pre

        /*var option = {
            new: true
        };

        delete req.body._id;
        delete req.body.id;

        Model.findByIdAndUpdate(req.params.id, req.body, option, function (err, data) {
            if (err)
                res.status(500).send(err);
            else {
                res.status(201).send(data);
            }
        });*/

    };

    var deleteById = function (req, res) {

        var Model = getModel(req);

        Model.findByIdAndRemove(req.params.id, function (err) {
            if (err)
                res.status(500).send(err);
            else {
                res.status(204).send('Deleted');
            }
        });

    };

    var remove = function (req, res) {

        var Model = getModel(req);

        var query = {
            filter: {},
            sort: {},
            populate: ''
        };

        if (req.query) {
            query = getQuery(req.query, Object.keys(Model.schema.paths));
        }


        Model.remove(query.filter, function (err) {
            if (err)
                res.status(500).send(err);
            else {
                res.status(204).send('Deleted');
            }
        });

    };

    return {
        list: list,
        count: count,
        create: create,
        get: get,
        update: update,
        deleteById: deleteById,
        remove: remove
    };

};