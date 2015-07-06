var _ = require('lodash');

var models = require('../models');

module.exports = function(config) {
    var mongoose = require('mongoose-q')();

    mongoose.connection.on('error', function(error) {
        console.log("MongoDb threw an exception:" + error);
        throw error;
    });

    mongoose.connect(config.mongo.path, {
        db: {
            native_parser: true
        },
        server: {
            auto_reconnect: true
        }
    }, function(err) {
        if (err) {
            console.log("MongoDB connection can not be established. Error: " + err);
            throw err;
        }
    });

    var model = models(mongoose);
    var ret = mongoose.models;

    ret.mongoose = mongoose;
    ret.config = config;

    return ret;
};