var _ = require('lodash');
var express = require('express');
var router = express.Router();

module.exports = function (dal) {

    router.post('/keepalive', function (req, res) {
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
                    doc.lastUpdate = Date.now();
                    doc.save(function (err, doc) {
                    	res.send(JSON.stringify({status: "success"}));
                    })
                }
            });
        }
    });

    router.post('/drop', function (req, res) {
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
                		dal.Pixel.update({_id: doc._pixel}, {reserved: false}, function (err, doc) {
                			console.log(err);
                			console.log(doc);
                		});
                	}
                    doc.remove(function (err, doc) {
                    	res.send(JSON.stringify({status: "success"}));
                    });
                }
            });
        }
    });

    return router;
}