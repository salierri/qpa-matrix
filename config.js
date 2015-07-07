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
    reallocateTimer: 30000
};
module.exports = config;
