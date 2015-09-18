var _ = require("lodash");
    config = require('./config');

var cluster = require('cluster');

var _kick_users = require("./modules/timed_tasks/kick_users");
var _autocolor = require("./modules/timed_tasks/autocolor");

var data_access_layer = require('./models/dal/mongodb');
var dal = new data_access_layer(config);
var log = require("./modules/log");

if (cluster.isMaster) {
    process.on('uncaughtException', function(error) {
        console.log("Uncaught exception in master thread. Terminating in 3 s.");
        console.log(error);
        setTimeout(function () {
            console.log("Exiting master.");
            process.exit(1);
        }, 3000);
    });

    GLOBAL.log = log(dal, config);
    _kick_users(dal, config);
    _autocolor(dal, config);

    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

} else {
    var zcore = require("./modules/core");
    zcore.createCore(dal, config);
    if (!process.env.SINGLEPROC) {
        process.on('uncaughtException', function(error) {
            console.log("Uncaught exception in worker thread. Notifying master, and terminating.");
            console.log(error);

            process.exit(1);
        });
    }
}