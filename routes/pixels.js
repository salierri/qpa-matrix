var _ = require('lodash');
var express = require('express');
var router = express.Router();

module.exports = function (dal, config) {

    router.get('/reserve', function (req, res) {
        (function reservePixel() {
            dal.Pixel.count({reserved: false}, function (err, doc) {
                var number = Math.floor(Math.random() * doc);
                dal.Pixel.find({reserved: false}).limit(-1).skip(number).exec(function (err, doc) {
                    if(err | !doc) {
                        console.log("Error during pixel randomization");
                        res.send(JSON.stringify({status: "error"}));
                    } else {
                        dal.Pixel.findOneAndUpdate({_id: doc[0]._id, reserved: false}, {reserved: true}, function (err, doc) {
                            if(err) {
                                res.send(JSON.stringify({status: "error"}));
                            }
                            if(!doc) {
                                reservePixel();    
                                console.log("Race condition!");
                            } else {
                                new dal.User({hasPixel: true, pixel:{x: doc.x, y: doc.y}}).save(function (err, user) {
                                    res.send(JSON.stringify({status: "reserved", pixel: {x: doc.x, y: doc.y}}));
                                })
                            }
                        });
                    }
                });
            });
        })();
    });

    return router;
}