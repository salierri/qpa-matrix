var _ = require('lodash');
var express = require('express');
var router = express.Router();

module.exports = function (dal) {

    router.get('/', function (req, res) {
    	new dal.User({hasPixel: false}).save(function (err, doc) {
        	res.send(JSON.stringify({ok: true}));
    	})
    });

    return router;
}