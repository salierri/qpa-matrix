var _ = require("lodash");
    config = require('./config');

var cluster = require('cluster');

var data_access_layer = require('./models/dal/mongodb');
var dal = new data_access_layer(config);

if (cluster.isMaster) {
    process.on('uncaughtException', function(error) {
        console.log("Uncaught exception in master thread. Sending message to raygun, and terminating in "+ terminateTimeout+ " ms.");
        console.log(error);
        setTimeout(function () {
            console.log("Exiting master.");
            process.exit(1);
        }, 3000);
    });
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