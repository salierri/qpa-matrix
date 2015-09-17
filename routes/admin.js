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

    return router;
}