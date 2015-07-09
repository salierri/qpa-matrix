var _ = require('lodash');
var express = require('express');
var router = express.Router();

module.exports = function (dal, config, reallocator) {

    router.get('/reserve', function (req, res) {
        (function reservePixel() {
            dal.Pixel.count({reserved: false}, function (err, emptyCount) {
                if(emptyCount === 0) {
                    reallocator.needRealloc();
                    new dal.User({haspixel: false}).save(function (err, user) {
                        res.send(JSON.stringify({status: "queue", nextRealloc: reallocator.timer - Date.now(), session: user._id}));
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

    router.post('/', function (req, res) {
        var user = req.body.session;
        if(!user) {
            res.send(JSON.stringify({status: "error"}));
            console.log("No session for the user");
        } else {
            dal.User.findOne({_id: user}, function (err, doc) {
                if(err || !doc) {
                    res.send(JSON.stringify({status: "error"}));
                    console.log("Invalid session");
                } else {
                    if(doc.hasPixel) {
                        dal.Pixel.findOne({_id: doc._pixel}, function (err, pixel) {
                            res.send(JSON.stringify({status: "haspixel", pixel: {x: pixel.x, y: pixel.y, color: pixel.color}}));
                        });
                    } else {
                       res.send(JSON.stringify({status: "queue", nextRealloc: reallocator.timer - Date.now()}))
                    }
                }
            });
        }
    })

    return router;
}