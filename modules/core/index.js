var http = require('http');
var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var _ = require("lodash");
var bodyparser = require("body-parser");
var _index = require("../../routes/index.js");
var requestlogger = require("../middlewares/requestlogger");

var json_only = function(req, res, next) {
        res.setHeader("Content-Type", "application/json");
        next();
    };

exports.createCore = function(dal, config) {
    GLOBAL.dal = dal;
    GLOBAL.config = config;


    //Initial Express setup
    app.use(requestlogger.logrequest(config));
    app.use(json_only);
    app.set('port', config.port);
    app.use(bodyparser.json());

    app.use(bodyparser.urlencoded({extended: true}));

    app.use(_index(dal));

    http.createServer(app).listen(app.get('port'), function() {
        console.log("Core started on port " + app.get('port'));
    });
};
