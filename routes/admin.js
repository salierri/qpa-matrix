var _ = require('lodash');
var express = require('express');
var router = express.Router();
var admincheck = require('../modules/middlewares/admincheck');

module.exports = function (dal, config, reallocator) {

    router.post('/', admincheck, function (req, res) {
        res.send(JSON.stringify({status: 'success'}));
    });

    router.get('/stats', admincheck, function (req, res) {
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

    router.post('/log', function (req, res) {
        var log = req.body.log;
        var session = req.body.session;
        console.log('Frontend log for session ' + session + ":" + log);
        res.send(JSON.stringify({status: 'success'}));
    });

    return router;
}