var config = {
    debug: process.env.NODE_ENV == "production" ? false : true,
    listen: "0.0.0.0",
    port: 8000,
    console_date_format: "YYYY-MM-DD HH:mm:ss",
    logrequests: true,
    mongo: {
        path: "mongodb://localhost/matrix",
    },
    size: {
        x: 5,
        y: 5
    },
    reallocateTimer: 20000,
    timeout: 600000,
    autocolor: {
        interval: 5000,
        volume: 0.2
    }
};
module.exports = config;
