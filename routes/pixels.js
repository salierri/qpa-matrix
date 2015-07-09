var _ = require('lodash');
var express = require('express');
var router = express.Router();
var sessioncheck = require('../modules/middlewares/sessioncheck');

module.exports = function (dal, config, reallocator) {

    router.get('/reserve', function (req, res) {
        (function reservePixel() {
            dal.Pixel.count({reserved: false}, function (err, emptyCount) {
                if(emptyCount === 0) {
                    reallocator.needRealloc();
                    new dal.User({hasPixel: false}).save(function (err, user) {
                        res.send(JSON.stringify({status: "queue", nextRealloc: reallocator.when(), session: user._id}));
                    });
                } else {
                    var number = Math.floor(Math.random() * emptyCount);
                    dal.Pixel.find({reserved: false}).limit(-1).skip(number).exec(function (err, doc) {
                        if(err | !doc) {
                            console.log("Error during pixel randomization");
                            res.send(JSON.stringify({status: "error"}));
                        } else {
                            var r = Math.floor(Math.random() * 255), g = Math.floor(Math.random() * 255), b = Math.floor(Math.random() * 255);
                            dal.Pixel.findOneAndUpdate({_id: doc[0]._id, reserved: false}, {reserved: true, color: {r: r, g: g, b: b}}, function (err, doc) {
                                if(err) {
                                    console.log("Error during pixel randomization");
                                    res.send(JSON.stringify({status: "error"}));
                                }
                                if(!doc) {
                                    reservePixel();    
                                    console.log("Race condition!");
                                } else {
                                    new dal.User({hasPixel: true, _pixel: doc._id}).save(function (err, user) {
                                        res.send(JSON.stringify({status: "reserved", pixel: {x: doc.x, y: doc.y, color: {r: r, g: g, b: b}}, session: user._id}));
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
                res.send(JSON.stringify({status: "haspixel", pixel: {x: pixel.x, y: pixel.y, color: pixel.color}}));
            });
        } else {
           res.send(JSON.stringify({status: "queue", nextRealloc: reallocator.timer - Date.now()}))
        }
    });

    router.post('/update', sessioncheck, function (req, res) {
        var color = req.body.color;
        if(!req.user.hasPixel) {
            res.send(JSON.stringify({status: "nopixel", nextRealloc: reallocator.when()}));
        } else {
            dal.User.update({_id: req.user._id}, {lastUpdate: Date.now()}, function (err, doc){});
            dal.Pixel.findOne({_id: req.user._pixel}, function (err, doc) {
                doc.color = color;
                doc.save(function (err, doc) {
                    res.send(JSON.stringify({status: "success", nextRealloc: reallocator.when()}));
                });
            });
        }
    });

    return router;
}