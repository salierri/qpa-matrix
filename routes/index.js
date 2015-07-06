var _ = require('lodash');
var express = require('express');
var router = express.Router();

module.exports = function (dal) {

    router.get('/', function (req, res) {
        res.render('index', {});
    });

    return router;
}