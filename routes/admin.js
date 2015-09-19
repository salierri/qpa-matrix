var _ = require('lodash');
var express = require('express');
var router = express.Router();
var admincheck = require('../modules/middlewares/admincheck');

module.exports = function (dal, config, reallocator) {

    router.post('/', admincheck, function (req, res) {
        res.send(JSON.stringify({status: 'success'}));
    });

    router.get('/stats', admincheck, function (req, res) {
        log.verbose("Admin request for stats");
        dal.User.count({}, function (err, users) {
            dal.User.count({hasPixel: true}, function (err, usersWithPixels) {
                dal.User.count({hasPixel: false}, function (err, queueUsers) {
                    dal.Pixel.count({reserved: false}, function (err, emptyPixels) {
                        reallocator.when(function (when) {
                            res.send(JSON.stringify({
                                status: 'success',
                                userCount: users, 
                                usersWithPixels: usersWithPixels, 
                                usersInQueue: queueUsers,
                                emptyPixels: emptyPixels,
                                nextRealloc: when
                            }));
                        });
                    });
                });
            });
        });
    });

    router.post('/image', admincheck, function (req, res) {
        var image = req.body.image;
        log.info("Admin setting suggested image: " + image);
        if(image === 0) {
            dal.Pixel.update({}, {suggested: null}, {multi: true}, function (err, doc) {
                if(!err) {
                    res.send(JSON.stringify({status: 'success'}));
                }
            });
        } else {
            dal.Image.find({imageId: image}, function (err, doc) {
                var finish = _.after(doc.length, function () {
                    res.send(JSON.stringify({status: 'success'}));
                });
                console.log(doc.length);
                doc.forEach(function (element) {
                    dal.Pixel.findOneAndUpdate({x: element.x, y: element.y}, {suggested: element.color}, function (err, doc) {
                        finish();
                    });
                });
            });
        }
    });

    router.post('/reset', admincheck, function (req, res) {
        log.info("Admin reset");
        dal.User.find({hasPixel: true}, function (err, doc) {
            if(doc < 2) {
                res.send(JSON.stringify({status: 'success'}));
            }
            var done = _.after(doc.length, function () {
                res.send(JSON.stringify({status: 'success'}));
            });
            for(var i = 0; i < Math.floor(doc.length / 2); i++) {
                var swap = doc[i]._pixel;
                doc[i]._pixel = doc[doc.length - (i + 1)]._pixel;
                doc[doc.length - (i + 1)]._pixel = swap;
                dal.User.update({_id: doc[i]._id}, doc[i], function (err) {
                    done();
                });
                dal.User.update({_id: doc[doc.length - (i + 1)]._id}, doc[doc.length - (i + 1)], function (err) {
                    done();
                });
            }
        });
    });

    router.post('/log', function (req, res) {
        var frontendlog = req.body.log;
        if(!config.verbose) {
            log.info("Frontend log arrived, omitting.");
        }
        log.verbose('Frontend log:\n' + frontendlog);
        res.send(JSON.stringify({status: 'success'}));
    });

    return router;
}