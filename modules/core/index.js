var http = require('http');
var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var _ = require("lodash");
var bodyparser = require("body-parser");
var requestlogger = require("../middlewares/requestlogger");
var _index = require("../../routes/index");
var _pixels = require("../../routes/pixels");
var _connection = require("../../routes/connection");
var _admin = require("../../routes/admin");
var _reallocate = require("../timed_tasks/reallocate");

exports.createCore = function(dal, config) {
    GLOBAL.dal = dal;
    GLOBAL.config = config;
    var reallocator = _reallocate(dal, config);

    app.set('port', config.port);
    app.set('views', path.join(__dirname, '../../views'));
    app.use(express.static(path.join(__dirname, '../../public')));
    app.set('view engine', 'ejs');

    //Initial Express setup
    app.use(requestlogger.logrequest(config));
    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({extended: true}));


    app.use('/', _index(dal));
    app.use('/pixels', _pixels(dal, config, reallocator));
    app.use('/connection', _connection(dal, config, reallocator));
    app.use('/bfbadmin', _admin(dal, config, reallocator));

    http.createServer(app).listen(app.get('port'), function() {
        console.log("Core started on port " + app.get('port'));
    });
};
