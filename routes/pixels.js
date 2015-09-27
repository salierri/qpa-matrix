var _ = require('lodash');
var express = require('express');
var router = express.Router();
var sessioncheck = require('../modules/middlewares/sessioncheck');

module.exports = function (dal, config, reallocator) {

    router.get('/reserve', function (req, res) {
        (function reservePixel() {
            dal.Pixel.count({reserved: false}, function (err, emptyCount) {
                log.verbose("Request for pixel, empty pixels: " + emptyCount);
                if(emptyCount === 0) {
                    reallocator.needRealloc();
                    new dal.User({hasPixel: false}).save(function (err, user) {
                        reallocator.when(function (when) {
                            log.verbose("New user in queue: " + user._id + ", reallocation is in: " + when);
                            res.send(JSON.stringify({status: "queue", nextRealloc: when, session: user._id}));
                        });
                    });
                } else {
                    var number = Math.floor(Math.random() * emptyCount);
                    dal.Pixel.find({reserved: false}).limit(-1).skip(number).exec(function (err, doc) {
                        if(err | !doc) {
                            log.error("Error during pixel randomization");
                            res.send(JSON.stringify({status: "error"}));
                        } else {
                            var r = Math.floor(Math.random() * 255), g = Math.floor(Math.random() * 255), b = Math.floor(Math.random() * 255);
                            dal.Pixel.findOneAndUpdate({_id: doc[0]._id, reserved: false}, {reserved: true, color: {r: r, g: g, b: b}}, function (err, doc) {
                                if(err) {
                                    log.error("Error during pixel randomization");
                                    res.send(JSON.stringify({status: "error"}));
                                }
                                if(!doc) {
                                    reservePixel();    
                                    log.info("Race condition!");
                                } else {
                                    new dal.User({hasPixel: true, _pixel: doc._id}).save(function (err, user) {
                                        log.verbose("New user: " + user._id + " with pixel " + doc._id + " at position " + doc.x + "," + doc.y);
                                        var response = {status: "reserved", pixel: {x: doc.x, y: doc.y, color: {r: r, g: g, b: b}}, session: user._id};
                                        if(typeof doc.suggested.r == "number") {
                                            response.suggested = doc.suggested;
                                        }
                                        res.send(JSON.stringify(response));
                                    })
                                }
                            });
                        }
                    });
                }
            });
        })();
    });

    router.post('/', sessioncheck, function (req, res) {
        if(req.user.hasPixel) {
            dal.Pixel.findOne({_id: req.user._pixel}, function (err, pixel) {
                reallocator.when(function (when) {
                    log.verbose("User " + req.user._id + " asking for its pixel, it is: " + pixel._id);
                    var response = {status: "haspixel", nextRealloc: when, pixel: {x: pixel.x, y: pixel.y, color: pixel.color}};
                    if(typeof pixel.suggested.r == "number") {
                        response.suggested = pixel.suggested;
                    }
                    res.send(JSON.stringify(response));
                });
            });
        } else {
            reallocator.when(function (when) {
                log.verbose("User " + req.user._id + " asking for its pixel, reallocation is in: " + when);
                res.send(JSON.stringify({status: "queue", nextRealloc: when}));
            });
        }
    });

    router.post('/update', sessioncheck, function (req, res) {
        var color = req.body.color;
        if(!req.user.hasPixel) {
            reallocator.when(function (when) {
                log.verbose("User " + req.user._id + " trying to update, has no pixel, reallocation is in: " + when);
                res.send(JSON.stringify({status: "nopixel", nextRealloc: when}));
            });
        } else {
            dal.User.update({_id: req.user._id}, {lastUpdate: Date.now()}, function (err, doc){});
            dal.Pixel.findOne({_id: req.user._pixel}, function (err, doc) {
                log.verbose("User " + req.user._id + " color update: " + JSON.stringify(color));
                doc.color = color;
                doc.save(function (err) {
                    reallocator.when(function (when) {
                        var response = {status: "success", pixel: {x: doc.x, y: doc.y}, nextRealloc: when};
                        if(typeof doc.suggested.r == "number") {
                            response.suggested = doc.suggested;
                        }
                        res.send(JSON.stringify(response));
                    });
                });
            });
        }
    });

    router.get('/viewall', function (req, res) {
        dal.Pixel.find({}).lean().exec(function (err, doc) {
            doc.forEach(function (element, index) {
                delete doc[index]._id;
                delete doc[index].reserved;
            });
            res.send(JSON.stringify(doc));
        });
    });

    return router;
}