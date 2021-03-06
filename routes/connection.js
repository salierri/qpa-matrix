var _ = require('lodash');
var express = require('express');
var router = express.Router();
var sessioncheck = require('../modules/middlewares/sessioncheck');

module.exports = function (dal, config, reallocator) {

    router.post('/keepalive', sessioncheck, function (req, res) {
    	log.verbose("User keepalive: " + req.user._id);
        req.user.lastUpdate = Date.now();
        req.user.save(function (err, doc) {
            reallocator.when(function (when) {
            	res.send(JSON.stringify({status: "success", hasPixel: req.user.hasPixel, nextRealloc: when}));
            });
        });
    });

    router.post('/drop', sessioncheck, function (req, res) {
    	log.info("Dropping user: " + req.user._id);
    	if(req.user.hasPixel) {
            log.verbose("Dropped user had pixel: " + req.user._pixel)
    		dal.Pixel.update({_id: req.user._pixel}, {reserved: false}, function (err, doc) {
    		});
    	}
        req.user.remove(function (err, doc) {
        	res.send(JSON.stringify({status: "success"}));
        });
    });

    return router;
}